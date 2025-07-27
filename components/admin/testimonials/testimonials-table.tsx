"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { Check, X, Trash2, Star } from 'lucide-react'
import { getAllTestimonials, updateTestimonialStatus, deleteTestimonial } from "@/app/actions/admin-testimonials"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AdminTestimonialsTableProps {
  filterStatus?: "pending" | "approved" | "rejected"
}

export default function AdminTestimonialsTable({ filterStatus }: AdminTestimonialsTableProps) {
  const [testimonials, setTestimonials] = useState([])
  const [filteredTestimonials, setFilteredTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testimonialToDelete, setTestimonialToDelete] = useState(null)
  const [statusUpdating, setStatusUpdating] = useState({})
  const { toast } = useToast()

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        setLoading(true)
        // Use the server action instead of direct Supabase client query
        const data = await getAllTestimonials()

        console.log("Admin fetched testimonials:", data)
        setTestimonials(data || [])
      } catch (err) {
        console.error("Error in fetchTestimonials:", err)
        setError("Failed to load testimonials")
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  // Filter testimonials when the filterStatus prop or testimonials change
  useEffect(() => {
    if (filterStatus) {
      setFilteredTestimonials(testimonials.filter(t => t.status === filterStatus))
    } else {
      setFilteredTestimonials(testimonials)
    }
  }, [testimonials, filterStatus])

  const handleStatusUpdate = async (id, status) => {
    try {
      setStatusUpdating((prev) => ({ ...prev, [id]: true }))

      const result = await updateTestimonialStatus(id, status)

      if (result.success) {
        // Update local state
        const updatedTestimonials = testimonials.map((item) => 
          item.id === id ? { ...item, status } : item
        )
        setTestimonials(updatedTestimonials)

        toast({
          title: "Status Updated",
          description: result.message,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: result.message,
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating the testimonial status.",
      })
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [id]: false }))
    }
  }

  const confirmDelete = (testimonial) => {
    setTestimonialToDelete(testimonial)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!testimonialToDelete) return

    try {
      const result = await deleteTestimonial(testimonialToDelete.id)

      if (result.success) {
        // Remove from local state
        setTestimonials((prev) => prev.filter((item) => item.id !== testimonialToDelete.id))

        toast({
          title: "Testimonial Deleted",
          description: result.message,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: result.message,
        })
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error)
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "There was an error deleting the testimonial.",
      })
    } finally {
      setDeleteDialogOpen(false)
      setTestimonialToDelete(null)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>
    }
  }

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
      ))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-8 w-24" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error loading testimonials: {error}</AlertDescription>
      </Alert>
    )
  }

  if (filteredTestimonials.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h3 className="text-lg font-medium">No testimonials found</h3>
        <p className="text-muted-foreground mt-2">
          {filterStatus 
            ? `There are no ${filterStatus} testimonials in the system yet.` 
            : "There are no testimonials in the system yet."}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTestimonials.map((testimonial) => (
              <TableRow key={testimonial.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{testimonial.full_name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex">{renderStars(testimonial.rating)}</div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate">{testimonial.comment}</div>
                </TableCell>
                <TableCell>{getStatusBadge(testimonial.status)}</TableCell>
                <TableCell>{new Date(testimonial.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {testimonial.status !== "approved" && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleStatusUpdate(testimonial.id, "approved")}
                        disabled={statusUpdating[testimonial.id]}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="sr-only">Approve</span>
                      </Button>
                    )}
                    {testimonial.status !== "rejected" && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleStatusUpdate(testimonial.id, "rejected")}
                        disabled={statusUpdating[testimonial.id]}
                      >
                        <X className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Reject</span>
                      </Button>
                    )}
                    <Button size="icon" variant="outline" onClick={() => confirmDelete(testimonial)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the testimonial from {testimonialToDelete?.full_name}. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
