
export interface ArkhamCard {
  code: string;
  name: string;
  text?: string;
  faction_code: string;
  faction_name?: string;
  pack_code?: string;
  pack_name?: string;
  type_code: string;
  type_name?: string;
  subtype_code?: string;
  cost?: number;
  health?: number;
  sanity?: number;
  skill_willpower?: number;
  skill_intellect?: number;
  skill_combat?: number;
  skill_agility?: number;
  slots?: string[];
  traits?: string;
  is_unique?: boolean;
  exile?: boolean;
  deck_limit?: number;
  deck_options?: DeckOption[];
  deck_requirements?: DeckRequirements;
  real_text?: string;
  real_flavor?: string;
  imagesrc?: string;
  quantity?: number;
  health_per_investigator?: boolean;
  xp?: number;
  illustrator?: string;
  is_taboo?: boolean;
}

export interface DeckOption {
  faction: string[];
  level?: { min: number; max: number };
  limit?: number;
  error?: string;
  not?: { traits?: string[] };
  trait?: string[];
}

export interface DeckRequirements {
  card?: { [key: string]: number };
  random?: { level: { min: number; max: number }; target: string; traits: string[] }[];
  size?: number;
}

export interface InvestigatorSummary {
  code: string;
  name: string;
  faction_code: string;
  type_code: string;
  imagesrc?: string;
}

export interface CardTypeGroup {
  type_code: string;
  type_name: string;
  cards: ArkhamCard[];
}
