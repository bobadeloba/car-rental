"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import NotificationBadge from "@/components/notifications/notification-badge"
import { createClientComponentClient } from "@/lib/supabase/client"
import { Menu, X, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [appSettings, setAppSettings] = useState<any>({
    app_name: "Car Rental",
    logo_url: null,
  })
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

  useEffect(() => {
    const fetchAppSettings = async () => {
      try {
        // First try the API route
        const response = await fetch("/api/app-metadata")
        if (response.ok) {
          const { data } = await response.json()
          if (data) {
            setAppSettings({
              app_name: data.appName,
              logo_url: data.logoUrl,
            })
            return
          }
        }

        // Fallback to direct query if API route fails
        const { data, error } = await supabase
          .from("admin_settings")
          .select("logo_url, app_name")
          .order("updated_at", { ascending: false })
          .limit(1)
          .single()

        if (error) {
          console.error("Error fetching app settings:", error)
          return
        }

        if (data) {
          setAppSettings(data)
        }
      } catch (error) {
        console.error("Error in fetchAppSettings:", error)
      }
    }

    fetchAppSettings()
  }, [supabase])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isActive = (path: string) => {
    return pathname === path
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const appName = appSettings?.app_name || "Premium Car Rentals"
  const logoUrl = appSettings?.logo_url

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm" : "bg-white dark:bg-gray-900"}`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center" onClick={closeMenu}>
              {logoUrl ? (
                <div className="h-12 w-auto mr-3 relative">
                  <Image
                    src={logoUrl || "/placeholder.svg"}
                    alt={appName}
                    width={200}
                    height={50}
                    className="h-full w-auto object-contain"
                    priority
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=50&width=200&text=" + encodeURIComponent(appName)
                    }}
                  />
                </div>
              ) : (
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{appName}</span>
              )}
            </Link>

            <nav className="hidden md:flex ml-10 space-x-8">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors ${isActive("/") ? "text-primary" : "text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"}`}
              >
                Home
              </Link>
              <Link
                href="/cars"
                className={`text-sm font-medium transition-colors ${isActive("/cars") ? "text-primary" : "text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"}`}
              >
                Cars
              </Link>
              <Link
                href="/tours"
                className={`text-sm font-medium transition-colors ${isActive("/tours") ? "text-primary" : "text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"}`}
              >
                Tours
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors">
                  About <ChevronDown className="ml-1 h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Link href="/about" className="w-full">
                      About Us
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/contact" className="w-full">
                      Contact
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/faq" className="w-full">
                      FAQ
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {user ? (
              <>
                <NotificationBadge userId={user.id} />
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/auth/signin">
                <Button size="sm">Sign In</Button>
              </Link>
            )}

            <button
              className="md:hidden focus:outline-none"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors ${isActive("/") ? "text-primary" : "text-gray-700 dark:text-gray-200"}`}
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link
                href="/cars"
                className={`text-sm font-medium transition-colors ${isActive("/cars") ? "text-primary" : "text-gray-700 dark:text-gray-200"}`}
                onClick={closeMenu}
              >
                Cars
              </Link>
              <Link
                href="/tours"
                className={`text-sm font-medium transition-colors ${isActive("/tours") ? "text-primary" : "text-gray-700 dark:text-gray-200"}`}
                onClick={closeMenu}
              >
                Tours
              </Link>
              <Link
                href="/about"
                className={`text-sm font-medium transition-colors ${isActive("/about") ? "text-primary" : "text-gray-700 dark:text-gray-200"}`}
                onClick={closeMenu}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className={`text-sm font-medium transition-colors ${isActive("/contact") ? "text-primary" : "text-gray-700 dark:text-gray-200"}`}
                onClick={closeMenu}
              >
                Contact
              </Link>
              <Link
                href="/faq"
                className={`text-sm font-medium transition-colors ${isActive("/faq") ? "text-primary" : "text-gray-700 dark:text-gray-200"}`}
                onClick={closeMenu}
              >
                FAQ
              </Link>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Legal</p>
                <Link
                  href="/terms"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 block py-1"
                  onClick={closeMenu}
                >
                  Terms & Conditions
                </Link>
                <Link
                  href="/privacy"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 block py-1"
                  onClick={closeMenu}
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/cookie-policy"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 block py-1"
                  onClick={closeMenu}
                >
                  Cookie Policy
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
