"use client";

import { useAuth } from "@/provider/auth-context-provider";
import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    redirect("/auth/sign-in");
  }

  return <>{children}</>;
}
