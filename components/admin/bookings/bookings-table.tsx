"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Edit, MoreHorizontal, Trash2, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import DataTable from "@/components/admin/shared/data-table"

interface Booking {
  id: string
  user_id: string
  car_id: string
  start_date: string
  end_date: string
  total_price: number
  status: string
  created_at: string
  users?: {
    full_name: string
    email: string
  } | null
  cars?: {
    name: string
    brand: string
  } | null
}

interface BookingsTableProps {
  bookings: Booking[]
  count: number
  pageSize: number
  currentPage: number
}

export default function BookingsTable({ bookings, count, pageSize, currentPage }: BookingsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Create a new URLSearchParams instance
  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())

    // Update or delete parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key)
      } else {
        newSearchParams.set(key, value)
      }
    })

    return newSearchParams.toString()
  }

  const handlePageChange = (page: number) => {
    router.push(`${pathname}?${createQueryString({ page: page.toString() })}`)
  }

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return

    setIsDeleting(true)

    try {
      // Delete booking from database
      const { error } = await supabase.from("bookings").delete().eq("id", bookingToDelete.id)

      if (error) throw error

      toast({
        title: "Booking deleted",
        description: `Booking #${bookingToDelete.id.slice(0, 8).toUpperCase()} has been deleted successfully.`,
      })

      // Refresh the page to update the list
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setBookingToDelete(null)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const columns = [
    {
      header: "Booking ID",
      accessorKey: "id",
      cell: (booking: Booking) => <div className="font-medium">#{booking.id.slice(0, 8).toUpperCase()}</div>,
    },
    {
      header: "Customer",
      accessorKey: "users.full_name",
      cell: (booking: Booking) => <div>{booking.users?.full_name || "Unknown User"}</div>,
    },
    {
      header: "Car",
      accessorKey: "cars.name",
      cell: (booking: Booking) => (
        <div>{booking.cars ? `${booking.cars.brand} ${booking.cars.name}` : "Unknown Car"}</div>
      ),
      className: "hidden md:table-cell",
    },
    {
      header: "Dates",
      accessorKey: "start_date",
      cell: (booking: Booking) => (
        <div className="whitespace-nowrap">
          {format(new Date(booking.start_date), "MMM d")} -{" "}
          <span className="hidden sm:inline">{format(new Date(booking.end_date), "MMM d, yyyy")}</span>
          <span className="inline sm:hidden">{format(new Date(booking.end_date), "MMM d")}</span>
        </div>
      ),
    },
    {
      header: "Price",
      accessorKey: "total_price",
      cell: (booking: Booking) => <div>{formatCurrency(booking.total_price)}</div>,
      className: "hidden lg:table-cell",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (booking: Booking) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(
            booking.status,
          )}`}
        >
          {booking.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (booking: Booking) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/bookings/${booking.id}`} className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/bookings/${booking.id}/edit`} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  setBookingToDelete(booking)
                  setIsDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <DataTable
        data={bookings}
        columns={columns}
        count={count}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the booking
              {bookingToDelete ? ` #${bookingToDelete.id.slice(0, 8).toUpperCase()}` : ""} and remove all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBooking}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
