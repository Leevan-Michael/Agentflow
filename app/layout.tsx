import type React from "react"
import type { Metadata } from "next"
<<<<<<< HEAD
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans"
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-display"
})
=======
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
>>>>>>> 98aefe1c349c87e92395c1619df9495bdc5a2129

export const metadata: Metadata = {
  title: "AgentFlow - The All-in-One Agentic AI Platform",
  description: "Enterprise-ready AI platform for teams. Chat, assistants, workflows, and integrations.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
<<<<<<< HEAD
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        {children}
      </body>
=======
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>{children}</body>
>>>>>>> 98aefe1c349c87e92395c1619df9495bdc5a2129
    </html>
  )
}
