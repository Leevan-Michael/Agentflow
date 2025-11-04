"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft,
  Mail,
  Settings,
  Play,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Key,
  Zap,
  Shield,
  Clock,
  AlertTriangle,
  Info
} from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { GmailTriggerTutorial } from "@/components/workflow/gmail-trigger-tutorial"

export default function GmailSetupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const markStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step])
    }
    if (step < 5) {
      setCurrentStep(step + 1)
    }
  }

  const steps = [
    {
      id: 1,
      title: "Gmail Account Setup",
      description: "Configure Gmail API access and authentication",
      icon: <Mail className="h-5 w-5" />,
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "Choose Trigger Type",
      description: "Select what email events should start your workflow",
      icon: <Zap className="h-5 w-5" />,
      color: "bg-green-500"
    },
    {
      id: 3,
      title: "Configure Filters",
      description: "Set up email filtering and processing options",
      icon: <Settings className="h-5 w-5" />,
      color: "bg-purple-500"
    },
    {
      id: 4,
      title: "Test Configuration",
      description: "Verify your setup works with test emails",
      icon: <Play className="h-5 w-5" />,
      color: "bg-orange-500"
    },
    {
      id: 5,
      title: "Deploy Workflow",
      description: "Activate your Gmail trigger in production",
      icon: <CheckCircle className="h-5 w-5" />,
      color: "bg-emerald-500"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/workflows">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Workflows
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Gmail Trigger Setup
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Set up automated workflows that trigger when specific Gmail events occur. 
              Turn your inbox into a powerful automation engine.
            </p>
            <div className="flex items-center gap-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <Play className="h-5 w-5 mr-2" />
                Start Setup
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <ExternalLink className="h-5 w-5 mr-2" />
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Setup Progress</h2>
            <Badge variant="secondary">
              {completedSteps.length} of {steps.length} completed
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all ${
                      completedSteps.includes(step.id) 
                        ? 'bg-green-500' 
                        : currentStep === step.id 
                          ? step.color 
                          : 'bg-gray-300'
                    }`}
                  >
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="font-medium text-sm">{step.title}</div>
                    <div className="text-xs text-muted-foreground max-w-24">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded ${
                    completedSteps.includes(step.id) ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(parseInt(value))}>
          <TabsList className="grid w-full grid-cols-5">
            {steps.map((step) => (
              <TabsTrigger 
                key={step.id} 
                value={step.id.toString()}
                className="flex items-center gap-2"
                disabled={step.id > currentStep && !completedSteps.includes(step.id)}
              >
                {completedSteps.includes(step.id) ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  step.icon
                )}
                <span className="hidden sm:inline">Step {step.id}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Step 1: Gmail Account Setup */}
          <TabsContent value="1" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Gmail Account Setup
                </CardTitle>
                <CardDescription>
                  Connect your Gmail account and configure API access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    You'll need a Gmail account with API access enabled. We'll guide you through the OAuth setup process.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">What you'll need:</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Gmail account with admin access
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Google Cloud Project (we'll help create one)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Gmail API enabled
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        OAuth2 credentials configured
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Permissions required:</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        Read email messages
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        Modify email labels
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        Send email messages (optional)
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        Access email metadata
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" asChild>
                    <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Google Cloud Console
                    </a>
                  </Button>
                  <Button onClick={() => markStepComplete(1)}>
                    Continue to Trigger Setup
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Choose Trigger Type */}
          <TabsContent value="2" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Choose Trigger Type
                </CardTitle>
                <CardDescription>
                  Select what Gmail events should start your workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      type: "newEmail",
                      title: "Any New Email",
                      description: "Trigger on every new email received",
                      icon: <Mail className="h-5 w-5" />,
                      useCase: "General email processing"
                    },
                    {
                      type: "senderEmail",
                      title: "Specific Sender",
                      description: "Monitor emails from particular senders",
                      icon: <Mail className="h-5 w-5" />,
                      useCase: "Customer support automation"
                    },
                    {
                      type: "subjectContains",
                      title: "Subject Keywords",
                      description: "Trigger on emails with specific subject terms",
                      icon: <Mail className="h-5 w-5" />,
                      useCase: "Bug report processing"
                    },
                    {
                      type: "hasAttachment",
                      title: "Has Attachments",
                      description: "Process emails with file attachments",
                      icon: <Mail className="h-5 w-5" />,
                      useCase: "Document processing"
                    },
                    {
                      type: "labeledEmail",
                      title: "Gmail Labels",
                      description: "Trigger on emails with specific labels",
                      icon: <Mail className="h-5 w-5" />,
                      useCase: "Organized email workflows"
                    },
                    {
                      type: "customQuery",
                      title: "Advanced Query",
                      description: "Use Gmail's advanced search syntax",
                      icon: <Mail className="h-5 w-5" />,
                      useCase: "Complex filtering needs"
                    }
                  ].map((trigger) => (
                    <Card key={trigger.type} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {trigger.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{trigger.title}</h3>
                            <p className="text-xs text-muted-foreground">{trigger.description}</p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <strong>Use case:</strong> {trigger.useCase}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    You can combine multiple trigger types and use advanced filtering options in the next step.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => markStepComplete(2)}>
                    Continue to Filters
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Configure Filters */}
          <TabsContent value="3" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configure Filters & Options
                </CardTitle>
                <CardDescription>
                  Set up email filtering and processing options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <GmailTriggerTutorial />

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => markStepComplete(3)}>
                    Continue to Testing
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: Test Configuration */}
          <TabsContent value="4" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Test Your Configuration
                </CardTitle>
                <CardDescription>
                  Verify your Gmail trigger works correctly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Testing helps ensure your workflow will work correctly in production. We recommend testing with sample emails first.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Testing Options</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Play className="h-4 w-4 mr-2" />
                        Test Connection
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Test Email
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Validate Query
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Run Full Test
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">What to Check</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Gmail API connection works
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Email query returns expected results
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Trigger activates on test emails
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Workflow processes emails correctly
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Error handling works as expected
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => markStepComplete(4)}>
                    Continue to Deployment
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 5: Deploy Workflow */}
          <TabsContent value="5" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Deploy Your Workflow
                </CardTitle>
                <CardDescription>
                  Activate your Gmail trigger in production
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Great! Your Gmail trigger is ready for production. Review the settings below and activate when ready.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Deployment Checklist</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Gmail authentication configured
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Trigger conditions tested
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Workflow logic validated
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Error handling verified
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        Monitoring configured
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Next Steps</h3>
                    <div className="space-y-3">
                      <Button className="w-full justify-start">
                        <Play className="h-4 w-4 mr-2" />
                        Activate Workflow
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure Monitoring
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Dashboard
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(4)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => markStepComplete(5)} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Setup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Quick Links & Resources</CardTitle>
              <CardDescription>
                Helpful resources for Gmail trigger setup and troubleshooting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/gmail-trigger-demo">
                  <Button variant="outline" className="w-full justify-start">
                    <Play className="h-4 w-4 mr-2" />
                    Interactive Demo
                  </Button>
                </Link>
                
                <Link href="/debug">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Debug Tools
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/HOW_TO_TRIGGER_GMAIL.md" target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Full Documentation
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}