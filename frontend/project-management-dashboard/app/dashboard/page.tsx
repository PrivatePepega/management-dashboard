// app/workspaces/[workspaceId]/page.tsx
"use client"
import DashboardDetails from "./dashboardDetails";
import { useSearchParams } from "next/navigation";





export default function Page() {

    const searchParams = useSearchParams();

    const workspaceId = searchParams.get("workspaceId");
  
    return <DashboardDetails workspaceId={workspaceId}/>;
  }