// app/workspaces/[workspaceId]/page.tsx
import TaskDetails from "./taskDetails"





export default async function Page({params}: {
    params: Promise<{ taskId:string, projectId: string, workspaceId: string }>;
  }) {
    const { taskId, projectId, workspaceId } = await params;
  
    return <TaskDetails projectId={projectId} workspaceId={workspaceId} taskId={taskId}/>;
  }