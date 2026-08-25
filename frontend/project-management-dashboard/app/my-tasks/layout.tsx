"use client";

import { useAuth } from "@/provider/auth-context-provider";
import { redirect } from "next/navigation";
import { Button } from '@/components/ui/button';
import React, { useState } from 'react'
import { Workspace } from "@/types";
import {Header} from "@/components/layout/Header";
import { SidebarComponent } from "@/components/layout/Sidebar-Component";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { fetchData } from "@/lib/fetch-util";







export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, currentWorkspace, handleWorkspaceSelected } = useAuth();
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false)





  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    redirect("/auth/sign-in");
  }

  return <>
    <div className="flex h-screen w-full">
      <SidebarComponent currentWorkspace={currentWorkspace}/>
      <div className="flex flex-1 flex-col h-full">
        <Header
          onWorkspaceSelected = {handleWorkspaceSelected}
          selectedWorkspace = {currentWorkspace}
          onCreateWorkspace = {() => setIsCreatingWorkspace(true)}
        />
        <main className="flex-1 overflow-y-auto h-full w-full">
          <div className="mx-auto container px-2 sm:px-8 py-0 md:py-8 w-full h-full">
            {children}
          </div>
        </main>
      </div>
      <CreateWorkspace 
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
      />
    </div>
  </>;
}
