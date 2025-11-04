import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProjectManagementDashboard } from "@/components/project-management/project-management-dashboard"

export default function ProjectsPage() {
  return (
    <DashboardLayout>
      <ProjectManagementDashboard />
    </DashboardLayout>
  )
}