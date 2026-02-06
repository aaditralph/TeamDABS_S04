import React from "react";
import { useSearchParams } from "react-router-dom";
import SocietyList from "../components/societies/SocietyList";

const Societies: React.FC = () => {
  const [searchParams] = useSearchParams();
  const showVerified = searchParams.get("verified") === "true";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {showVerified ? "All Societies" : "Society Verification"}
      </h1>
      <SocietyList showVerified={showVerified} />
    </div>
  );
};

export default Societies;
