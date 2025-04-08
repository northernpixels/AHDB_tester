
import { ArkhamCard, InvestigatorSummary } from "@/types/arkham-types";

const baseUrl = "https://arkhamdb.com/api/public";

export const fetchAllCards = async (): Promise<ArkhamCard[]> => {
  try {
    const response = await fetch(`${baseUrl}/cards/`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching all cards:", error);
    throw error;
  }
};

export const fetchInvestigators = async (): Promise<InvestigatorSummary[]> => {
  try {
    const allCards = await fetchAllCards();
    return allCards
      .filter(card => card.type_code === 'investigator')
      .map(investigator => ({
        code: investigator.code,
        name: investigator.name,
        faction_code: investigator.faction_code,
        type_code: investigator.type_code,
        imagesrc: investigator.imagesrc,
      }));
  } catch (error) {
    console.error("Error fetching investigators:", error);
    throw error;
  }
};

export const fetchCardsByFaction = async (factionCode: string): Promise<ArkhamCard[]> => {
  try {
    const allCards = await fetchAllCards();
    return allCards.filter(card => card.faction_code === factionCode);
  } catch (error) {
    console.error(`Error fetching cards for faction ${factionCode}:`, error);
    throw error;
  }
};

export const getFactionName = (factionCode: string): string => {
  const factionMap: Record<string, string> = {
    guardian: "Guardian",
    seeker: "Seeker",
    rogue: "Rogue",
    mystic: "Mystic",
    survivor: "Survivor",
    neutral: "Neutral",
    mythos: "Mythos",
  };

  return factionMap[factionCode] || factionCode;
};

export const getTypeIcon = (typeCode: string): string => {
  // Usually you would have icons for these, but we'll return placeholder strings
  const typeMap: Record<string, string> = {
    asset: "🧰", // Asset
    event: "⚡", // Event
    skill: "🧠", // Skill
    treachery: "☠️", // Treachery
    enemy: "👹", // Enemy
    investigator: "🕵️", // Investigator
  };

  return typeMap[typeCode] || "📝";
};

export const getFactionColor = (factionCode: string): string => {
  const colorMap: Record<string, string> = {
    guardian: "bg-blue-700",
    seeker: "bg-yellow-600",
    rogue: "bg-green-600",
    mystic: "bg-purple-700",
    survivor: "bg-red-700",
    neutral: "bg-gray-600",
    mythos: "bg-stone-700",
  };

  return colorMap[factionCode] || "bg-gray-800";
};
