"use client"

import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { WorkflowCanvas } from "@/components/workflow/workflow-canvas"

export const dynamic = "force-dynamic"

export default function WorkflowsPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      >
        <div className="h-full">
          <WorkflowCanvas
            workflowId="demo-workflow"
          />
        </div>
      </Suspense>
    </DashboardLayout>
  )
}