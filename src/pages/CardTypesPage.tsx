
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const CardTypesPage: React.FC = () => {
  const navigate = useNavigate();
  const { faction } = useParams<{ faction: string }>();

  // Redirect to investigator type by default
  React.useEffect(() => {
    if (faction) {
      navigate(`/cards/${faction}/investigator`);
    }
  }, [faction, navigate]);

  return null;
};

export default CardTypesPage;
