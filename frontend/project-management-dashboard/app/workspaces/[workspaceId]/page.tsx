// app/workspaces/[workspaceId]/page.tsx
import WorkspaceDetails from "./workspaceDetails"


interface WorkspaceDetailsProps {
    workspaceId: string;
  }


export default async function Page({params,}: {
    params: Promise<{ workspaceId: string }>;
  }) {
    const { workspaceId } = await params;
  
    return <WorkspaceDetails workspaceId={workspaceId} />;
  }