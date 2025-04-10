import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FilterContextType {
  xpFilter: string;
  setXpFilter: (xp: string) => void;
  clearAllFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [xpFilter, setXpFilter] = useState('0');
  const navigate = useNavigate();

  const clearAllFilters = () => {
    setXpFilter('0');
    navigate('/'); // This will clear faction and card type selection
  };

  return (
    <FilterContext.Provider value={{ xpFilter, setXpFilter, clearAllFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
