
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getFactionName, getFactionColor } from "@/api/arkhamAPI";
import { useNavigate } from "react-router-dom";

// Placeholder for faction data
const factions = [
  "guardian",
  "seeker",
  "rogue",
  "mystic", 
  "survivor",
  "neutral"
];

const FactionSelector: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectFaction = (faction: string) => {
    navigate(`/investigators/${faction}`);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-center mb-8 text-arkham-purple">Choose an Investigator Class</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {factions.map((faction) => (
          <Card 
            key={faction} 
            className={`${getFactionColor(faction)} card-hover cursor-pointer border-2 border-gray-700`}
            onClick={() => handleSelectFaction(faction)}
          >
            <CardContent className="flex flex-col items-center justify-center p-6">
              <h3 className="text-2xl font-bold mb-2 text-white">{getFactionName(faction)}</h3>
              <p className="text-white opacity-80 text-center">
                {getClassDescription(faction)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Helper function to get class descriptions
function getClassDescription(faction: string): string {
  const descriptions: Record<string, string> = {
    guardian: "Protectors with high combat ability, focused on defeating enemies and protecting allies.",
    seeker: "Intellectuals who excel at gathering clues, solving puzzles, and acquiring knowledge.",
    rogue: "Opportunists skilled at evading trouble and exploiting advantages when the odds are right.",
    mystic: "Spellcasters who channel arcane powers, often at great risk to themselves.",
    survivor: "Resilient individuals who can persist against all odds with improvised solutions.",
    neutral: "Balanced characters that can complement any team with versatile abilities.",
  };

  return descriptions[faction] || "";
}

export default FactionSelector;
