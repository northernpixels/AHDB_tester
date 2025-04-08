
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getFactionName, getFactionColor } from "@/api/arkhamAPI";
import { useNavigate } from "react-router-dom";

// Import faction logos
import guardianLogo from "@/assets/guardian.svg";
import seekerLogo from "@/assets/seeker.svg";
import rogueLogo from "@/assets/rogue.svg";
import mysticLogo from "@/assets/mystic.svg";
import survivorLogo from "@/assets/survivor.svg";
import neutralLogo from "@/assets/neutral.svg";

const factionLogos: Record<string, string> = {
  guardian: guardianLogo,
  seeker: seekerLogo,
  rogue: rogueLogo,
  mystic: mysticLogo,
  survivor: survivorLogo,
  neutral: neutralLogo,
};

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
    navigate(`/cards/${faction}`);
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
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={factionLogos[faction]}
                  alt={`${getFactionName(faction)} icon`}
                  className="w-8 h-8 text-white"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                <h3 className="text-2xl font-bold text-white">{getFactionName(faction)}</h3>
              </div>
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
