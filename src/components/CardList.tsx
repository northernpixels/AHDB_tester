import React, { useEffect, useState } from "react";
import { useExpansions } from "@/contexts/ExpansionContext";
import { useParams, useNavigate } from "react-router-dom";
import { ArkhamCard } from "@/types/arkham-types";
import { fetchCardsByFaction, getFactionName } from "@/api/arkhamAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from "./LoadingSpinner";
import { Home, ArrowLeft } from "lucide-react";
import { processCardText } from "@/utils/textProcessing";

const CardList: React.FC = () => {
  const { faction, type } = useParams<{ faction: string; type?: string }>();
  const navigate = useNavigate();
  const { selectedExpansions } = useExpansions();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<ArkhamCard[]>([]);
  const [nameFilter, setNameFilter] = useState('');
  const [xpFilter, setXpFilter] = useState('0');
  const [filteredCards, setFilteredCards] = useState<ArkhamCard[]>([]);
  const [hasXpCards, setHasXpCards] = useState(false);


  const handleHome = () => navigate('/');
  const handleBack = () => navigate(-1);

  useEffect(() => {
    const loadCards = async () => {
      if (!faction) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Loading cards for faction:', faction, 'type:', type);
        const allCards = await fetchCardsByFaction(faction);
        console.log('Total cards:', allCards.length);
        
        // Log any duplicate cards
        const cardsByName = new Map<string, ArkhamCard[]>();
        allCards.forEach(card => {
          if (!cardsByName.has(card.name)) {
            cardsByName.set(card.name, []);
          }
          cardsByName.get(card.name)!.push(card);
        });
        
        // Check for duplicates
        cardsByName.forEach((cards, name) => {
          if (cards.length > 1) {
            console.log('Duplicate found:', name);
            cards.forEach(card => {
              console.log('- Code:', card.code, 'Pack:', card.pack_name, 'XP:', card.xp);
            });
          }
        });

        // Filter out duplicates - keep only one version of each card
        // For investigators, only check name. For other cards, check name and XP
        const uniqueCards = allCards.filter((card, index, self) => 
          index === self.findIndex(c => {
            if (card.type_code === 'investigator') {
              return c.name === card.name;
            } else {
              return c.name === card.name && (c.xp ?? 0) === (card.xp ?? 0);
            }
          })
        );
        console.log('After removing duplicates:', uniqueCards.length);
        
        // Filter by type if specified
        const typeFilteredCards = type
          ? uniqueCards.filter(card => {
              console.log('Card type:', card.type_code, 'Looking for:', type);
              return card.type_code === type;
            })
          : uniqueCards;
        console.log('Filtered cards:', typeFilteredCards.length);

        // Sort cards by name (ignoring 'The' and special characters) and XP
        const sortedCards = typeFilteredCards.sort((a, b) => {
          // Clean names for comparison: remove 'The' prefix and special characters
          const cleanName = (name: string) => {
            return name
              .replace(/^The /, '') // Remove 'The ' prefix
              .replace(/[^a-zA-Z0-9 ]/g, '') // Remove special characters
              .toLowerCase();
          };
          
          const nameA = cleanName(a.name);
          const nameB = cleanName(b.name);
          
          if (nameA === nameB) {
            // If names are the same, sort by XP (default to 0)
            return (a.xp ?? 0) - (b.xp ?? 0);
          }
          return nameA.localeCompare(nameB);
        });
        // Check if any cards have XP values
        const hasCardsWithXp = sortedCards.some(card => card.xp !== undefined && card.xp > 0);
        setHasXpCards(hasCardsWithXp);
        setCards(sortedCards);
      } catch (err) {
        setError('Failed to load cards');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, [faction, type]);

  useEffect(() => {
    if (!faction) return;

    let filtered = [...cards];

    // Filter by selected expansions
    if (selectedExpansions.size > 0) {
      console.log('Selected expansions:', Array.from(selectedExpansions));
      filtered = filtered.filter(card => {
        const normalizedPackName = card.pack_name;
        console.log(`Card: ${card.name}, Pack: ${card.pack_name}`);
        const isIncluded = normalizedPackName && selectedExpansions.has(normalizedPackName);
        if (isIncluded) {
          console.log(`Including ${card.name} from ${normalizedPackName}`);
        }
        return isIncluded;
      });
    }

    // Filter by name
    if (nameFilter) {
      const searchTerm = nameFilter.toLowerCase();
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by XP
    if (xpFilter && type !== 'investigator') { // Don't apply XP filter to investigators
      const xp = parseInt(xpFilter);
      if (!isNaN(xp)) {
        filtered = filtered.filter(card => (card.xp ?? 0) === xp);
      }
    }

    setFilteredCards(filtered);
  }, [cards, nameFilter, xpFilter, selectedExpansions, faction]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500 my-8">{error}</div>;

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
        {card.text && (
          <div className="text-sm mt-2">
            {processCardText(card.text)
              .split('[elder sign]')
              .map((part, i, arr) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  {part}
                  {i < arr.length - 1 && '[elder sign]'}
                </React.Fragment>
              ))}
          </div>
        )}

        {/* Flavor Text */}
        {card.flavor && (
          <div className="text-sm mt-2 italic text-gray-600">
            {card.flavor}
          </div>
        )}

        {/* Pack Name */}
        {card.pack_name && (
          <div className="text-xs mt-2 text-gray-500">
            {card.pack_name}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 p-4">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button onClick={handleHome} variant="outline" size="icon" title="Home">
                <Home className="h-4 w-4" />
              </Button>
              <Button onClick={handleBack} variant="outline" size="icon" title="Back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`${hasXpCards ? 'col-span-1' : 'col-span-full'}`}>
            <Label htmlFor="nameFilter">Filter by Name</Label>
            <Input
              id="nameFilter"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Enter card name..."
            />
          </div>

          {hasXpCards && type !== 'investigator' && (
            <div>
              <Label htmlFor="xpFilter">Filter by XP</Label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    const currentXp = parseInt(xpFilter);
                    const newXp = currentXp <= 0 ? 5 : currentXp - 1;
                    setXpFilter(newXp.toString());
                  }}
                >
                  <span className="text-lg">-</span>
                </Button>
                <div className="w-12 text-center font-bold">{xpFilter}</div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    const currentXp = parseInt(xpFilter);
                    const newXp = currentXp >= 5 ? 0 : currentXp + 1;
                    setXpFilter(newXp.toString());
                  }}
                >
                  <span className="text-lg">+</span>
                </Button>
                {xpFilter !== '' && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setXpFilter('')}
                    title="Clear XP filter"
                  >
                    <span className="text-lg">×</span>
                  </Button>
                )}
              </div>
            </div>
          )}
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
                        <div>
                          <h3 className="font-bold text-lg">{card.name}</h3>
                          {card.type_code === 'investigator' && card.subname && (
                            <div className="text-sm text-gray-600 italic">{card.subname}</div>
                          )}
                        </div>
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
