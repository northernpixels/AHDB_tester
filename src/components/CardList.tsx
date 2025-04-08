
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArkhamCard } from "@/types/arkham-types";
import { fetchCardsByFaction, getFactionName, getExpansions, ExpansionGroup } from "@/api/arkhamAPI";
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
  const [expansionFilter, setExpansionFilter] = useState<string>("all");
  const [xpFilter, setXpFilter] = useState<string>("");
  const [expansions, setExpansions] = useState<ExpansionGroup[]>([]);
  console.log('Current expansions state:', expansions);
  const [loadingExpansions, setLoadingExpansions] = useState<boolean>(true);
  const { faction, type } = useParams<{ faction: string; type: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('CardList useEffect - faction:', faction, 'type:', type);
    const loadData = async () => {
      if (!faction || !type) {
        console.log('Missing faction or type');
        return;
      }
      
      try {
        setLoading(true);
        setLoadingExpansions(true);
        
        console.log('Fetching data...');
        console.log('Starting data fetch for faction:', faction);
        const allCards = await fetchCardsByFaction(faction);
        console.log('Fetched cards:', allCards);
        
        const allExpansions = await getExpansions();
        console.log('Fetched expansions:', allExpansions);
        
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
        setExpansions(allExpansions);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load data: ${errorMessage}`);
        console.error('Error in CardList:', err);
      } finally {
        setLoading(false);
        setLoadingExpansions(false);
      }
    };

    loadData();
  }, [faction, type]);

  const handleHome = () => {
    navigate('/');
  };

  const filteredCards = cards.filter(card => {
    const nameMatch = card.name.toLowerCase().includes(nameFilter.toLowerCase());
    const packMatch = expansionFilter === 'all' || card.pack_code === expansionFilter;
    const xpMatch = !xpFilter || (card.xp !== undefined && card.xp.toString() === xpFilter);
    return nameMatch && packMatch && xpMatch;
  });

  if (!faction || !type) {
    navigate('/');
    return null;
  }

  // Function to get card details display
  const getCardDetails = (card: ArkhamCard) => {
    const details = [];
    
    if (card.cost !== undefined) details.push(`Cost: ${card.cost}`);
    if (card.xp !== undefined) details.push(`XP: ${card.xp}`);
    if (card.pack_name) details.push(`Pack: ${card.pack_name}`);
    if (card.health !== undefined) details.push(`Health: ${card.health}`);
    if (card.sanity !== undefined) details.push(`Sanity: ${card.sanity}`);
    
    const skills = [];
    if (card.skill_willpower !== undefined) skills.push(`👁️ ${card.skill_willpower}`);
    if (card.skill_intellect !== undefined) skills.push(`🧠 ${card.skill_intellect}`);
    if (card.skill_combat !== undefined) skills.push(`👊 ${card.skill_combat}`);
    if (card.skill_agility !== undefined) skills.push(`🦶 ${card.skill_agility}`);
    
    return (
      <div className="text-sm space-y-2">
        <div className="flex flex-wrap gap-4">
          {details.map((detail, index) => (
            <span key={index}>{detail}</span>
          ))}
        </div>
        
        {skills.length > 0 && (
          <div className="flex gap-4">
            {skills.map((skill, index) => (
              <span key={index}>{skill}</span>
            ))}
          </div>
        )}
        
        {card.traits && <p className="italic text-gray-400">{processCardText(card.traits)}</p>}
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
            <Label htmlFor="expansionFilter">Filter by Expansion</Label>
            <Select value={expansionFilter} onValueChange={setExpansionFilter} disabled={loadingExpansions}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingExpansions ? "Loading..." : "Select expansion"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Expansions</SelectItem>
                {!loadingExpansions && expansions?.map((group) => (
                  <SelectGroup key={group.cycleCode}>
                    <SelectLabel>{group.cycleName || 'Unknown Cycle'}</SelectLabel>
                    {group.packs?.map((pack) => (
                      <SelectItem key={pack.code} value={pack.code}>
                        {pack.name || 'Unknown Pack'}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
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
          <div className="space-y-4">
            {filteredCards.map((card) => (
              <Card key={card.code} className="bg-card">
                <CardContent className="p-4">
                  <div className="flex gap-6">
                    <div className="w-24 flex-shrink-0">
                      {card.imagesrc ? (
                        <img 
                          src={`https://arkhamdb.com${card.imagesrc}`} 
                          alt={card.name}
                          className="w-full h-auto object-cover rounded-sm"
                        />
                      ) : (
                        <div className="bg-arkham-purple/20 h-32 flex items-center justify-center p-2 rounded-sm">
                          <span className="text-lg font-bold text-center">{card.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
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
