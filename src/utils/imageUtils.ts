import { ArkhamCard } from '@/types/arkham-types';

export interface ImageInfo {
  term: string;
  url?: string;
}

export async function findImagesForTerms(terms: string[], cards: ArkhamCard[]): Promise<ImageInfo[]> {
  return terms.map(term => {
    // Try to find a card with a matching name
    const matchingCard = cards.find(card => 
      card.name.toLowerCase() === term.toLowerCase() ||
      (card.traits && card.traits.toLowerCase().includes(term.toLowerCase()))
    );

    return {
      term,
      url: matchingCard?.imagesrc
    };
  });
}
