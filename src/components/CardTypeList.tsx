import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCardTypes, getFactionName } from "@/api/arkhamAPI";
import { Home } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

interface CardType {
  type_code: string;
  type_name: string;
  count: number;
}

interface CardTypeGroup {
  type_code: string;
  type_name: string;
  count: number;
}

const CardTypeList: React.FC = () => {
  const navigate = useNavigate();
  const { faction } = useParams<{ faction: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [types, setTypes] = useState<CardTypeGroup[]>([]);

  useEffect(() => {
    const loadTypes = async () => {
      if (!faction) return;
      
      try {
        setLoading(true);
        const cardTypes = await getCardTypes(faction);
        
        // Sort types with 'investigator' first, then alphabetically
        const sortedTypes = cardTypes.sort((a, b) => {
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

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500 my-8">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button onClick={() => navigate('/')} variant="outline" size="icon" title="Home">
            <Home className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold text-arkham-purple">
            {faction ? `${getFactionName(faction)} Cards` : "Cards"}
          </h2>
          <div className="w-10"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {types.map((type) => (
            <Button
              key={type.type_code}
              onClick={() => navigate(`/cards/${faction}/${type.type_code}`)}
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 hover:bg-arkham-purple/10"
            >
              <span className="text-lg font-semibold">{type.type_name}</span>
              <span className="text-sm text-gray-500">{type.count} cards</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardTypeList;
