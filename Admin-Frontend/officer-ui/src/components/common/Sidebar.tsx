import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded-md text-sm font-medium ${
      isActive
        ? "bg-indigo-800 text-white"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-800">
      <div className="flex items-center justify-center h-16 bg-gray-900 shadow-lg">
        <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">Logged in as:</p>
          <p className="text-sm font-medium text-white truncate">{user?.email}</p>
        </div>
        <nav className="mt-4 px-2 space-y-1">
          <NavLink to="/" className={navItemClass} end>
            Dashboard
          </NavLink>
          <NavLink to="/officers" className={navItemClass}>
            Verify Officers
          </NavLink>
          <NavLink to="/societies/pending" className={navItemClass}>
            Verify Societies
          </NavLink>
          <NavLink to="/societies" className={navItemClass}>
            All Societies
          </NavLink>
        </nav>
        <div className="p-4 mt-auto border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full block px-4 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-gray-700 hover:text-red-300"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
