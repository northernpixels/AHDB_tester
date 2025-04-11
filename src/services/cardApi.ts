export interface Card {
  id: string;
  name: string;
  type?: string;
  faction?: string;
  description?: string;
  image_url?: string;
}

class CardApi {
  async getAllCards(): Promise<Card[]> {
    // TODO: Implement actual API call
    return [];
  }

  async getCardById(id: string): Promise<Card | null> {
    // TODO: Implement actual API call
    return null;
  }
}

export const cardApi = new CardApi();
