"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
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
import { formatDistance } from "date-fns"
import { Edit, MoreHorizontal, Trash2, Eye, UserCog } from "lucide-react"
import DataTable from "@/components/admin/shared/data-table"

interface User {
  id: string
  full_name: string
  email: string
  phone_number: string | null
  role: string
  loyalty_points: number
  created_at: string
}

interface UsersTableProps {
  users: User[]
  count: number
  pageSize: number
  currentPage: number
}

export default function UsersTable({ users, count, pageSize, currentPage }: UsersTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
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

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    setIsDeleting(true)

    try {
      // Delete user from database
      const { error } = await supabase.from("users").delete().eq("id", userToDelete.id)

      if (error) throw error

      toast({
        title: "User deleted",
        description: `${userToDelete.full_name} has been deleted successfully.`,
      })

      // Refresh the page to update the list
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleToggleAdminRole = async (user: User) => {
    try {
      const newRole = user.role === "admin" ? "customer" : "admin"

      // Update user role
      const { error } = await supabase.from("users").update({ role: newRole }).eq("id", user.id)

      if (error) throw error

      toast({
        title: "Role updated",
        description: `${user.full_name} is now a ${newRole}.`,
      })

      // Refresh the page to update the list
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const columns = [
    {
      header: "Name",
      accessorKey: "full_name",
      cell: (user: User) => <div className="font-medium">{user.full_name}</div>,
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: (user: User) => <div className="max-w-[180px] truncate">{user.email}</div>,
      className: "hidden md:table-cell",
    },
    {
      header: "Role",
      accessorKey: "role",
      cell: (user: User) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            user.role === "admin"
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
          }`}
        >
          {user.role}
        </span>
      ),
    },
    {
      header: "Loyalty",
      accessorKey: "loyalty_points",
      cell: (user: User) => <div>{user.loyalty_points}</div>,
      className: "hidden lg:table-cell",
    },
    {
      header: "Joined",
      accessorKey: "created_at",
      cell: (user: User) => (
        <div className="hidden md:block">
          {formatDistance(new Date(user.created_at), new Date(), { addSuffix: true })}
        </div>
      ),
      className: "hidden md:table-cell",
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (user: User) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/users/${user.id}`} className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/users/${user.id}/edit`} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleAdminRole(user)} className="flex items-center">
                <UserCog className="mr-2 h-4 w-4" />
                {user.role === "admin" ? "Remove Admin Role" : "Make Admin"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  setUserToDelete(user)
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
        data={users}
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
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user{" "}
              {userToDelete ? userToDelete.full_name : ""} and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
