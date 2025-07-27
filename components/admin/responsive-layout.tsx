"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ResponsiveLayoutProps {
  sidebar?: React.ReactNode
  children: React.ReactNode
}

export function ResponsiveLayout({ sidebar, children }: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar when ESC key is pressed
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false)
      }
    }

    window.addEventListener("keydown", handleEsc)
    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [sidebarOpen])

  if (!sidebar) {
    return <div className="w-full max-w-full overflow-x-hidden">{children}</div>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-card shadow-lg transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 lg:hidden">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
        <div className="h-[calc(100%-4rem)] overflow-y-auto">{sidebar}</div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden w-full">
        {/* Mobile header */}
        <div className="flex h-16 items-center border-b px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Car Rental Admin</h1>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 w-full">{children}</main>
      </div>
    </div>
  )
}
