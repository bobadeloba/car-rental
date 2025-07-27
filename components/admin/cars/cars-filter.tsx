"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, SlidersHorizontal, AlertCircle } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CarsFilterProps {
  searchParams: {
    search: string
    category: string
    status: string
    sort: string
  }
}

interface Category {
  id: string
  name: string
}

export default function CarsFilter({ searchParams }: CarsFilterProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [search, setSearch] = useState(searchParams.search || "")
  const [category, setCategory] = useState(searchParams.category || "")
  const [status, setStatus] = useState(searchParams.status || "")
  const [sort, setSort] = useState(searchParams.sort || "created_at:desc")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Fetch categories on component mount with retry logic
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Create a new Supabase client instance or get the existing one
        const supabase = getSupabaseClient()

        // Add a timeout to the fetch operation
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Request timed out")), 10000)
        })

        // Race between the fetch and the timeout
        const { data, error } = (await Promise.race([
          supabase.from("categories").select("id, name").order("name"),
          timeoutPromise,
        ])) as any

        if (error) {
          throw error
        }

        // If we get here, the request was successful
        setCategories(data || [])
        setRetryCount(0) // Reset retry count on success
      } catch (err: any) {
        console.error("Error fetching categories:", err)

        // Provide a more user-friendly error message
        const errorMessage = err.message || "Failed to load categories"
        setError(errorMessage)

        // Implement retry logic (max 3 retries)
        if (retryCount < 3) {
          console.log(`Retrying... Attempt ${retryCount + 1}`)
          setRetryCount((prev) => prev + 1)
          // Retry after a delay (exponential backoff)
          setTimeout(() => {
            fetchCategories()
          }, 1000 * Math.pow(2, retryCount))
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [retryCount])

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (category && category !== "all") params.set("category", category)
    if (status && status !== "all") params.set("status", status)
    if (sort) params.set("sort", sort)
    params.set("page", "1") // Reset to first page on filter change

    router.push(`${pathname}?${params.toString()}`)
    setIsFiltersOpen(false)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    // Apply filter immediately for desktop view
    if (window.innerWidth >= 768) {
      setTimeout(() => {
        const params = new URLSearchParams()
        if (search) params.set("search", search)
        if (value && value !== "all") params.set("category", value)
        if (status && status !== "all") params.set("status", status)
        if (sort) params.set("sort", sort)
        params.set("page", "1")
        router.push(`${pathname}?${params.toString()}`)
      }, 0)
    }
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    // Apply filter immediately for desktop view
    if (window.innerWidth >= 768) {
      setTimeout(() => {
        const params = new URLSearchParams()
        if (search) params.set("search", search)
        if (category && category !== "all") params.set("category", category)
        if (value && value !== "all") params.set("status", value)
        if (sort) params.set("sort", sort)
        params.set("page", "1")
        router.push(`${pathname}?${params.toString()}`)
      }, 0)
    }
  }

  const handleSortChange = (value: string) => {
    setSort(value)
    // Apply filter immediately for desktop view
    if (window.innerWidth >= 768) {
      setTimeout(() => {
        const params = new URLSearchParams()
        if (search) params.set("search", search)
        if (category && category !== "all") params.set("category", category)
        if (status && status !== "all") params.set("status", status)
        params.set("sort", value)
        params.set("page", "1")
        router.push(`${pathname}?${params.toString()}`)
      }, 0)
    }
  }

  const handleReset = () => {
    setSearch("")
    setCategory("")
    setStatus("")
    setSort("created_at:desc")
    router.push(pathname)
    setIsFiltersOpen(false)
  }

  const handleRetry = () => {
    setRetryCount(0) // Reset retry count
    setError(null) // Clear error
    // The useEffect will trigger a new fetch attempt
  }

  return (
    <>
      {/* Desktop Filter */}
      <div className="hidden md:block bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filter Cars
        </h3>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load categories: {error}</span>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="search"
                placeholder="Search cars..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleFilter()
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger id="category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading categories...
                  </SelectItem>
                ) : error ? (
                  <SelectItem value="error" disabled>
                    Unable to load categories
                  </SelectItem>
                ) : categories.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    No categories found
                  </SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="sort" className="text-sm font-medium">
              Sort By
            </label>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger id="sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at:desc">Newest first</SelectItem>
                <SelectItem value="created_at:asc">Oldest first</SelectItem>
                <SelectItem value="name:asc">Name (A-Z)</SelectItem>
                <SelectItem value="name:desc">Name (Z-A)</SelectItem>
                <SelectItem value="price:asc">Price (Low-High)</SelectItem>
                <SelectItem value="price:desc">Price (High-Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 lg:flex lg:items-end lg:space-y-0 lg:gap-2">
            <Button onClick={handleFilter} className="w-full lg:flex-1">
              Apply Filters
            </Button>
            <Button onClick={handleReset} variant="outline" className="w-full lg:flex-1">
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
            placeholder="Search cars..."
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
              <SheetTitle>Filter Cars</SheetTitle>
              <SheetDescription>Apply filters to narrow down your car list</SheetDescription>
            </SheetHeader>

            {error && (
              <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Failed to load categories</span>
                  <Button variant="outline" size="sm" onClick={handleRetry}>
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <label htmlFor="mobile-category" className="text-sm font-medium">
                  Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="mobile-category">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading categories...
                      </SelectItem>
                    ) : error ? (
                      <SelectItem value="error" disabled>
                        Unable to load categories
                      </SelectItem>
                    ) : categories.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No categories found
                      </SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="mobile-status" className="text-sm font-medium">
                  Status
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="mobile-status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="mobile-sort" className="text-sm font-medium">
                  Sort By
                </label>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger id="mobile-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at:desc">Newest first</SelectItem>
                    <SelectItem value="created_at:asc">Oldest first</SelectItem>
                    <SelectItem value="name:asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name:desc">Name (Z-A)</SelectItem>
                    <SelectItem value="price:asc">Price (Low-High)</SelectItem>
                    <SelectItem value="price:desc">Price (High-Low)</SelectItem>
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
