"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Edit, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import DataTable from "@/components/admin/shared/data-table"
import DeleteButton from "@/components/admin/delete-button"
import { getSupabaseClient } from "@/lib/supabase/client"

interface Car {
  id: string
  name: string
  brand: string
  price_per_day: number
  images: string[] | null
  availability_status: string
  car_categories?: {
    category_id: string
    categories?: {
      id: string
      name: string
    }
  }[]
}

interface CarsTableProps {
  page: number
  search?: string
  category?: string
  status?: string
  emptyState?: React.ReactNode
}

export default function CarsTable({ page = 1, search = "", category = "", status = "", emptyState }: CarsTableProps) {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const router = useRouter()
  const pageSize = 10

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true)
      const supabase = getSupabaseClient()

      try {
        let query = supabase.from("cars").select(
          `
          id, 
          name, 
          brand, 
          price_per_day,
          images,
          availability_status,
          car_categories(
            category_id,
            categories(id, name)
          )
        `,
          { count: "exact" }, // Keep exact for potential total if no category filter
        )

        if (search) {
          query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`)
        }
        if (status) {
          query = query.eq("availability_status", status)
        }

        // If a category is selected, we need to fetch all matching search/status,
        // then filter by category, then paginate.
        if (category) {
          // Fetch all cars matching search and status (no pagination here)
          const { data: allMatchingCars, error: allCarsError } = await query.order("created_at", { ascending: false })

          if (allCarsError) {
            console.error("Error fetching all matching cars for category filter:", allCarsError)
            setCars([])
            setCount(0)
            setLoading(false)
            return
          }

          const processedAllCars = allMatchingCars || []

          const categoryFilteredCars = processedAllCars.filter((car) => {
            if (!car.car_categories) return false
            return car.car_categories.some((cc) => cc.categories && cc.categories.id === category)
          })

          setCount(categoryFilteredCars.length) // Total count for this category

          // Now apply pagination to the categoryFilteredCars
          const from = (page - 1) * pageSize
          const to = from + pageSize - 1
          const paginatedCars = categoryFilteredCars.slice(from, to)

          setCars(paginatedCars)
        } else {
          // No category filter, apply pagination directly in the query
          const from = (page - 1) * pageSize
          const to = from + pageSize - 1

          const {
            data,
            error,
            count: totalCount,
          } = await query.range(from, to).order("created_at", { ascending: false })

          if (error) {
            console.error("Error fetching cars:", error)
            setCars([])
            setCount(0)
            setLoading(false)
            return
          }

          setCars(data || [])
          setCount(totalCount || 0)
        }
      } catch (error) {
        console.error("Error in fetchCars:", error)
        setCars([])
        setCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [page, search, category, status, pageSize])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams()
    params.set("page", newPage.toString())
    if (search) params.set("search", search)
    if (category) params.set("category", category)
    if (status) params.set("status", status)

    router.push(`/admin/cars?${params.toString()}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Available</Badge>
      case "rented":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Rented</Badge>
      case "maintenance":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Maintenance
          </Badge>
        )
      case "unavailable":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Unavailable</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Helper function to get category names from car_categories
  const getCategoryNames = (car: Car) => {
    if (!car.car_categories || car.car_categories.length === 0) {
      return []
    }

    return car.car_categories.filter((cc) => cc.categories).map((cc) => cc.categories!.name)
  }

  const columns = [
    {
      header: "Car",
      accessorKey: "name",
      cell: (car: Car) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-md">
            {car.images && car.images.length > 0 ? (
              <Image
                src={car.images[0] || "/placeholder.svg"}
                alt={car.name}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
                No img
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{car.name}</div>
            <div className="text-sm text-gray-500">{car.brand}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (car: Car) => {
        const categoryNames = getCategoryNames(car)
        return (
          <div>
            {categoryNames.length > 0 ? (
              categoryNames.map((name, index) => (
                <Badge key={index} variant="outline" className="mr-1">
                  {name}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-500">Uncategorized</span>
            )}
          </div>
        )
      },
    },
    {
      header: "Daily Rate",
      accessorKey: "price_per_day",
      cell: (car: Car) => <div>${car.price_per_day?.toFixed(2) || "N/A"}</div>,
    },
    {
      header: "Status",
      accessorKey: "availability_status",
      cell: (car: Car) => getStatusBadge(car.availability_status || "unknown"),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (car: Car) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/admin/cars/${car.id}`} passHref>
                <DropdownMenuItem>View details</DropdownMenuItem>
              </Link>
              <Link href={`/admin/cars/${car.id}/edit`} passHref>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </Link>
              <DeleteButton
                id={car.id}
                resourceName="cars"
                resourceLabel="car"
                onSuccess={() => {
                  setCars(cars.filter((c) => c.id !== car.id))
                  setCount((prev) => prev - 1)
                }}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div>
      <DataTable
        data={cars}
        columns={columns}
        count={count}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={handlePageChange}
        emptyState={emptyState}
      />
    </div>
  )
}
