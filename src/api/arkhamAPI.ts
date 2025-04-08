
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

export const fetchInvestigators = async (): Promise<InvestigatorSummary[]> => {
  try {
    const allCards = await fetchAllCards();
    return allCards
      .filter(card => card.type_code === 'investigator')
      .map(investigator => ({
        code: investigator.code,
        name: investigator.name,
        faction_code: investigator.faction_code,
        faction_name: investigator.faction_name || '',
        pack_code: investigator.pack_code || '',
        pack_name: investigator.pack_name || '',
        type_code: investigator.type_code,
        type_name: investigator.type_name || '',
        imagesrc: investigator.imagesrc,
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

export interface ExpansionGroup {
  cycleCode: string;
  cycleName: string;
  packs: {
    code: string;
    name: string;
  }[];
}

export const getExpansions = async (): Promise<ExpansionGroup[]> => {
  try {
    console.log('Fetching expansions...');
    const allCards = await fetchAllCards();
    const packMap = new Map<string, Set<string>>();
    
    // Group packs by their first two characters (cycle code)
    allCards.forEach(card => {
      if (!card) {
        console.warn('Found null card in allCards');
        return;
      }
      
      try {
        if (card.pack_code && card.pack_name) {
          const cycleCode = card.pack_code.slice(0, 2);
          if (!packMap.has(cycleCode)) {
            packMap.set(cycleCode, new Set());
          }
          const packData = { code: card.pack_code, name: card.pack_name };
          packMap.get(cycleCode)?.add(JSON.stringify(packData));
        }
      } catch (err) {
        console.warn('Error processing card for expansions:', err);
      }
    });

    console.log('Processing expansion groups...');
    // Convert to array and sort
    const expansionGroups: ExpansionGroup[] = Array.from(packMap.entries()).map(([cycleCode, packSet]) => {
      try {
        return {
          cycleCode,
          cycleName: getCycleName(cycleCode),
          packs: Array.from(packSet)
            .map(packStr => {
              try {
                return JSON.parse(packStr);
              } catch (err) {
                console.warn('Error parsing pack JSON:', err);
                return null;
              }
            })
            .filter((pack): pack is { code: string; name: string } => pack !== null)
            .sort((a, b) => a.name.localeCompare(b.name))
        };
      } catch (err) {
        console.error('Error creating expansion group:', err);
        return null;
      }
    }).filter((group): group is ExpansionGroup => group !== null);

    console.log('Returning expansion groups:', expansionGroups);
    return expansionGroups;
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
