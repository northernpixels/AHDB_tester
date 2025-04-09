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
  const { faction, type } = useParams<{ faction: string; type: string }>();
  const navigate = useNavigate();
  const { selectedExpansions } = useExpansions();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<ArkhamCard[]>([]);
  const [nameFilter, setNameFilter] = useState('');
  const [xpFilter, setXpFilter] = useState('');
  const [filteredCards, setFilteredCards] = useState<ArkhamCard[]>([]);


  const handleHome = () => navigate('/');
  const handleBack = () => navigate(-1);

  useEffect(() => {
    const loadCards = async () => {
      if (!faction || !type) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const allCards = await fetchCardsByFaction(faction);
        const typeFilteredCards = allCards.filter(card => card.type_code === type);
        setCards(typeFilteredCards);
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
    let filtered = [...cards];

    if (selectedExpansions.size > 0) {
      filtered = filtered.filter(card => 
        card.pack_name && selectedExpansions.has(card.pack_name)
      );
    }

    if (xpFilter) {
      filtered = filtered.filter(card => {
        if (xpFilter === '0') return card.xp === 0;
        if (xpFilter === '1+') return card.xp && card.xp > 0;
        return true;
      });
    }

    if (nameFilter) {
      const searchTerm = nameFilter.toLowerCase();
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredCards(filtered);
  }, [cards, selectedExpansions, xpFilter, nameFilter]);

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
          <div>
            <Label htmlFor="nameFilter">Filter by Name</Label>
            <Input
              id="nameFilter"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Enter card name..."
            />
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
