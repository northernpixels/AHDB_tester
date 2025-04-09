import React from 'react';
import { useExpansions } from '@/contexts/ExpansionContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

const EXPANSIONS = [
  "Revised Core Set",
  "The Dunwich Legacy",
  "The Path To Carcosa",
  "The Forgotten Age",
  "The Circle Undone",
  "The Dream Eaters",
  "The Innsmouth Conspiracy",
  "Edge Of The Earth",
  "The Scarlet Keys",
  "The Feast Of Hemlock Vale"
];

const ExpansionSelector: React.FC = () => {
  const { selectedExpansions, setSelectedExpansions, clearExpansions } = useExpansions();

  const toggleExpansion = (expansion: string) => {
    const newExpansions = new Set(selectedExpansions);
    if (newExpansions.has(expansion)) {
      newExpansions.delete(expansion);
    } else {
      newExpansions.add(expansion);
    }
    setSelectedExpansions(newExpansions);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Filter by Expansion</Label>
        <Button
          variant="outline"
          size="icon"
          onClick={clearExpansions}
          title="Clear expansions"
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {EXPANSIONS.map((expansion) => (
          <Button
            key={expansion}
            variant={selectedExpansions.has(expansion) ? "default" : "outline"}
            className="justify-start"
            onClick={() => toggleExpansion(expansion)}
          >
            {expansion}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ExpansionSelector;
