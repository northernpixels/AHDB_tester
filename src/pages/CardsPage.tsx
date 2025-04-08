
import React from "react";
import CardList from "@/components/CardList";

const CardsPage: React.FC = () => {
  console.log('CardsPage rendering');
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-arkham-black p-6">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-arkham-purple">Arkham Horror Deck Builder</h1>
          <p className="text-lg text-gray-300 mt-2">Browse cards</p>
        </div>
      </header>

      <main className="flex-grow py-8">
        <CardList />
      </main>

      <footer className="bg-arkham-black p-4 mt-12 text-center text-gray-400">
        <div className="container mx-auto">
          <p>Arkham Horror Deck Builder - Using data from ArkhamDB</p>
        </div>
      </footer>
    </div>
  );
};

export default CardsPage;
