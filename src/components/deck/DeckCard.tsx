import { Button } from '@/components/ui/button';
import { Card as CardType } from '@/services/cardApi';

interface DeckCardProps {
  card: CardType;
  quantity: number;
  onAdd: (card: CardType) => void;
  onRemove: (card: CardType) => void;
}

export function DeckCard({ card, quantity, onAdd, onRemove }: DeckCardProps) {
  return (
    <div className="relative group">
      <div className="aspect-[2.5/3.5] bg-deckBuilder-background border border-deckBuilder-muted/30 rounded-lg overflow-hidden">
        {card.image_url ? (
          <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-deckBuilder-background">
            <span className="text-deckBuilder-muted text-sm text-center p-2">{card.name}</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex gap-2">
            <Button 
              size="sm"
              variant="ghost"
              onClick={() => onRemove(card)}
              className="text-white hover:text-red-400"
              disabled={quantity === 0}
            >
              -
            </Button>
            <span className="text-white font-medium">{quantity}</span>
            <Button 
              size="sm"
              variant="ghost"
              onClick={() => onAdd(card)}
              className="text-white hover:text-green-400"
            >
              +
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
