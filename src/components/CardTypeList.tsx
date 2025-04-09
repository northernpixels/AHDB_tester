import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCardTypes, getFactionName, fetchCardsByFaction } from "@/api/arkhamAPI";
import { Home, ArrowLeft } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import { useExpansions } from "@/contexts/ExpansionContext";

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

// Default card types that are always available
const defaultTypes: CardTypeGroup[] = [
  { type_code: 'investigator', type_name: 'Investigator', count: 0 },
  { type_code: 'asset', type_name: 'Asset', count: 0 },
  { type_code: 'event', type_name: 'Event', count: 0 },
  { type_code: 'skill', type_name: 'Skill', count: 0 },
  { type_code: 'treachery', type_name: 'Treachery', count: 0 },
  { type_code: 'enemy', type_name: 'Enemy', count: 0 }
];

const CardTypeList: React.FC = () => {
  const navigate = useNavigate();
  const { faction } = useParams<{ faction: string }>();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [types, setTypes] = useState<CardTypeGroup[]>(defaultTypes);
  const { selectedExpansions } = useExpansions();
  
  // Get the current type from the URL
  const pathParts = location.pathname.split('/');
  const currentType = pathParts[pathParts.length - 1] === faction ? 'investigator' : pathParts[pathParts.length - 1];

  useEffect(() => {
    const loadTypes = async () => {
      if (!faction) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Fetch all cards for this faction
        const allCards = await fetchCardsByFaction(faction);
        
        // Filter cards by selected expansions
        const filteredCards = selectedExpansions.size === 0 
          ? allCards
          : allCards.filter(card => card.pack_name && selectedExpansions.has(card.pack_name));

        // Group filtered cards by type
        const typeGroups = new Map<string, CardTypeGroup>();
        filteredCards.forEach(card => {
          if (!card.type_code || !card.type_name) return;
          
          if (!typeGroups.has(card.type_code)) {
            typeGroups.set(card.type_code, {
              type_code: card.type_code,
              type_name: card.type_name,
              count: 0
            });
          }
          const group = typeGroups.get(card.type_code)!;
          group.count++;
        });

        // Update counts in default types
        const updatedTypes = defaultTypes.map(defaultType => {
          const foundType = typeGroups.get(defaultType.type_code);
          return {
            ...defaultType,
            count: foundType ? foundType.count : 0
          };
        });

        // Sort with investigator first
        const sortedTypes = updatedTypes.sort((a, b) => {
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
  }, [faction, selectedExpansions]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500 my-8">{error}</div>;

  return (
    <div className="w-full">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {types.map((type) => (
          <div
            key={type.type_code}
            className={`flex-1 min-w-[120px] p-3 h-auto flex flex-col items-center gap-1 rounded-md border ${currentType === type.type_code ? 'bg-primary text-primary-foreground' : 'bg-background border-input hover:bg-accent hover:text-accent-foreground'} ${!faction ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => {
              if (!faction) return;
              navigate(`/cards/${faction}/${type.type_code}`);
            }}
          >
            <div className="font-bold text-sm">{type.type_name}</div>
            {faction ? (
              <div className="text-xs text-gray-500">{type.count} cards</div>
            ) : (
              <div className="text-xs text-gray-500">Select faction</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardTypeList;
