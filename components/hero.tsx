<<<<<<< HEAD
"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative pt-32 pb-20 overflow-hidden min-h-[90vh] flex items-center">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 gradient-mesh-bg" />
      
      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 left-[10%] w-96 h-96 rounded-full bg-gradient-primary opacity-20 blur-3xl"
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-[15%] w-80 h-80 rounded-full bg-gradient-secondary opacity-20 blur-3xl"
        animate={{
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Interactive cursor glow */}
      <motion.div
        className="absolute w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, transparent 70%)",
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30 text-sm font-medium mb-8 group hover:glass-card-hover transition-all duration-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-foreground/90">Your AI Operating System</span>
            <svg 
              className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-balance font-display"
          >
            The all-in-one{" "}
            <span className="text-gradient relative inline-block">
              AI platform
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-primary rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </span>
            <br />
            for your enterprise
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto text-balance leading-relaxed"
          >
            Roll out powerful AI to your entire organization. Build custom assistants, automate workflows, and integrate
            with your tools—all while maintaining enterprise-grade security.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="text-base px-8 py-6 bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold glow-cyan transition-all duration-300 group"
                >
                  Get started - it's free
                  <svg 
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/demo">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-base px-8 py-6 glass-card hover:glass-card-hover border-primary/30 hover:border-primary/50 transition-all duration-300 group"
                >
                  <svg 
                    className="w-5 h-5 mr-2 text-primary" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M6.5 5.5L13.5 10L6.5 14.5V5.5Z" />
                  </svg>
                  Watch demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust Badge */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-sm text-muted-foreground"
          >
            <span className="inline-flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              7-day free trial
            </span>
            <span className="mx-2 text-muted-foreground/50">•</span>
            <span className="inline-flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No credit card required
            </span>
          </motion.p>

          {/* Floating stats cards */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { label: "Active Users", value: "50K+", delay: 0.5 },
              { label: "Workflows Created", value: "2M+", delay: 0.6 },
              { label: "Enterprise Clients", value: "1.5K+", delay: 0.7 },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: stat.delay }}
                whileHover={{ y: -5 }}
                className="glass-card p-6 rounded-2xl hover:glass-card-hover transition-all duration-300 group"
              >
                <div className="text-3xl font-bold text-gradient font-display mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
=======
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Added gradient mesh background for futuristic AI feel */}
      <div className="absolute inset-0 gradient-mesh-bg" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full gradient-ai-accent text-white text-sm font-medium mb-6">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2L10 6L14 6.5L11 9.5L11.5 14L8 12L4.5 14L5 9.5L2 6.5L6 6L8 2Z" fill="currentColor" />
            </svg>
            Your AI Operating System
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance">
            The all-in-one <span className="text-gradient">AI platform</span> for your enterprise
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance leading-relaxed">
            Roll out powerful AI to your entire organization. Build custom assistants, automate workflows, and integrate
            with your tools—all while maintaining enterprise-grade security.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8" asChild>
              <Link href="/signup">Get started - it's free</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 bg-transparent" asChild>
              <Link href="/demo">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.5 5.5L13.5 10L6.5 14.5V5.5Z" fill="currentColor" />
                  <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                Watch demo
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">7-day free trial • No credit card required</p>
>>>>>>> 98aefe1c349c87e92395c1619df9495bdc5a2129
        </div>
      </div>
    </section>
  )
}
