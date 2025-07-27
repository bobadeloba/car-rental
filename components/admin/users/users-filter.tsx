"use client"

import { useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, SlidersHorizontal } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"

export default function UsersFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [role, setRole] = useState(searchParams.get("role") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (role) params.set("role", role)
    if (sortBy) params.set("sortBy", sortBy)
    params.set("page", "1") // Reset to first page on filter change

    router.push(`${pathname}?${params.toString()}`)
    setIsFiltersOpen(false)
  }

  const handleReset = () => {
    setSearch("")
    setRole("")
    setSortBy("")
    router.push(pathname)
    setIsFiltersOpen(false)
  }

  return (
    <>
      {/* Desktop Filter */}
      <div className="hidden md:block bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filter Users
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="search"
                placeholder="Search by name or email..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role
            </label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="sortBy" className="text-sm font-medium">
              Sort By
            </label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sortBy">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest first</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="loyalty-asc">Loyalty Points (Low-High)</SelectItem>
                <SelectItem value="loyalty-desc">Loyalty Points (High-Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={handleFilter} className="flex-1">
              Apply Filters
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Filter */}
      <div className="md:hidden flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
          />
        </div>
        <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="sr-only">Open filters</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Users</SheetTitle>
              <SheetDescription>Apply filters to narrow down your user list</SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <label htmlFor="mobile-role" className="text-sm font-medium">
                  Role
                </label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="mobile-role">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="mobile-sortBy" className="text-sm font-medium">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="mobile-sortBy">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest first</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="loyalty-asc">Loyalty Points (Low-High)</SelectItem>
                    <SelectItem value="loyalty-desc">Loyalty Points (High-Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter>
              <Button onClick={handleFilter} className="w-full">
                Apply Filters
              </Button>
              <Button onClick={handleReset} variant="outline" className="w-full mt-2">
                Reset
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
