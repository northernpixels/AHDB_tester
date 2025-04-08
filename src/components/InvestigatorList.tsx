
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArkhamCard } from "@/types/arkham-types";
import { fetchInvestigators, getFactionName } from "@/api/arkhamAPI";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "./LoadingSpinner";
import { Home } from "lucide-react";
import { processCardText } from "@/utils/textProcessing";

const InvestigatorList: React.FC = () => {
  const [investigators, setInvestigators] = useState<ArkhamCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nameFilter, setNameFilter] = useState<string>("");
  const { faction } = useParams<{ faction: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const loadInvestigators = async () => {
      try {
        setLoading(true);
        const allInvestigators = await fetchInvestigators();
        
        // Create a map to store unique investigators by name
        const uniqueInvestigators = new Map<string, ArkhamCard>();
        allInvestigators.forEach(inv => {
          // Only keep the first instance of each investigator (by name)
          if (!uniqueInvestigators.has(inv.name)) {
            uniqueInvestigators.set(inv.name, inv);
          }
        });

        // Convert back to array and filter by faction if needed
        const investigators = Array.from(uniqueInvestigators.values());
        const filteredInvestigators = faction
          ? investigators.filter((inv) => inv.faction_code === faction)
          : investigators;

        // Sort by name
        filteredInvestigators.sort((a, b) => a.name.localeCompare(b.name));
        
        setInvestigators(filteredInvestigators);
      } catch (err) {
        setError("Failed to load investigators. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInvestigators();
  }, [faction]);

  const handleInvestigatorClick = (investigator: ArkhamCard) => {
    navigate(`/cards/${faction}/${investigator.code}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500 my-8">{error}</div>;

  const filteredInvestigators = investigators.filter(investigator => {
    const nameMatch = investigator.name.toLowerCase().includes(nameFilter.toLowerCase());
    return nameMatch;
  });

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button onClick={() => navigate('/')} variant="outline" size="icon" title="Home">
            <Home className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold text-arkham-purple">
            {faction ? `${getFactionName(faction)} Investigators` : "All Investigators"}
          </h2>
          <div className="w-10"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nameFilter">Filter by Name</Label>
            <Input
              id="nameFilter"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Search by name..."
            />
          </div>
        </div>

        {filteredInvestigators.length === 0 ? (
          <p className="text-center">No investigators found matching the current filters.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredInvestigators.map((investigator) => (
              <Card key={investigator.code} className="bg-card hover:bg-card/90 transition-colors cursor-pointer" onClick={() => handleInvestigatorClick(investigator)}>
                <CardContent className="p-4 flex gap-4">
                  <div className="w-32 flex-shrink-0">
                    {investigator.imagesrc ? (
                      <img 
                        src={`https://arkhamdb.com${investigator.imagesrc}`} 
                        alt={investigator.name}
                        className="w-full h-auto object-cover"
                      />
                    ) : (
                      <div className="bg-arkham-purple/20 h-40 flex items-center justify-center p-2">
                        <span className="text-lg font-bold text-center">{investigator.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow space-y-2">
                    <h3 className="font-bold text-lg">{investigator.name}</h3>
                    <p className="text-sm text-gray-500">{getFactionName(investigator.faction_code)}</p>
                    
                    <div className="flex flex-wrap gap-4">
                      {investigator.skill_willpower !== undefined && (
                        <span className="flex items-center gap-1">
                          <span>👁️</span>
                          <span>{investigator.skill_willpower}</span>
                        </span>
                      )}
                      {investigator.skill_intellect !== undefined && (
                        <span className="flex items-center gap-1">
                          <span>🧠</span>
                          <span>{investigator.skill_intellect}</span>
                        </span>
                      )}
                      {investigator.skill_combat !== undefined && (
                        <span className="flex items-center gap-1">
                          <span>👊</span>
                          <span>{investigator.skill_combat}</span>
                        </span>
                      )}
                      {investigator.skill_agility !== undefined && (
                        <span className="flex items-center gap-1">
                          <span>🦶</span>
                          <span>{investigator.skill_agility}</span>
                        </span>
                      )}
                    </div>
                    
                    {investigator.health !== undefined && investigator.sanity !== undefined && (
                      <div className="flex gap-4 text-sm">
                        <span>Health: {investigator.health}</span>
                        <span>Sanity: {investigator.sanity}</span>
                      </div>
                    )}
                    
                    {investigator.traits && (
                      <p className="text-sm italic text-gray-400">{processCardText(investigator.traits)}</p>
                    )}
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

export default InvestigatorList;
