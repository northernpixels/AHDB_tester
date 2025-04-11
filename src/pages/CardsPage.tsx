import React from "react";
import { useParams } from "react-router-dom";
import CardList from "@/components/CardList";
import CardTypeList from "@/components/CardTypeList";

const CardsPage: React.FC = () => {
  const { faction, type } = useParams<{ faction: string; type: string }>();

  if (!faction) {
    return null;
  }

  return (
    <div className="flex-1">
      <CardTypeList />
      <CardList faction={faction} type={type} />
    </div>
  );
};

export default CardsPage;
