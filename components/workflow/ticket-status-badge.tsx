"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Ticket,
  AlertCircle
} from "lucide-react"

interface TicketStatusBadgeProps {
  status: 'idle' | 'creating' | 'success' | 'error'
  ticketCount?: number
  lastTicketId?: string
  className?: string
}

export function TicketStatusBadge({ 
  status, 
  ticketCount = 0, 
  lastTicketId,
  className = "" 
}: TicketStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'creating':
        return {
          icon: <Clock className="h-3 w-3 animate-spin" />,
          text: 'Creating Ticket...',
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        }
      case 'success':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: ticketCount > 1 ? `${ticketCount} Tickets Created` : 
                lastTicketId ? `Ticket ${lastTicketId}` : 'Ticket Created',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'error':
        return {
          icon: <XCircle className="h-3 w-3" />,
          text: 'Ticket Creation Failed',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200'
        }
      default:
        return {
          icon: <Ticket className="h-3 w-3" />,
          text: 'Ready to Create Tickets',
          variant: 'outline' as const,
          className: 'bg-gray-50 text-gray-600 border-gray-200'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Badge 
      variant={config.variant}
      className={`inline-flex items-center gap-1 ${config.className} ${className}`}
    >
      {config.icon}
      <span className="text-xs">{config.text}</span>
    </Badge>
  )
}

// Mini version for compact spaces
export function TicketStatusIcon({ 
  status, 
  className = "h-4 w-4" 
}: { 
  status: 'idle' | 'creating' | 'success' | 'error'
  className?: string 
}) {
  switch (status) {
    case 'creating':
      return <Clock className={`${className} text-blue-600 animate-spin`} />
    case 'success':
      return <CheckCircle className={`${className} text-green-600`} />
    case 'error':
      return <XCircle className={`${className} text-red-600`} />
    default:
      return <Ticket className={`${className} text-gray-400`} />
  }
}