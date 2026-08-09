"use client";

import type { User } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { queryClient } from "@/provider/react-query-provider";
import { usePathname, useRouter } from "next/navigation";
import { publicRoutes } from "@/lib";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


    const router = useRouter();
    const currentPath = usePathname();
    const isPublicRoute = publicRoutes.includes(currentPath);





  const login = async (data: any) => {

  };

  const logout = async () => {

  };

  const values = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};