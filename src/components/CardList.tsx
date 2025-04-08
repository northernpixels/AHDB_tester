
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArkhamCard } from "@/types/arkham-types";
import { fetchCardsByFaction, getFactionName } from "@/api/arkhamAPI";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "./LoadingSpinner";

const CardList: React.FC = () => {
  const [cards, setCards] = useState<ArkhamCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { faction, investigator, type } = useParams<{ faction: string; investigator: string; type: string }>();
  const navigate = useNavigate();
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const loadCards = async () => {
      if (!faction || !type) return;
      
      try {
        setLoading(true);
        const allCards = await fetchCardsByFaction(faction);
        const filteredCards = allCards.filter(card => card.type_code === type);
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

  // Function to get card details display
  const getCardDetails = (card: ArkhamCard) => (
    <div className="text-sm">
      {card.cost !== undefined && <p>Cost: {card.cost}</p>}
      {card.xp !== undefined && <p>XP: {card.xp}</p>}
      {card.health !== undefined && <p>Health: {card.health}</p>}
      {card.sanity !== undefined && <p>Sanity: {card.sanity}</p>}
      
      <div className="mt-2">
        {card.skill_willpower !== undefined && <span className="mr-2">👁️ {card.skill_willpower}</span>}
        {card.skill_intellect !== undefined && <span className="mr-2">🧠 {card.skill_intellect}</span>}
        {card.skill_combat !== undefined && <span className="mr-2">👊 {card.skill_combat}</span>}
        {card.skill_agility !== undefined && <span className="mr-2">🦶 {card.skill_agility}</span>}
      </div>
      
      {card.traits && <p className="mt-2 italic text-gray-400">{card.traits}</p>}
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500 my-8">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={handleBack} variant="outline">Back to Card Types</Button>
        <h2 className="text-3xl font-bold text-arkham-purple">
          {type && faction ? `${type.charAt(0).toUpperCase() + type.slice(1)}s - ${getFactionName(faction)}` : "Cards"}
        </h2>
        <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "list")}>
          <TabsList>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {cards.length === 0 ? (
        <p className="text-center">No cards found for this type and faction.</p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Card key={card.code} className="card-hover bg-card overflow-hidden">
              <CardContent className="p-0">
                {card.imagesrc ? (
                  <img 
                    src={`https://arkhamdb.com${card.imagesrc}`} 
                    alt={card.name}
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="bg-arkham-purple/20 h-40 flex items-center justify-center p-4">
                    <span className="text-lg font-bold">{card.name}</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg">{card.name}</h3>
                  {getCardDetails(card)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <Card key={card.code} className="card-hover bg-card">
              <CardContent className="p-4 flex flex-row gap-4">
                {card.imagesrc ? (
                  <img 
                    src={`https://arkhamdb.com${card.imagesrc}`} 
                    alt={card.name}
                    className="w-24 h-auto object-cover"
                  />
                ) : (
                  <div className="bg-arkham-purple/20 w-24 flex items-center justify-center">
                    <span className="text-lg font-bold">{card.name}</span>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg">{card.name}</h3>
                  {getCardDetails(card)}
                  {card.text && <p className="mt-2 text-sm">{card.text}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardList;
