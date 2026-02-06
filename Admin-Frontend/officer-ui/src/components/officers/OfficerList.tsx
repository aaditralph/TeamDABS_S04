import React, { useEffect, useState } from "react";
import {
  getPendingOfficers,
  approveOfficer,
  rejectOfficer,
  downloadOfficerDocument,
  type Officer,
} from "../../services/officerService";

const OfficerList: React.FC = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const data = await getPendingOfficers();
      setOfficers(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch pending officers.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm("Are you sure you want to approve this officer?")) return;
    setActionLoading(id);
    try {
      await approveOfficer(id);
      setOfficers((prev) => prev.filter((o) => o._id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to approve officer.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to reject and delete this officer? This action cannot be undone.",
      )
    )
      return;
    setActionLoading(id);
    try {
      await rejectOfficer(id);
      setOfficers((prev) => prev.filter((o) => o._id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to reject officer.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Pending Officers
        </h3>
        <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded">
          {officers.length} pending
        </span>
      </div>
      {officers.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No pending officers to verify.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {officers.map((officer) => (
                <tr key={officer._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {officer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {officer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {officer.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => downloadOfficerDocument(officer._id).catch(console.error)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      {officer.documentType}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleApprove(officer._id)}
                      disabled={actionLoading === officer._id}
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                    >
                      {actionLoading === officer._id ? "Processing..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleReject(officer._id)}
                      disabled={actionLoading === officer._id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OfficerList;
