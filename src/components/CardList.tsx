import React, { useEffect, useState } from "react";
import { useFilters } from "@/contexts/FilterContext";
import { useExpansions } from "@/contexts/ExpansionContext";
import { useParams, useNavigate } from "react-router-dom";
import { ArkhamCard } from "@/types/arkham-types";
import { fetchCardsByFaction, getFactionName } from "@/api/arkhamAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from "./LoadingSpinner";
import { Home, ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";
import { processCardText } from "@/utils/textProcessing";
import { findImagesForTerms } from "@/utils/imageUtils";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface CardListProps {
  faction: string;
  type?: string;
  onCardClick?: (card: ArkhamCard) => void;
}

const CardList: React.FC<CardListProps> = ({ faction, type, onCardClick }) => {
  const navigate = useNavigate();
  const { selectedExpansions } = useExpansions();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<ArkhamCard[]>([]);
  const [nameFilter, setNameFilter] = useState('');
  const { xpFilter, setXpFilter } = useFilters();
  const xpOptions = Array.from({ length: 6 }, (_, i) => i.toString());
  const [filteredCards, setFilteredCards] = useState<ArkhamCard[]>([]);
  const [hasXpCards, setHasXpCards] = useState(false);
  const [cardImages, setCardImages] = useState<Record<string, { term: string; url?: string }[]>>({});

  const handleHome = () => navigate('/');
  const handleBack = () => navigate(-1);

  useEffect(() => {
    const loadCards = async () => {
      if (!faction) {
        setCards([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedCards = await fetchCardsByFaction(faction);
        if (fetchedCards) {
          // Filter by type if specified
          if (type) {
            const typeFiltered = fetchedCards.filter(card => {
              if (type === 'investigator') {
                return card.type_code === 'investigator';
              } else {
                return card.type_code !== 'investigator';
              }
            });
            setCards(typeFiltered);
          } else {
            setCards(fetchedCards);
          }
          setError(null);
        } else {
          setCards([]);
          setError('No cards found');
        }
      } catch (err) {
        setCards([]);
        setError(err instanceof Error ? err.message : 'Failed to load cards');
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, [faction, type]);

  // Helper function to normalize card names for sorting
  const normalizeCardName = (name: string) => {
    return name
      .replace(/^The\s+/i, '') // Remove 'The ' from the start (case insensitive)
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .toLowerCase();
  };

  useEffect(() => {
    if (!faction || cards.length === 0) {
      setFilteredCards([]);
      return;
    }

    let filtered = [...cards].sort((a, b) => {
      const nameA = normalizeCardName(a.name);
      const nameB = normalizeCardName(b.name);
      
      if (nameA === nameB) {
        // If names are the same after normalization, sort by XP
        return (a.xp ?? 0) - (b.xp ?? 0);
      }
      return nameA.localeCompare(nameB);
    });

    // Filter by selected expansions
    if (selectedExpansions.size > 0) {
      filtered = filtered.filter(card => selectedExpansions.has(card.pack_code));
    }

    // Filter by name
    if (nameFilter) {
      const searchTerm = nameFilter.toLowerCase();
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(searchTerm)
      );
    }

    // Check if there are any cards with XP
    const hasXP = filtered.some(card => (card.xp ?? 0) > 0);
    setHasXpCards(hasXP);

    // Filter by XP
    if (xpFilter && type !== 'investigator') { // Don't apply XP filter to investigators
      const xp = parseInt(xpFilter);
      if (!isNaN(xp)) {
        filtered = filtered.filter(card => (card.xp ?? 0) === xp);
      }
    }

    setFilteredCards(filtered);
  }, [cards, nameFilter, xpFilter, selectedExpansions, type, faction]);

  useEffect(() => {
    if (loading || filteredCards.length === 0) return;

    const loadImages = async () => {
      const newImages: Record<string, { term: string; url?: string }[]> = {};
      let hasNewImages = false;

      for (const card of filteredCards) {
        if (card.text && !cardImages[card.code]) {
          const processed = processCardText(card.text);
          if (processed.specialTerms.length > 0) {
            const images = await findImagesForTerms(processed.specialTerms, cards);
            if (images.length > 0) {
              newImages[card.code] = images;
              hasNewImages = true;
            }
          }
        }
      }

      if (hasNewImages) {
        setCardImages(prev => ({ ...prev, ...newImages }));
      }
    };

    loadImages();
  }, [filteredCards, cards, loading, cardImages]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500 my-8">{error}</div>;

  const getCardDetails = (card: ArkhamCard) => {
    return (
      <div className="text-sm space-y-2">
        {/* Cost */}
        {card.cost !== undefined && (
          <div>
            <span className="font-semibold">Cost: </span>
            <span>{card.cost}</span>
          </div>
        )}

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
        {card.text && (() => {
          const processed = processCardText(card.text);
          const cardId = card.code;
          
          return (
            <div 
              className="text-sm mt-2 cursor-pointer hover:bg-accent p-2 rounded-md transition-colors"
              onClick={() => onCardClick?.(card)}
            >
              <span 
                dangerouslySetInnerHTML={{ 
                  __html: processed.text.replace(/\*_([^*]+)_\*/g, '<strong><em>$1</em></strong>')
                }} 
              />
            </div>
          );
        })()}

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

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="nameFilter">Filter by Name</Label>
            <Input
              id="nameFilter"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Enter card name..."
            />
          </div>

          {/* XP Filter */}
          {hasXpCards && type !== 'investigator' && (
            <div className="w-auto">
              <Label htmlFor="xpFilter">Filter by XP</Label>
              <div className="flex items-center gap-1 mt-[2px]">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const currentXp = parseInt(xpFilter);
                    const newXp = currentXp < 5 ? currentXp + 1 : 5;
                    setXpFilter(newXp.toString());
                  }}
                  disabled={parseInt(xpFilter) >= 5}
                  className="h-8 w-8"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <div className="w-8 text-center font-semibold">{xpFilter}</div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const currentXp = parseInt(xpFilter);
                    const newXp = currentXp > 0 ? currentXp - 1 : 0;
                    setXpFilter(newXp.toString());
                  }}
                  disabled={parseInt(xpFilter) <= 0}
                  className="h-8 w-8"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
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
                          {card.xp !== undefined && (
                            <span className="bg-arkham-purple/10 px-2 py-1 rounded text-sm">{card.xp} XP</span>
                          )}
                        </div>
                      </div>
                      {card.traits && (
                        <p className="text-sm text-gray-600 mb-2">{processCardText(card.traits).text}</p>
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
