import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Welcome back, {user?.name || "Admin"}. Use the sidebar to manage verification
        workflows.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Quick Actions
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              Verification
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <a
                href="/officers"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Review pending officers &rarr;
              </a>
            </div>
            <div className="text-sm mt-2">
              <a
                href="/societies/pending"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Review pending societies &rarr;
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">System</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">Status</dd>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm text-gray-500">
              All systems operational. Authenticated as Admin Role.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
