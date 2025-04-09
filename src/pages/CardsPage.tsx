
import React from "react";
import CardList from "@/components/CardList";

const CardsPage: React.FC = () => {
  console.log('CardsPage rendering');
  return (
    <div className="flex-1">
      <CardList />
    </div>
  );
};

export default CardsPage;
