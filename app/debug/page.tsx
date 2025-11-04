"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Terminal,
  ArrowLeft,
  Play,
  Bug,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { QuickLogTest } from "@/components/workflow/quick-log-test"
import { ExecutionLogs } from "@/components/workflow/execution-logs"
import { LogStatusIndicator } from "@/components/workflow/log-status-indicator"
import { GmailTriggerTutorial } from "@/components/workflow/gmail-trigger-tutorial"

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Simple Header */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Debug & Testing</h1>
              <p className="text-gray-300">
                Test the frontend logging system and other debugging features
              </p>
            </div>
            <LogStatusIndicator />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Log Test */}
          <div>
            <QuickLogTest 
              workflowId="debug-test"
              showViewer={true}
            />
          </div>

          {/* Full Logs */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  All Execution Logs
                </CardTitle>
                <CardDescription>
                  View all logs from the current session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExecutionLogs
                  maxEntries={100}
                  showFilters={true}
                  className="h-96"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gmail Trigger Tutorial */}
        <div className="mt-8">
          <GmailTriggerTutorial />
        </div>

        {/* Quick Links */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>
                Navigate to other testing and demo pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/test-logs">
                  <Button variant="outline" className="w-full justify-start">
                    <Terminal className="h-4 w-4 mr-2" />
                    Full Logging Test
                  </Button>
                </Link>
                
                <Link href="/logging-demo">
                  <Button variant="outline" className="w-full justify-start">
                    <Play className="h-4 w-4 mr-2" />
                    Logging Demo
                  </Button>
                </Link>
                
                <Link href="/gmail-trigger-demo">
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Gmail Trigger Demo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Testing Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">1. Test Individual Logs</h4>
                  <p className="text-muted-foreground">
                    Click the colored buttons (Info, Success, Warning, Error, Debug) to generate individual log entries.
                    You should see them appear immediately in the log viewers.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">2. Run Quick Test</h4>
                  <p className="text-muted-foreground">
                    Click "Run Quick Test" to generate a sequence of logs that simulates a workflow execution.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">3. Check Log Visibility</h4>
                  <p className="text-muted-foreground">
                    Logs should appear in both the compact viewer (left) and the full execution logs (right).
                    Each log should have a timestamp, level badge, category, and message.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">4. Test Filtering</h4>
                  <p className="text-muted-foreground">
                    In the full logs viewer, try filtering by log level or searching for specific terms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}