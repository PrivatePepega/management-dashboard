"use client"
import { RecentProjects } from "@/components/dashboard/recent-projects";
import { StatsCard } from "@/components/dashboard/stat-card";
import { StatisticsCharts } from "@/components/dashboard/statistics-charts";
import { Loader } from "@/components/loader";
import { UpcomingTasks } from "@/components/upcoming-tasks";
import { useGetWorkspaceStatsQuery } from "@/hooks/use-workspace";
import type {
  Project,
  ProjectStatusData,
  StatsCardProps,
  Task,
  TaskPriorityData,
  TaskTrendsData,
  WorkspaceProductivityData,
} from "@/types";




interface DashboardDetailsProps{
    workspaceId: string | null;
} 

const DashboardDetails = ({workspaceId,}: DashboardDetailsProps) => {

  
    const { data, isPending } = useGetWorkspaceStatsQuery(workspaceId) as {
      data: {
        stats: StatsCardProps;
        taskTrendsData: TaskTrendsData[];
        projectStatusData: ProjectStatusData[];
        taskPriorityData: TaskPriorityData[];
        workspaceProductivityData: WorkspaceProductivityData[];
        upcomingTasks: Task[];
        recentProjects: Project[];
      };
      isPending: boolean;
    };

    
    if(!workspaceId){
      return(
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
        </div>
      )
    }

    if (isPending) {
      return (
        <div>
          <Loader />
        </div>
      );
    }
  



    return (
      <div className="space-y-8 2xl:space-y-12">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
  
        <StatsCard data={data.stats} />
  
        <StatisticsCharts
          stats={data.stats}
          taskTrendsData={data.taskTrendsData}
          projectStatusData={data.projectStatusData}
          taskPriorityData={data.taskPriorityData}
          workspaceProductivityData={data.workspaceProductivityData}
        />
  
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentProjects data={data.recentProjects} workspaceId={workspaceId}/>
          <UpcomingTasks data={data.upcomingTasks} workspaceId={workspaceId}/>
        </div>
      </div>
    );
  };

export default DashboardDetails