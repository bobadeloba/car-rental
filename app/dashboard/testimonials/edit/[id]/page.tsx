"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StarIcon, ArrowLeftIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditTestimonialPage() {
  const params = useParams()
  const testimonialId = params.id as string
  const router = useRouter()
  const { toast } = useToast()

  const [testimonial, setTestimonial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    comment: "",
  })
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    comment: "",
  })

  useEffect(() => {
    async function fetchTestimonial() {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          toast({
            title: "Authentication Required",
            description: "You must be logged in to edit your testimonial.",
            variant: "destructive",
          })
          router.push("/auth/signin?redirect=/dashboard/testimonials")
          return
        }

        // Get the testimonial
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("id", testimonialId)
          .eq("user_id", user.id)
          .single()

        if (error) {
          console.error("Error fetching testimonial:", error)
          toast({
            title: "Error",
            description: "Failed to load testimonial. It may not exist or you may not have permission to edit it.",
            variant: "destructive",
          })
          router.push("/dashboard/testimonials")
          return
        }

        if (data.status === "approved") {
          toast({
            title: "Cannot Edit",
            description: "Approved testimonials cannot be edited. Please contact support if you need to make changes.",
            variant: "destructive",
          })
          router.push("/dashboard/testimonials")
          return
        }

        setTestimonial(data)
        setRating(data.rating)
        setFormData({
          fullName: data.full_name,
          email: data.email,
          comment: data.comment,
        })
      } catch (err) {
        console.error("Error in fetchTestimonial:", err)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
        router.push("/dashboard/testimonials")
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonial()
  }, [testimonialId, router, toast])

  const validateForm = () => {
    let valid = true
    const newErrors = {
      fullName: "",
      email: "",
      comment: "",
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
      valid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
      valid = false
    }

    if (!formData.comment.trim()) {
      newErrors.comment = "Testimonial comment is required"
      valid = false
    } else if (formData.comment.length < 10) {
      newErrors.comment = "Testimonial must be at least 10 characters"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = getSupabaseClient()

      // Update the testimonial
      const { error } = await supabase
        .from("testimonials")
        .update({
          full_name: formData.fullName,
          email: formData.email,
          rating,
          comment: formData.comment,
          status: "pending", // Reset to pending when edited
        })
        .eq("id", testimonialId)

      if (error) {
        console.error("Error updating testimonial:", error)
        toast({
          title: "Update Failed",
          description: error.message || "Failed to update testimonial. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Testimonial Updated",
        description: "Your testimonial has been updated and is pending approval.",
      })

      // Navigate back to testimonials list
      router.push("/dashboard/testimonials")
    } catch (error) {
      console.error("Error updating testimonial:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="mr-2" onClick={() => router.back()}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-40" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-40 mb-2" />
            <Skeleton className="h-5 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <div className="flex space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-8 rounded-full" />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-2" onClick={() => router.back()}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Testimonial</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Your Testimonial</CardTitle>
          <CardDescription>
            Update your feedback about our car rental service. Your testimonial will need to be approved again after
            editing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="edit-testimonial-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <StarIcon
                      className={`h-8 w-8 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Testimonial</Label>
              <Textarea
                id="comment"
                name="comment"
                placeholder="Share your experience with our car rental service..."
                rows={4}
                value={formData.comment}
                onChange={handleChange}
                className={errors.comment ? "border-red-500" : ""}
              />
              {errors.comment && <p className="text-sm text-red-500">{errors.comment}</p>}
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <div className="flex w-full space-x-2">
            <Button variant="outline" onClick={() => router.push("/dashboard/testimonials")} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" form="edit-testimonial-form" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Testimonial"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
