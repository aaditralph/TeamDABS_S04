import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface Officer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: number;
  isVerified: boolean;
  documentType: string;
  documentUrl: string;
}

export interface OfficerResponse {
  success: boolean;
  data: {
    officers: Officer[];
  };
}

export const getPendingOfficers = async (): Promise<Officer[]> => {
  const response = await axios.get<OfficerResponse>(
    `${API_BASE_URL}/admin/pending-officers`,
  );
  return response.data.data.officers;
};

export const approveOfficer = async (id: string): Promise<void> => {
  await axios.put(`${API_BASE_URL}/admin/approve-officer/${id}`);
};

export const rejectOfficer = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/admin/reject-officer/${id}`);
};

export const downloadOfficerDocument = async (id: string): Promise<void> => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/admin/officer-document/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch document");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `officer-document-${id}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading document:", error);
    throw error;
  }
};
