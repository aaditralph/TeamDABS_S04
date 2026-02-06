import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface Society {
  _id: string;
  name: string;
  email: string;
  role: number;
  isVerified: boolean;
  societyName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SocietyResponse {
  success: boolean;
  data: {
    societies: Society[];
  };
}

export const getPendingSocieties = async (): Promise<Society[]> => {
  const response = await axios.get<SocietyResponse>(
    `${API_BASE_URL}/admin/pending-societies`,
  );
  return response.data.data.societies;
};

export const getVerifiedSocieties = async (): Promise<Society[]> => {
  const response = await axios.get<SocietyResponse>(
    `${API_BASE_URL}/admin/societies`,
  );
  return response.data.data.societies;
};

export const approveSociety = async (id: string): Promise<void> => {
  await axios.put(`${API_BASE_URL}/admin/approve-society/${id}`);
};

export const rejectSociety = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/admin/reject-society/${id}`);
};
