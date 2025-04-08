
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArkhamCard } from "@/types/arkham-types";
import { fetchCardsByFaction, getFactionName } from "@/api/arkhamAPI";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "./LoadingSpinner";
import { processCardText } from "@/utils/textProcessing";

const CardList: React.FC = () => {
  const [cards, setCards] = useState<ArkhamCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nameFilter, setNameFilter] = useState<string>("");
  const [expansionFilter, setExpansionFilter] = useState<string>("");
  const [xpFilter, setXpFilter] = useState<string>("");
  const { faction, investigator, type } = useParams<{ faction: string; investigator: string; type: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCards = async () => {
      if (!faction || !type) return;
      
      try {
        setLoading(true);
        const allCards = await fetchCardsByFaction(faction);
        let filteredCards = allCards.filter(card => card.type_code === type);
        
        // Sort by name and XP
        filteredCards.sort((a, b) => {
          const nameCompare = a.name.localeCompare(b.name);
          if (nameCompare !== 0) return nameCompare;
          return (a.xp || 0) - (b.xp || 0);
        });

        setCards(filteredCards);
      } catch (err) {
        setError("Failed to load cards. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, [faction, type]);

  const handleBack = () => {
    navigate(`/cards/${faction}/${investigator}`);
  };

  const filteredCards = cards.filter(card => {
    const nameMatch = card.name.toLowerCase().includes(nameFilter.toLowerCase());
    const expansionMatch = !expansionFilter || (card.pack_name && card.pack_name.toLowerCase().includes(expansionFilter.toLowerCase()));
    const xpMatch = !xpFilter || (card.xp !== undefined && card.xp.toString() === xpFilter);
    return nameMatch && expansionMatch && xpMatch;
  });

  // Function to get card details display
  const getCardDetails = (card: ArkhamCard) => (
    <div className="text-sm space-y-2">
      <div className="flex flex-wrap gap-4">
        {card.cost !== undefined && <span>Cost: {card.cost}</span>}
        {card.xp !== undefined && <span>XP: {card.xp}</span>}
        {card.pack_name && <span>Pack: {card.pack_name}</span>}
      </div>

      <div className="flex flex-wrap gap-4">
        {card.health !== undefined && <span>Health: {card.health}</span>}
        {card.sanity !== undefined && <span>Sanity: {card.sanity}</span>}
      </div>
      
      <div className="flex gap-4">
        {card.skill_willpower !== undefined && <span>👁️ {card.skill_willpower}</span>}
        {card.skill_intellect !== undefined && <span>🧠 {card.skill_intellect}</span>}
        {card.skill_combat !== undefined && <span>👊 {card.skill_combat}</span>}
        {card.skill_agility !== undefined && <span>🦶 {card.skill_agility}</span>}
      </div>
      
      {card.traits && <p className="italic text-gray-400">{processCardText(card.traits)}</p>}
      {card.text && <p className="text-sm mt-2">{processCardText(card.text)}</p>}
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500 my-8">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button onClick={handleBack} variant="outline">Back to Card Types</Button>
          <h2 className="text-3xl font-bold text-arkham-purple">
            {type && faction ? `${type.charAt(0).toUpperCase() + type.slice(1)}s - ${getFactionName(faction)}` : "Cards"}
          </h2>
          <div className="w-24"></div>
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
            <Label htmlFor="expansionFilter">Filter by Expansion</Label>
            <Input
              id="expansionFilter"
              value={expansionFilter}
              onChange={(e) => setExpansionFilter(e.target.value)}
              placeholder="Search by expansion..."
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <Card key={card.code} className="bg-card">
                <CardContent className="p-4 flex gap-4">
                  <div className="w-32 flex-shrink-0">
                    {card.imagesrc ? (
                      <img 
                        src={`https://arkhamdb.com${card.imagesrc}`} 
                        alt={card.name}
                        className="w-full h-auto object-cover"
                      />
                    ) : (
                      <div className="bg-arkham-purple/20 h-40 flex items-center justify-center p-2">
                        <span className="text-lg font-bold text-center">{card.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow space-y-2">
                    <h3 className="font-bold text-lg">{card.name}</h3>
                    {getCardDetails(card)}
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
