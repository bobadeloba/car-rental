"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Car,
  CalendarRange,
  Settings,
  LogOut,
  MessageSquare,
  Mail,
  BarChart3,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClientComponentClient } from "@/lib/supabase/client"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Contact",
    href: "/admin/contact",
    icon: Mail,
  },
  {
    title: "Cars",
    href: "/admin/cars",
    icon: Car,
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: CalendarRange,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: LayoutDashboard,
  },
  {
    title: "Car Views",
    href: "/admin/car-views",
    icon: Eye,
  },
  {
    title: "Page Analytics",
    href: "/admin/page-analytics",
    icon: BarChart3,
  },
  {
    title: "Testimonials",
    href: "/admin/testimonials",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <div className="flex h-full flex-col">
      <div className="hidden p-6 border-b lg:block">
        <h2 className="text-lg font-semibold">Admin Dashboard</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
          <div className="mt-6 pt-6 border-t">
            <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleSignOut}>
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </Button>
            <Link
              href="/dashboard"
              className="mt-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Exit Admin
            </Link>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
