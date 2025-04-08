
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { InvestigatorSummary } from "@/types/arkham-types";
import { fetchInvestigators, getFactionName } from "@/api/arkhamAPI";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "./LoadingSpinner";

const InvestigatorList: React.FC = () => {
  const [investigators, setInvestigators] = useState<InvestigatorSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={handleBack} variant="outline">Back to Factions</Button>
        <h2 className="text-3xl font-bold text-arkham-purple">
          {faction ? `${getFactionName(faction)} Investigators` : "All Investigators"}
        </h2>
        <div className="w-24"></div> {/* Empty div for flex spacing */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {investigators.length === 0 ? (
          <p className="text-center col-span-full">No investigators found for this faction.</p>
        ) : (
          investigators.map((investigator) => (
            <Card 
              key={investigator.code} 
              className="investigator-card card-hover cursor-pointer bg-card"
              onClick={() => handleSelectInvestigator(investigator)}
            >
              <CardContent className="p-0">
                {investigator.imagesrc ? (
                  <img 
                    src={`https://arkhamdb.com${investigator.imagesrc}`} 
                    alt={investigator.name}
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="bg-arkham-purple/20 h-64 flex items-center justify-center">
                    <span className="text-xl">{investigator.name}</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-xl font-bold">{investigator.name}</h3>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default InvestigatorList;
