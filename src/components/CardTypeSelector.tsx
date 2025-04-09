
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArkhamCard, CardTypeGroup } from "@/types/arkham-types";
import { fetchCardsByFaction, getFactionName, getTypeIcon } from "@/api/arkhamAPI";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "./LoadingSpinner";

const CardTypeSelector: React.FC = () => {
  const [cardGroups, setCardGroups] = useState<CardTypeGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const { faction, investigator } = useParams<{ faction: string; investigator: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCards = async () => {
      if (!faction) return;
      
      try {
        setLoading(true);
        const cards = await fetchCardsByFaction(faction);
        
        // Group cards by type_code and handle special subtypes
        const groupedCards: Record<string, ArkhamCard[]> = {};
        cards.forEach(card => {
          // Special handling for Basic Weakness and Weakness subtypes
          if (card.type_code === 'treachery') {
            const traits = card.traits?.toLowerCase() || '';
            if (traits.includes('basic weakness')) {
              if (!groupedCards['basic_weakness']) {
                groupedCards['basic_weakness'] = [];
              }
              groupedCards['basic_weakness'].push(card);
            } else if (traits.includes('weakness')) {
              if (!groupedCards['weakness']) {
                groupedCards['weakness'] = [];
              }
              groupedCards['weakness'].push(card);
            } else {
              // Handle regular treachery cards
              if (!groupedCards['treachery']) {
                groupedCards['treachery'] = [];
              }
              groupedCards['treachery'].push(card);
            }
          } else {
            if (!groupedCards[card.type_code]) {
              groupedCards[card.type_code] = [];
            }
            groupedCards[card.type_code].push(card);
          }
        });
        
        // Convert to array format
        const groups: CardTypeGroup[] = Object.keys(groupedCards).map(typeCode => {
          const firstCard = groupedCards[typeCode][0];
          return {
            type_code: typeCode,
            type_name: typeCode === 'basic_weakness' ? 'Basic Weakness' :
                      typeCode === 'weakness' ? 'Weakness' :
                      firstCard.type_name || typeCode,
            cards: groupedCards[typeCode]
          };
        });
        
        setCardGroups(groups);
      } catch (err) {
        setError("Failed to load cards. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, [faction]);

  const handleSelectCardType = (typeCode: string) => {
    navigate(`/cards/${faction}/${investigator}/${typeCode}`);
  };

  const handleBack = () => {
    navigate(`/investigators/${faction}`);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500 my-8">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={handleBack} variant="outline">Back to Investigators</Button>
        <h2 className="text-3xl font-bold text-arkham-purple">
          {faction ? `${getFactionName(faction)} Card Types` : "All Card Types"}
        </h2>
        <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "list")}>
          <TabsList>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {cardGroups.length === 0 ? (
        <p className="text-center">No card types found for this faction.</p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardGroups.map((group) => (
            <Card 
              key={group.type_code} 
              className="card-hover cursor-pointer bg-card"
              onClick={() => handleSelectCardType(group.type_code)}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-4xl mb-2">{getTypeIcon(group.type_code)}</div>
                <h3 className="text-xl font-bold mb-1">{group.type_name}</h3>
                <p className="text-muted-foreground">{group.cards.length} cards</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {cardGroups.map((group) => (
            <Card 
              key={group.type_code} 
              className="card-hover cursor-pointer bg-card"
              onClick={() => handleSelectCardType(group.type_code)}
            >
              <CardContent className="p-4 flex flex-row items-center gap-6">
                <div className="text-4xl">{getTypeIcon(group.type_code)}</div>
                <div>
                  <h3 className="text-xl font-bold">{group.type_name}</h3>
                  <p className="text-muted-foreground">{group.cards.length} cards</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardTypeSelector;
