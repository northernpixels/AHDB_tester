
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

// Map ArkhamDB pack names to our expansion names
const PACK_NAME_MAP: { [key: string]: string } = {
  // Core Set variations
  'Core Set': 'Revised Core Set',
  'Revised Core': 'Revised Core Set',
  'Revised Core Set': 'Revised Core Set',
  
  // Dunwich Legacy variations
  'Dunwich': 'The Dunwich Legacy',
  'Dunwich Legacy': 'The Dunwich Legacy',
  'The Dunwich Legacy': 'The Dunwich Legacy',
  'Dunwich Horror': 'The Dunwich Legacy',
  'Return to the Dunwich Legacy': 'Return to The Dunwich Legacy',
  'Return to Dunwich Legacy': 'Return to The Dunwich Legacy',
  'Return To The Dunwich Legacy': 'Return to The Dunwich Legacy',
  
  // Path to Carcosa variations
  'Carcosa': 'The Path To Carcosa',
  'Path to Carcosa': 'The Path To Carcosa',
  'The Path to Carcosa': 'The Path To Carcosa',
  'Path To Carcosa': 'The Path To Carcosa',
  'Return to the Path to Carcosa': 'Return to The Path to Carcosa',
  'Return to Path to Carcosa': 'Return to The Path to Carcosa',
  'Return To The Path to Carcosa': 'Return to The Path to Carcosa',
  
  // Forgotten Age variations
  'Forgotten': 'The Forgotten Age',
  'Forgotten Age': 'The Forgotten Age',
  'The Forgotten Age': 'The Forgotten Age',
  'Return to the Forgotten Age': 'Return to The Forgotten Age',
  'Return To The Forgotten Age': 'Return to The Forgotten Age',
  
  // Circle Undone variations
  'Circle': 'The Circle Undone',
  'Circle Undone': 'The Circle Undone',
  'The Circle Undone': 'The Circle Undone',
  'Return to the Circle Undone': 'Return to The Circle Undone',
  'Return To The Circle Undone': 'Return to The Circle Undone',
  
  // Dream Eaters variations
  'Dream': 'The Dream Eaters',
  'Dream Eaters': 'The Dream Eaters',
  'Dream-Eaters': 'The Dream Eaters',
  'The Dream-Eaters': 'The Dream Eaters',
  'The Dream Eaters': 'The Dream Eaters',
  
  // Innsmouth Conspiracy variations
  'Innsmouth': 'The Innsmouth Conspiracy',
  'Innsmouth Conspiracy': 'The Innsmouth Conspiracy',
  'The Innsmouth Conspiracy': 'The Innsmouth Conspiracy',
  
  // Edge of the Earth variations
  'Edge': 'Edge Of The Earth',
  'Edge of Earth': 'Edge Of The Earth',
  'Edge of the Earth': 'Edge Of The Earth',
  'Edge Of Earth': 'Edge Of The Earth',
  'Edge Of The Earth': 'Edge Of The Earth',
  
  // Scarlet Keys variations
  'Scarlet': 'The Scarlet Keys',
  'Scarlet Keys': 'The Scarlet Keys',
  'The Scarlet Keys': 'The Scarlet Keys',
  'The Scarlet Keys Campaign Expansion': 'The Scarlet Keys',
  'The Scarlet Keys Investigator Expansion': 'The Scarlet Keys',
  
  // Feast of Hemlock Vale variations
  'Hemlock': 'The Feast Of Hemlock Vale',
  'Hemlock Vale': 'The Feast Of Hemlock Vale',
  'Feast of Hemlock': 'The Feast Of Hemlock Vale',
  'Feast of Hemlock Vale': 'The Feast Of Hemlock Vale',
  'The Feast of Hemlock Vale': 'The Feast Of Hemlock Vale',
  'The Feast Of Hemlock Vale': 'The Feast Of Hemlock Vale',
  'The Feast of Hemlock Vale Campaign Expansion': 'The Feast Of Hemlock Vale',
  
  // Other packs
  'Return to Night of the Zealot': 'Return to Night of the Zealot',
  'The Blob That Ate Everything': 'The Blob That Ate Everything',
  'Murder at the Excelsior Hotel': 'Murder at the Excelsior Hotel',
  'War of the Outer Gods': 'War of the Outer Gods',
  'Machinations Through Time': 'Machinations Through Time',
  'Fortune and Folly': 'Fortune and Folly',
  'The Feast of Hemlock Vale Investigator Expansion': 'The Feast Of Hemlock Vale'
};

export const normalizePackName = (packName: string | undefined): string | undefined => {
  if (!packName) return undefined;
  return PACK_NAME_MAP[packName] || packName;
};

export const fetchCardsByFaction = async (factionCode: string, typeFilter?: { type?: string; subtype?: string }): Promise<ArkhamCard[]> => {
  try {
    console.log(`Fetching cards for faction: ${factionCode}`);
    const allCards = await fetchAllCards();
    let factionCards = allCards
      .filter(card => card.faction_code === factionCode)
      .map(card => ({
        ...card,
        pack_name: normalizePackName(card.pack_name)
      }));

    // For neutral faction, exclude Location, Enemy, and Story cards
    if (factionCode === 'neutral') {
      factionCards = factionCards.filter(card => 
        !['location', 'enemy', 'story'].includes(card.type_code.toLowerCase())
      );
    }

    // Apply type and subtype filters if provided
    if (typeFilter) {
      if (typeFilter.type) {
        factionCards = factionCards.filter(card => card.type_code === typeFilter.type);
      }
      if (typeFilter.subtype) {
        factionCards = factionCards.filter(card => card.traits?.toLowerCase().includes(typeFilter.subtype.toLowerCase()));
      }
    }

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
  const iconMap: Record<string, string> = {
    asset: "💠",
    event: "⚡",
    skill: "✨",
    treachery: "☠️",
    enemy: "👿",
    investigator: "🔍",
    location: "🏛️",
    story: "📖",
    basic_weakness: "💀",
    weakness: "☠️"
  };
  return iconMap[typeCode] || "❓";
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
