<<<<<<< HEAD
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-card border-b border-primary/20 shadow-lg shadow-primary/5"
          : "bg-transparent border-b border-border/20"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="relative group">
              <Logo />
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                layoutId="headerUnderline"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: "#products", label: "Products" },
                { href: "#features", label: "Features" },
                { href: "#pricing", label: "Pricing" },
                { href: "#security", label: "Security" },
                { href: "/docs", label: "Docs" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  {item.label}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </Link>
              ))}
=======
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <Logo />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="#products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Products
              </Link>
              <Link href="/workflows" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Workflows
              </Link>
              <Link href="/gmail-setup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Gmail Setup
              </Link>
              <Link href="/credentials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Credentials
              </Link>
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="#security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Security
              </Link>
              <Link href="/debug" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Debug
              </Link>
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </Link>
>>>>>>> 98aefe1c349c87e92395c1619df9495bdc5a2129
            </nav>
          </div>

          <div className="flex items-center gap-3">
<<<<<<< HEAD
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/signin">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:bg-accent/50 transition-colors"
                >
                  Sign in
                </Button>
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/signup">
                <Button 
                  size="sm" 
                  className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold glow-subtle transition-all duration-300"
                >
                  Get started
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
=======
            <Button variant="ghost" size="sm" asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
>>>>>>> 98aefe1c349c87e92395c1619df9495bdc5a2129
  )
}
