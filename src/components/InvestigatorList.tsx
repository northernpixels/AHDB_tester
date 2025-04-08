
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { InvestigatorSummary } from "@/types/arkham-types";
import { fetchInvestigators, getFactionName } from "@/api/arkhamAPI";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "./LoadingSpinner";

const InvestigatorList: React.FC = () => {
  const [investigators, setInvestigators] = useState<InvestigatorSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nameFilter, setNameFilter] = useState<string>("");
  const [packFilter, setPackFilter] = useState<string>("");
  const { faction } = useParams<{ faction: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const loadInvestigators = async () => {
      try {
        setLoading(true);
        const allInvestigators = await fetchInvestigators();
        const filteredInvestigators = faction 
          ? allInvestigators.filter(inv => inv.faction_code === faction)
          : allInvestigators;
        
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

  const handleSelectInvestigator = (investigator: InvestigatorSummary) => {
    navigate(`/cards/${faction}/${investigator.code}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500 my-8">{error}</div>;

  const filteredInvestigators = investigators.filter(investigator => {
    const nameMatch = investigator.name.toLowerCase().includes(nameFilter.toLowerCase());
    const packMatch = !packFilter || (investigator.pack_name && investigator.pack_name.toLowerCase().includes(packFilter.toLowerCase()));
    return nameMatch && packMatch;
  });

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button onClick={handleBack} variant="outline">Back to Factions</Button>
          <h2 className="text-3xl font-bold text-arkham-purple">
            {faction ? `${getFactionName(faction)} Investigators` : "All Investigators"}
          </h2>
          <div className="w-24"></div>
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
          <div>
            <Label htmlFor="packFilter">Filter by Pack</Label>
            <Input
              id="packFilter"
              value={packFilter}
              onChange={(e) => setPackFilter(e.target.value)}
              placeholder="Search by pack..."
            />
          </div>
        </div>

        {filteredInvestigators.length === 0 ? (
          <p className="text-center">No investigators found matching the current filters.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredInvestigators.map((investigator) => (
              <Card 
                key={investigator.code} 
                className="bg-card cursor-pointer"
                onClick={() => handleSelectInvestigator(investigator)}
              >
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
                    <h3 className="text-xl font-bold">{investigator.name}</h3>
                    <div className="text-sm space-y-2">
                      <div className="flex flex-wrap gap-4">
                        {investigator.faction_name && <span>Faction: {investigator.faction_name}</span>}
                        {investigator.pack_name && <span>Pack: {investigator.pack_name}</span>}
                      </div>
                      {investigator.traits && <p className="italic text-gray-400">{investigator.traits}</p>}
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

export default InvestigatorList;
