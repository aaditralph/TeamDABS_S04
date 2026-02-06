import React, { useEffect, useState } from "react";
import {
  getPendingSocieties,
  getVerifiedSocieties,
  approveSociety,
  rejectSociety,
  type Society,
} from "../../services/societyService";

interface SocietyListProps {
  showVerified?: boolean;
}

const SocietyList: React.FC<SocietyListProps> = ({ showVerified = false }) => {
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSocieties();
  }, [showVerified]);

  const fetchSocieties = async () => {
    try {
      const data = showVerified
        ? await getVerifiedSocieties()
        : await getPendingSocieties();
      setSocieties(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch societies.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm("Are you sure you want to approve this society worker?"))
      return;
    setActionLoading(id);
    try {
      await approveSociety(id);
      setSocieties((prev) => prev.filter((s) => s._id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to approve society.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to reject and delete this society worker? This action cannot be undone.",
      )
    )
      return;
    setActionLoading(id);
    try {
      await rejectSociety(id);
      setSocieties((prev) => prev.filter((s) => s._id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to reject society.");
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

  const title = showVerified ? "Verified Societies" : "Pending Societies";
  const badgeColor = showVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        {!showVerified && (
          <span className={`${badgeColor} text-sm font-medium px-2.5 py-0.5 rounded`}>
            {societies.length} pending
          </span>
        )}
      </div>
      {societies.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          {showVerified
            ? "No verified societies found."
            : "No pending societies to verify."}
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
                  Society
                </th>
                {!showVerified && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {societies.map((society) => (
                <tr key={society._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {society.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {society.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {society.societyName}
                  </td>
                  {!showVerified && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleApprove(society._id)}
                        disabled={actionLoading === society._id}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        {actionLoading === society._id ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(society._id)}
                        disabled={actionLoading === society._id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SocietyList;
