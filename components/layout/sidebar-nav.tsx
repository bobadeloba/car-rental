"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { LayoutDashboard, CalendarDays, User, Settings, Car, FileText, Bell, CreditCard } from "lucide-react"

interface SidebarNavProps {
  isAdmin?: boolean
}

export default function SidebarNav({ isAdmin = false }: SidebarNavProps) {
  const pathname = usePathname()

  const userNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "My Bookings",
      href: "/dashboard/bookings",
      icon: CalendarDays,
    },
    {
      title: "Documents",
      href: "/dashboard/documents",
      icon: FileText,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      title: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
    },
    {
      title: "Payments",
      href: "/dashboard/payments",
      icon: CreditCard,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  const adminNavItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: User,
    },
    {
      title: "Cars",
      href: "/admin/cars",
      icon: Car,
    },
    {
      title: "Bookings",
      href: "/admin/bookings",
      icon: CalendarDays,
    },
    {
      title: "Documents",
      href: "/admin/documents",
      icon: FileText,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  const navItems = isAdmin ? adminNavItems : userNavItems

  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
            pathname === item.href || pathname.startsWith(`${item.href}/`)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          <item.icon className="mr-3 h-5 w-5" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
