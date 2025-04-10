
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ExpansionProvider } from "./contexts/ExpansionContext";
import { FilterProvider } from "./contexts/FilterContext";

import ExpansionSelector from "./components/ExpansionSelector";
import FactionSelector from "./components/FactionSelector";
import CardTypeList from "./components/CardTypeList";
import Index from "./pages/Index";
import InvestigatorsPage from "./pages/InvestigatorsPage";
import CardTypesPage from "./pages/CardTypesPage";
import CardsPage from "./pages/CardsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  console.log('App rendering');
  return (
  <QueryClientProvider client={queryClient}>
    <ExpansionProvider>
      <HashRouter>
        <FilterProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <div className="flex flex-col min-h-screen">
              <div className="bg-arkham-black p-6 space-y-6">
                <div className="container mx-auto space-y-6">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-arkham-purple">Arkham Horror Deck Builder</h1>
                    <p className="text-lg text-gray-300 mt-2">Create custom investigator decks for your next investigation</p>
                  </div>
                  <ExpansionSelector />
                  <FactionSelector />
                  <CardTypeList />
                </div>
              </div>
              <main className="flex-1 container mx-auto p-4">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/cards/:faction" element={<CardsPage />} />
                  <Route path="/cards/:faction/:type" element={<CardsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </TooltipProvider>
        </FilterProvider>
      </HashRouter>
    </ExpansionProvider>
  </QueryClientProvider>
  );
};

export default App;
