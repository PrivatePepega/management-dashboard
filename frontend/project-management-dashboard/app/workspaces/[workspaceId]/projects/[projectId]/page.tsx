// app/workspaces/[workspaceId]/page.tsx
import ProjectDetails from "./projectDetails"





export default async function Page({params}: {
    params: Promise<{ projectId: string, workspaceId: string }>;
  }) {
    const { projectId, workspaceId } = await params;
  
    return <ProjectDetails projectId={projectId} workspaceId={workspaceId}/>;
  }