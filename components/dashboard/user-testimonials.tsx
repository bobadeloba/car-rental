"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StarIcon, Edit2Icon, Trash2Icon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"
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
import { useRouter } from "next/navigation"

type Testimonial = {
  id: string
  full_name: string
  email: string
  rating: number
  comment: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export function UserTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchUserTestimonials()
  }, [])

  async function fetchUserTestimonials() {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be logged in to view your testimonials")
        return
      }

      // Get the user's testimonials
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching user testimonials:", error)
        setError("Failed to load your testimonials")
        return
      }

      setTestimonials(data || [])
    } catch (err) {
      console.error("Error in fetchUserTestimonials:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (testimonial: Testimonial) => {
    setTestimonialToDelete(testimonial)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!testimonialToDelete) return

    try {
      const supabase = getSupabaseClient()

      const { error } = await supabase.from("testimonials").delete().eq("id", testimonialToDelete.id)

      if (error) {
        console.error("Error deleting testimonial:", error)
        toast({
          title: "Error",
          description: "Failed to delete testimonial. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Remove from local state
      setTestimonials((prev) => prev.filter((t) => t.id !== testimonialToDelete.id))

      toast({
        title: "Testimonial Deleted",
        description: "Your testimonial has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error in handleDelete:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setTestimonialToDelete(null)
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    // Navigate to edit page or open edit modal
    router.push(`/dashboard/testimonials/edit/${testimonial.id}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Testimonials</CardTitle>
          <CardDescription>Manage the testimonials you've submitted</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Testimonials</CardTitle>
          <CardDescription>Manage the testimonials you've submitted</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="text-red-500">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/auth/signin?redirect=/dashboard/testimonials")}
            >
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Testimonials</CardTitle>
        <CardDescription>Manage the testimonials you've submitted</CardDescription>
      </CardHeader>
      <CardContent>
        {testimonials.length === 0 ? (
          <div className="text-center p-8 border rounded-lg">
            <h3 className="text-lg font-medium">No testimonials yet</h3>
            <p className="text-muted-foreground mt-2 mb-4">You haven't submitted any testimonials yet.</p>
            <Button onClick={() => router.push("/testimonials")}>Submit a Testimonial</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${
                          testimonial.rating > i ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {getStatusBadge(testimonial.status)}
                </div>

                <p className="text-gray-700 dark:text-gray-300 my-3">"{testimonial.comment}"</p>

                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-500">{new Date(testimonial.created_at).toLocaleDateString()}</p>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(testimonial)}
                      disabled={testimonial.status === "approved"}
                    >
                      <Edit2Icon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => confirmDelete(testimonial)}
                    >
                      <Trash2Icon className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your testimonial. This action cannot be undone.
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
    </Card>
  )
}
