
import React, { useState } from "react";
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
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);

  const handleSelectFaction = (faction: string) => {
    setSelectedFaction(faction);
    navigate(`/cards/${faction}/investigator`);
  };
  
  return (
    <div className="w-full">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {factions.map((faction) => (
          <Card 
            key={faction} 
            className={`${getFactionColor(faction)} card-hover cursor-pointer border-2 ${selectedFaction === faction ? 'border-white' : 'border-gray-700'} flex-1 min-w-[150px]`}
            onClick={() => handleSelectFaction(faction)}
          >
            <CardContent className="flex flex-col items-center justify-center p-4">
              <img 
                src={factionLogos[faction]} 
                alt={`${getFactionName(faction)} logo`}
                className="w-8 h-8 mb-2"
              />
              <h3 className="text-base font-bold">{getFactionName(faction)}</h3>
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
