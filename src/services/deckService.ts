export interface DeckCard {
  card_id: string;
  quantity: number;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  investigator_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  cards?: DeckCard[];
}

class DeckService {
  async createDeck(deck: Omit<Deck, 'id' | 'created_at' | 'updated_at'>, cards: DeckCard[]): Promise<Deck> {
    // TODO: Implement actual API call
    return {
      id: 'new-deck-id',
      name: deck.name,
      description: deck.description,
      investigator_id: deck.investigator_id,
      user_id: deck.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cards: cards
    };
  }

  async updateDeck(deckId: string, deck: Partial<Deck>, cards: DeckCard[]): Promise<Deck> {
    // TODO: Implement actual API call
    return {
      id: deckId,
      name: deck.name || '',
      description: deck.description,
      investigator_id: deck.investigator_id,
      user_id: deck.user_id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cards: cards
    };
  }

  async getDeckById(id: string): Promise<Deck | null> {
    // TODO: Implement actual API call
    return null;
  }
}

export const deckService = new DeckService();
