"use client";

import type { User } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { queryClient } from "@/provider/react-query-provider";
import { usePathname, useRouter } from "next/navigation";
import { publicRoutes } from "@/lib";
import { useAuthMeQuery, useLogoutMutation } from "@/hooks/use-auth";
import { Workspace } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  currentWorkspace: Workspace | null;
  handleWorkspaceSelected: (workspace: Workspace | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {


    const router = useRouter();
    const currentPath = usePathname();
    const isPublicRoute = publicRoutes.includes(currentPath);


    const { data, isLoading } = useAuthMeQuery();

    const user = data?.user ?? null;
    const isAuthenticated = !!data?.authenticated;



    const { mutateAsync: logoutRequest } = useLogoutMutation();

    const logout = async () => {
      try {
        await logoutRequest();
    
        queryClient.clear();
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };


    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null> (null)

    const handleWorkspaceSelected = (workspace: Workspace | null) => {
      setCurrentWorkspace(workspace);
    };




  const values = {
    user,
    isAuthenticated,
    isLoading,
    logout,
    currentWorkspace,
    handleWorkspaceSelected
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
