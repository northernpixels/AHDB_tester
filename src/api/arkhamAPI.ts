
import { ArkhamCard, InvestigatorSummary } from "@/types/arkham-types";

const baseUrl = "https://arkhamdb.com/api/public";

export const fetchAllCards = async (): Promise<ArkhamCard[]> => {
  try {
    console.log('Fetching all cards from API...');
    const response = await fetch(`${baseUrl}/cards/`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`Successfully fetched ${data.length} cards`);
    return data;
  } catch (error) {
    console.error('Error fetching all cards:', error);
    throw new Error(`Failed to fetch cards: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const fetchInvestigators = async (): Promise<ArkhamCard[]> => {
  try {
    const allCards = await fetchAllCards();
    return allCards
      .filter(card => card.type_code === 'investigator')
      .map(investigator => ({
        ...investigator,
        faction_name: investigator.faction_name || '',
        pack_name: investigator.pack_name || '',
        type_name: investigator.type_name || '',
      }));
  } catch (error) {
    console.error("Error fetching investigators:", error);
    throw error;
  }
};

export const fetchCardsByFaction = async (factionCode: string): Promise<ArkhamCard[]> => {
  try {
    console.log(`Fetching cards for faction: ${factionCode}`);
    const allCards = await fetchAllCards();
    const factionCards = allCards.filter(card => card.faction_code === factionCode);
    console.log(`Found ${factionCards.length} cards for faction ${factionCode}`);
    return factionCards;
  } catch (error) {
    console.error(`Error fetching cards for faction ${factionCode}:`, error);
    throw new Error(`Failed to fetch cards for faction ${factionCode}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export interface Expansion {
  name: string;
  code: string;
}

export const getExpansions = async (): Promise<Expansion[]> => {
  try {
    console.log('Fetching expansions...');
    const response = await fetch(`${baseUrl}/packs/`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }
    const packs = await response.json();
    
    // Convert to array and sort
    const expansions = packs
      .filter((pack: any) => pack.name) // Filter out any packs without names
      .map((pack: any) => ({
        name: pack.name,
        code: pack.code
      }));
    expansions.sort((a, b) => a.name.localeCompare(b.name));

    console.log('Returning expansions:', expansions);
    return expansions;
  } catch (error) {
    console.error('Error getting expansions:', error);
    throw new Error(`Failed to get expansions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const getCycleName = (cycleCode: string): string => {
  const cycleMap: Record<string, string> = {
    '01': 'Core Set',
    '02': 'The Dunwich Legacy',
    '03': 'The Path to Carcosa',
    '04': 'The Forgotten Age',
    '05': 'The Circle Undone',
    '06': 'The Dream-Eaters',
    '07': 'The Innsmouth Conspiracy',
    '08': 'Edge of the Earth',
    '09': 'The Scarlet Keys',
    '10': 'The Feast of Hemlock Vale',
    'pt': 'Promotional',
    'ro': 'Return to',
    'si': 'Standalone',
  };
  return cycleMap[cycleCode] || `Cycle ${cycleCode}`;
};

export interface CardTypeGroup {
  type_code: string;
  type_name: string;
  count: number;
}

export const getCardTypes = async (factionCode: string): Promise<CardTypeGroup[]> => {
  try {
    const cards = await fetchCardsByFaction(factionCode);
    const typeMap = new Map<string, { type_name: string; count: number }>();

    cards.forEach(card => {
      if (card.type_code && card.type_name) {
        if (!typeMap.has(card.type_code)) {
          typeMap.set(card.type_code, { type_name: card.type_name, count: 0 });
        }
        typeMap.get(card.type_code)!.count++;
      }
    });

    const types = Array.from(typeMap.entries()).map(([type_code, { type_name, count }]) => ({
      type_code,
      type_name,
      count
    }));

    // Sort types with 'investigator' first, then alphabetically
    return types.sort((a, b) => {
      if (a.type_code === 'investigator') return -1;
      if (b.type_code === 'investigator') return 1;
      return a.type_name.localeCompare(b.type_name);
    });
  } catch (error) {
    console.error('Error getting card types:', error);
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
