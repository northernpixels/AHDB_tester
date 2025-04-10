import React, { useState } from 'react';
import { useExpansions } from '@/contexts/ExpansionContext';
import { useFilters } from '@/contexts/FilterContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { normalizePackName } from '@/api/arkhamAPI';

const BOX_EXPANSIONS = [
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

const OTHER_PACKS = [
  "Return to Night of the Zealot",
  "Return to The Dunwich Legacy",
  "Return to The Path to Carcosa",
  "Return to The Forgotten Age",
  "Return to The Circle Undone",
  "The Blob That Ate Everything",
  "Murder at the Excelsior Hotel",
  "War of the Outer Gods",
  "Machinations Through Time",
  "Fortune and Folly",
  "The Scarlet Keys Investigator Expansion",
  "The Feast of Hemlock Vale Investigator Expansion"
];

const ExpansionSelector: React.FC = () => {
  const { selectedExpansions, setSelectedExpansions } = useExpansions();
  const { clearAllFilters } = useFilters();
  const [showOtherPacks, setShowOtherPacks] = useState(false);

  const toggleExpansion = (expansion: string) => {
    const normalizedExpansion = normalizePackName(expansion) || expansion;
    const newExpansions = new Set(selectedExpansions);
    if (newExpansions.has(normalizedExpansion)) {
      newExpansions.delete(normalizedExpansion);
    } else {
      newExpansions.add(normalizedExpansion);
    }
    setSelectedExpansions(newExpansions);
  };

  return (
    <div className="space-y-4">
      {/* Box Expansions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Filter by Box Expansions</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Clear all selections</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedExpansions(new Set());
                clearAllFilters();
              }}
              title="Clear expansions"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BOX_EXPANSIONS.map((expansion) => (
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

      {/* Other Packs */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setShowOtherPacks(!showOtherPacks)}
        >
          <span>Other Packs</span>
          <span className="text-xs">{showOtherPacks ? '▼' : '▶'}</span>
        </Button>
        {showOtherPacks && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 border-l-2 border-arkham-purple/20 pl-2">
            {OTHER_PACKS.map((pack) => (
              <Button
                key={pack}
                variant={selectedExpansions.has(pack) ? "default" : "outline"}
                className="justify-start"
                onClick={() => toggleExpansion(pack)}
              >
                {pack}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpansionSelector;
