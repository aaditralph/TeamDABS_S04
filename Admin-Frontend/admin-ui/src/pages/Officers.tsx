import React from "react";
import OfficerList from "../components/officers/OfficerList";

const Officers: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Officer Verification</h1>
      <OfficerList />
    </div>
  );
};

export default Officers;
