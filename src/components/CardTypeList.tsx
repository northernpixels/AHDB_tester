import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchCardsByFaction } from "@/api/arkhamAPI";
import LoadingSpinner from "./LoadingSpinner";

interface CardTypeCount {
  type_code: string;
  type_name: string;
  count: number;
}

const CardTypeList: React.FC = () => {
  const navigate = useNavigate();
  const { faction, type } = useParams<{ faction: string; type: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [types, setTypes] = useState<CardTypeCount[]>([]);

  useEffect(() => {
    const loadTypes = async () => {
      if (!faction) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const cards = await fetchCardsByFaction(faction);

        // Count cards by type
        const typeCounts = new Map<string, CardTypeCount>();
        cards.forEach(card => {
          if (!card.type_code || !card.type_name) return;

          if (!typeCounts.has(card.type_code)) {
            typeCounts.set(card.type_code, {
              type_code: card.type_code,
              type_name: card.type_name,
              count: 0
            });
          }
          const typeCount = typeCounts.get(card.type_code)!;
          typeCount.count++;
        });

        // Convert to array and sort
        const sortedTypes = Array.from(typeCounts.values()).sort((a, b) => {
          if (a.type_code === 'investigator') return -1;
          if (b.type_code === 'investigator') return 1;
          return a.type_name.localeCompare(b.type_name);
        });

        setTypes(sortedTypes);
      } catch (err) {
        setError('Failed to load card types');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTypes();
  }, [faction]);

  if (!faction) return null;
  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500 my-4">{error}</div>;

  return (
    <div className="flex gap-2 overflow-x-auto py-4">
      {types.map((cardType) => (
        <Button
          key={cardType.type_code}
          variant={type === cardType.type_code ? 'default' : 'outline'}
          className="min-w-[120px] py-2 px-4"
          onClick={() => navigate(`/cards/${faction}/${cardType.type_code}`)}
        >
          <div className="text-center">
            {cardType.type_name}
          </div>
        </Button>
      ))}
    </div>
  );
};

export default CardTypeList;
