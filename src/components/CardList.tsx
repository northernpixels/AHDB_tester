
import React, { useEffect, useState } from "react";
import { useExpansions } from "@/contexts/ExpansionContext";
import { useParams, useNavigate } from "react-router-dom";
import { ArkhamCard } from "@/types/arkham-types";
import { fetchCardsByFaction, getFactionName, getExpansions, Expansion } from "@/api/arkhamAPI";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingSpinner from "./LoadingSpinner";
import { processCardText } from "@/utils/textProcessing";
import { Home } from "lucide-react";

const CardList: React.FC = () => {
  const [cards, setCards] = useState<ArkhamCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nameFilter, setNameFilter] = useState<string>("");
  const { selectedExpansions, setSelectedExpansions } = useExpansions();
  const [xpFilter, setXpFilter] = useState<string>("");
  const [expansions, setExpansions] = useState<Expansion[]>([]);
  console.log('Current expansions state:', expansions);
  const [loadingExpansions, setLoadingExpansions] = useState<boolean>(true);
  const [expansionSearch, setExpansionSearch] = useState<string>("");
  const { faction, type } = useParams<{ faction: string; type: string }>();
  const navigate = useNavigate();

  // Load expansions once on mount
  useEffect(() => {
    const loadExpansions = async () => {
      try {
        setLoadingExpansions(true);
        const allExpansions = await getExpansions();
        console.log('Fetched expansions:', allExpansions);
        console.log('Expansion codes:', allExpansions.map(exp => `${exp.code} -> ${exp.name}`));
        setExpansions(allExpansions);
      } catch (err) {
        console.error('Error loading expansions:', err);
      } finally {
        setLoadingExpansions(false);
      }
    };

    loadExpansions();
  }, []); // Empty dependency array means this only runs once on mount

  // Load cards when faction or type changes
  useEffect(() => {
    console.log('CardList useEffect - faction:', faction, 'type:', type);
    const loadCards = async () => {
      if (!faction || !type) {
        console.log('Missing faction or type');
        return;
      }
      
      try {
        setLoading(true);
        
        console.log('Starting data fetch for faction:', faction);
        const allCards = await fetchCardsByFaction(faction);
        console.log('Fetched cards:', allCards.map(card => ({
          name: card.name,
          pack_code: card.pack_code,
          pack_name: card.pack_name,
          type_code: card.type_code
        })));
        // Debug log for pack codes
        const uniquePacks = new Set();
        allCards.forEach(card => {
          if (card.pack_code) uniquePacks.add(`${card.pack_code} -> ${card.pack_name}`);
        });
        console.log('Unique pack codes in cards:', Array.from(uniquePacks));
        
        // Filter by type and handle special cases
        let filteredCards = allCards.filter(card => {
          // For investigator type, only show investigators
          if (type === 'investigator') {
            return card.type_code === 'investigator';
          }
          // For other types, show cards of that type for the faction
          return card.type_code === type;
        });
        
        // Sort by name and XP
        filteredCards.sort((a, b) => {
          const nameCompare = a.name.localeCompare(b.name);
          if (nameCompare !== 0) return nameCompare;
          return (a.xp || 0) - (b.xp || 0);
        });

        console.log('Filtered cards:', filteredCards.length);
        setCards(filteredCards);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load data: ${errorMessage}`);
        console.error('Error in CardList:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, [faction, type]);

  const handleHome = () => {
    navigate('/');
  };

  console.log('Starting card filtering with:', {
    totalCards: cards.length,
    selectedExpansions: Array.from(selectedExpansions),
    nameFilter,
    xpFilter
  });

  // Debug the current state
  console.log('Current filtering state:', {
    totalCards: cards.length,
    selectedExpansions: Array.from(selectedExpansions),
    nameFilter,
    xpFilter
  });

  // Sample some cards to debug
  console.log('Sample of cards:', cards.slice(0, 3).map(card => ({
    name: card.name,
    pack_code: card.pack_code,
    pack_name: card.pack_name,
    type_code: card.type_code
  })));

  const filteredCards = cards.filter(card => {
    const nameMatch = card.name.toLowerCase().includes(nameFilter.toLowerCase());
    const packMatch = selectedExpansions.size === 0 || (card.pack_code && selectedExpansions.has(card.pack_code));
    const xpMatch = !xpFilter || (card.xp !== undefined && card.xp.toString() === xpFilter);
    
    // Debug each filter condition
    if (selectedExpansions.size > 0 && !packMatch) {
      console.log('Card filtered out by pack:', {
        name: card.name,
        pack_code: card.pack_code,
        selectedExpansions: Array.from(selectedExpansions)
      });
    }

    if (card.name === 'Roland Banks') {
      console.log('Roland Banks found:', {
        packMatch,
        nameMatch,
        xpMatch,
        cardPack: card.pack_code,
        cardPackName: card.pack_name,
        selectedExpansions: Array.from(selectedExpansions)
      });
    }
    
    return nameMatch && packMatch && xpMatch;
  });

  console.log('Filtering complete:', {
    totalCards: cards.length,
    filteredCards: filteredCards.length
  });

  if (!faction || !type) {
    navigate('/');
    return null;
  }

  // Function to get card details display
  const getCardDetails = (card: ArkhamCard) => {
    return (
      <div className="text-sm space-y-2">
        {/* Skills List */}
        {(card.skill_willpower !== undefined ||
          card.skill_intellect !== undefined ||
          card.skill_combat !== undefined ||
          card.skill_agility !== undefined) && (
          <div>
            <span className="font-semibold">Skills: </span>
            <span>
              {[{
                name: 'Willpower',
                value: card.skill_willpower
              }, {
                name: 'Intellect',
                value: card.skill_intellect
              }, {
                name: 'Combat',
                value: card.skill_combat
              }, {
                name: 'Agility',
                value: card.skill_agility
              }].filter(skill => skill.value !== undefined)
                .map((skill, index, arr) => (
                  <span key={skill.name}>
                    {skill.name}: {skill.value}
                    {index < arr.length - 1 ? ' ' : ''}
                  </span>
                ))}
            </span>
          </div>
        )}

        {/* Health and Sanity */}
        {(card.health !== undefined || card.sanity !== undefined) && (
          <div>
            <span className="font-semibold">Stats: </span>
            <span>
              {card.health !== undefined && `Health: ${card.health}`}
              {card.health !== undefined && card.sanity !== undefined && ' '}
              {card.sanity !== undefined && `Sanity: ${card.sanity}`}
            </span>
          </div>
        )}

        {/* Card Text */}
        {card.text && <p className="text-sm mt-2">{processCardText(card.text)}</p>}
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500 my-8">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/cards/${faction}`)}>
              <Home className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl font-bold">
              {getFactionName(faction)} {type === "investigator" ? "Investigators" : `${type.charAt(0).toUpperCase()}${type.slice(1)}s`}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="nameFilter">Filter by Name</Label>
            <Input
              id="nameFilter"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Search by name..."
            />
          </div>
          <div>
            <Label>Filter by Expansions</Label>
            <div className="max-h-96 overflow-y-auto border rounded p-2 space-y-2">
              <div className="sticky top-0 bg-white dark:bg-gray-900 p-2 -m-2 mb-2 border-b">
                <input
                  type="text"
                  placeholder="Search expansions..."
                  className="w-full px-2 py-1 text-sm border rounded"
                  value={expansionSearch}
                  onChange={(e) => setExpansionSearch(e.target.value)}
                />
              </div>
              {!loadingExpansions && expansions
                ?.filter(exp => exp.name.toLowerCase().includes(expansionSearch.toLowerCase()))
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((expansion) => (
                <div key={expansion.code} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`expansion-${expansion.code}`}
                    checked={selectedExpansions.has(expansion.code)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedExpansions);
                      if (e.target.checked) {
                        newSelected.add(expansion.code);
                      } else {
                        newSelected.delete(expansion.code);
                      }
                      setSelectedExpansions(newSelected);
                    }}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`expansion-${expansion.code}`} className="text-sm hover:text-blue-500 cursor-pointer">
                    {expansion.name}
                  </label>
                </div>
              ))}
              {loadingExpansions && <div className="text-sm">Loading expansions...</div>}
            </div>
          </div>
          <div>
            <Label htmlFor="xpFilter">Filter by XP</Label>
            <Input
              id="xpFilter"
              value={xpFilter}
              onChange={(e) => setXpFilter(e.target.value)}
              placeholder="Enter XP value..."
              type="number"
              min="0"
            />
          </div>
        </div>

        {filteredCards.length === 0 ? (
          <p className="text-center">No cards found matching the current filters.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredCards.map((card) => (
              <Card key={card.code} className="bg-card">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="w-full mx-auto">
                      {card.imagesrc ? (
                        <img 
                          src={`https://arkhamdb.com${card.imagesrc}`} 
                          alt={card.name}
                          className="w-full h-auto object-cover rounded-sm transform scale-100"
                        />
                      ) : (
                        <div className="bg-arkham-purple/20 h-96 flex items-center justify-center p-2 rounded-sm">
                          <span className="text-lg font-bold text-center">{card.name}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg">{card.name}</h3>
                        <div className="flex gap-2">
                          {card.cost !== undefined && (
                            <span className="bg-arkham-purple/10 px-2 py-1 rounded text-sm">💰 {card.cost}</span>
                          )}
                          {card.xp !== undefined && (
                            <span className="bg-arkham-purple/10 px-2 py-1 rounded text-sm">⭐ {card.xp}</span>
                          )}
                        </div>
                      </div>
                      {card.traits && (
                        <p className="text-sm text-gray-600 mb-2">{processCardText(card.traits)}</p>
                      )}
                      {getCardDetails(card)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardList;
