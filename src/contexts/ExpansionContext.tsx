import React, { createContext, useContext, useState, useEffect } from 'react';

interface ExpansionContextType {
  selectedExpansions: Set<string>;
  setSelectedExpansions: (expansions: Set<string>) => void;
  clearExpansions: () => void;
}

const ExpansionContext = createContext<ExpansionContextType | undefined>(undefined);

export const ExpansionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedExpansions, setSelectedExpansions] = useState<Set<string>>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('selectedExpansions');
    return saved ? new Set(JSON.parse(saved)) : new Set<string>();
  });

  // Save to localStorage whenever selectedExpansions changes
  useEffect(() => {
    localStorage.setItem('selectedExpansions', JSON.stringify(Array.from(selectedExpansions)));
  }, [selectedExpansions]);

  const clearExpansions = () => {
    setSelectedExpansions(new Set());
  };

  return (
    <ExpansionContext.Provider value={{ selectedExpansions, setSelectedExpansions, clearExpansions }}>
      {children}
    </ExpansionContext.Provider>
  );
};

export const useExpansions = () => {
  const context = useContext(ExpansionContext);
  if (context === undefined) {
    throw new Error('useExpansions must be used within an ExpansionProvider');
  }
  return context;
};
