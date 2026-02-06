import React, { createContext, useContext, useState, type ReactNode } from "react";
import axios from "axios";

// Define types
interface User {
  id: string;
  name: string;
  email: string;
  role: number;
  isSuperAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Base URL for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("adminUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("adminToken"),
  );

  const isAuthenticated = !!user && !!token;

  // Set up axios interceptor for token
  axios.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/login`, {
        email,
        password,
      });

      const { token: newToken, user: newUser } = response.data.data;

      localStorage.setItem("adminToken", newToken);
      localStorage.setItem("adminUser", JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      // Throw error to be caught by the Login component for display
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message ||
            "Login failed due to an unknown error.",
        );
      }
      throw new Error("Network error or server unreachable.");
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
