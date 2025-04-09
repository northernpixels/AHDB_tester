import React from "react";
import CardList from "@/components/CardList";
import CardTypeList from "@/components/CardTypeList";

const CardsPage: React.FC = () => {
  return (
    <div className="flex-1">
      <CardTypeList />
      <CardList />
    </div>
  );
};

export default CardsPage;
