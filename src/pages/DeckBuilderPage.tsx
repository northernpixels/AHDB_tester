import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { deckService, Deck } from '@/services/deckService';
import { cardApi, Card as CardType } from '@/services/cardApi';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const DeckBuilderPage = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deck, setDeck] = useState<Partial<Deck>>({
    name: '',
    description: '',
    investigator_id: ''
  });
  
  const [selectedCards, setSelectedCards] = useState<Map<string, { card: CardType, quantity: number }>>(new Map());
  
  useEffect(() => {
    async function loadData() {
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to build decks',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }
      
      // If editing, load existing deck
      if (deckId && deckId !== 'new') {
        const existingDeck = await deckService.getDeckById(deckId);
        if (existingDeck) {
          setDeck(existingDeck);
          
          // Load selected cards
          const cardMap = new Map();
          if (existingDeck.cards) {
            for (const deckCard of existingDeck.cards) {
              const card = await cardApi.getCardById(deckCard.card_id);
              if (card) {
                cardMap.set(card.id, { card, quantity: deckCard.quantity });
              }
            }
          }
          setSelectedCards(cardMap);
        }
      }
      
      setLoading(false);
    }
    
    loadData();
  }, [deckId, user, navigate, toast]);
  
  const addCard = (card: CardType) => {
    setSelectedCards(prevCards => {
      const newCards = new Map(prevCards);
      const existing = newCards.get(card.id);
      
      if (existing) {
        newCards.set(card.id, { ...existing, quantity: existing.quantity + 1 });
      } else {
        newCards.set(card.id, { card, quantity: 1 });
      }
      
      return newCards;
    });
  };
  
  const removeCard = (card: CardType) => {
    setSelectedCards(prevCards => {
      const newCards = new Map(prevCards);
      const existing = newCards.get(card.id);
      
      if (existing && existing.quantity > 1) {
        newCards.set(card.id, { ...existing, quantity: existing.quantity - 1 });
      } else {
        newCards.delete(card.id);
      }
      
      return newCards;
    });
  };
  
  const handleSaveDeck = async () => {
    if (!user) return;
    
    if (!deck.name) {
      toast({
        title: 'Deck name required',
        description: 'Please provide a name for your deck',
        variant: 'destructive',
      });
      return;
    }
    
    setSaving(true);
    
    // Convert selectedCards Map to array for API
    const deckCards = Array.from(selectedCards.values()).map(({ card, quantity }) => ({
      card_id: card.id,
      quantity
    }));
    
    try {
      if (deckId && deckId !== 'new') {
        // Update existing deck
        await deckService.updateDeck(deckId, { ...deck, user_id: user.id }, deckCards);
      } else {
        // Create new deck
        await deckService.createDeck({ ...deck as Omit<Deck, 'id' | 'created_at' | 'updated_at'>, user_id: user.id }, deckCards);
      }
      
      navigate('/decks');
    } catch (error) {
      console.error('Error saving deck:', error);
      toast({
        title: 'Failed to save deck',
        description: 'There was an error saving your deck. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-deckBuilder-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8 bg-deckBuilder-card border-deckBuilder-primary/30">
        <CardHeader>
          <CardTitle className="text-deckBuilder-text">
            {deckId && deckId !== 'new' ? 'Edit Deck' : 'Create New Deck'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-deckBuilder-text mb-1 block">
                Deck Name
              </label>
              <Input
                value={deck.name}
                onChange={(e) => setDeck({ ...deck, name: e.target.value })}
                className="bg-deckBuilder-background border-deckBuilder-muted text-deckBuilder-text"
                placeholder="My Awesome Deck"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-deckBuilder-text mb-1 block">
                Description
              </label>
              <Textarea
                value={deck.description || ''}
                onChange={(e) => setDeck({ ...deck, description: e.target.value })}
                className="bg-deckBuilder-background border-deckBuilder-muted text-deckBuilder-text"
                placeholder="Describe your deck strategy..."
              />
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handleSaveDeck} 
                disabled={saving} 
                className="bg-deckBuilder-primary hover:bg-deckBuilder-secondary"
              >
                {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                {saving ? 'Saving...' : 'Save Deck'}
              </Button>
              <Button 
                onClick={() => navigate('/decks')} 
                variant="outline" 
                className="ml-2 border-deckBuilder-muted text-deckBuilder-text"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="max-w-xl mx-auto">
        <Card className="bg-deckBuilder-card border-deckBuilder-primary/30">
          <CardHeader>
            <CardTitle className="text-deckBuilder-text">Your Deck</CardTitle>
            <div className="text-deckBuilder-muted text-sm">
              {Array.from(selectedCards.values()).reduce((acc, { quantity }) => acc + quantity, 0)} Cards
            </div>
          </CardHeader>
          <CardContent>
            {selectedCards.size === 0 ? (
              <div className="text-center py-8 text-deckBuilder-muted">
                Your deck is empty. Click 'Add Cards' to start building your deck.
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from(selectedCards.values())
                  .sort((a, b) => a.card.name.localeCompare(b.card.name))
                  .map(({ card, quantity }) => (
                    <div key={card.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="w-6 text-center text-deckBuilder-accent">{quantity}x</span>
                        <span className="ml-2 text-deckBuilder-text">{card.name}</span>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => removeCard(card)}
                          className="h-6 w-6 p-0 text-deckBuilder-muted hover:text-red-400"
                        >
                          -
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => addCard(card)}
                          className="h-6 w-6 p-0 text-deckBuilder-muted hover:text-deckBuilder-accent"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeckBuilderPage;
