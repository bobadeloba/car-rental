"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { StarIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"

export function TestimonialForm() {
  const [rating, setRating] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
  })
  const [comment, setComment] = useState("")
  const [commentError, setCommentError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Fetch user data on component mount
  useEffect(() => {
    async function fetchUserData() {
      try {
        const supabase = getSupabaseClient()

        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          toast({
            title: "Authentication Required",
            description: "You must be logged in to submit a testimonial.",
            variant: "destructive",
          })
          router.push("/auth/signin?redirect=/testimonials")
          return
        }

        // Get user details from the users table
        const { data, error } = await supabase.from("users").select("full_name, email").eq("id", user.id).maybeSingle()

        if (error) {
          console.error("Error fetching user data:", error)
          // Fallback to user auth data
          setUserData({
            fullName: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            email: user.email || "",
          })
        } else if (data) {
          setUserData({
            fullName: data.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            email: data.email || user.email || "",
          })
        } else {
          // No user data found, use auth data
          setUserData({
            fullName: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            email: user.email || "",
          })
        }
      } catch (error) {
        console.error("Error in fetchUserData:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router, toast])

  const validateForm = () => {
    let valid = true

    if (!comment.trim()) {
      setCommentError("Testimonial comment is required")
      valid = false
    } else if (comment.length < 10) {
      setCommentError("Testimonial must be at least 10 characters")
      valid = false
    } else {
      setCommentError("")
    }

    return valid
  }

  const handleCommentChange = (e) => {
    setComment(e.target.value)
    if (commentError) setCommentError("")
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = getSupabaseClient()

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to submit a testimonial.",
          variant: "destructive",
        })
        router.push("/auth/signin?redirect=/testimonials")
        return
      }

      // Submit the testimonial
      const { error } = await supabase.from("testimonials").insert({
        user_id: user.id,
        full_name: userData.fullName,
        email: userData.email,
        rating,
        comment,
        status: "pending",
      })

      if (error) {
        console.error("Error submitting testimonial:", error)
        toast({
          title: "Submission Failed",
          description: error.message || "Failed to submit testimonial. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Testimonial Submitted",
        description: "Your testimonial has been submitted and is pending approval. Thank you for your feedback!",
      })

      // Reset the form
      setComment("")
      setRating(5)

      // Refresh the page to show the new testimonial in user's list
      router.refresh()
    } catch (error) {
      console.error("Error submitting testimonial:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Share Your Experience</CardTitle>
        <CardDescription>
          Tell us about your experience with our car rental service. Your feedback helps us improve and helps others
          make informed decisions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="testimonial-form" onSubmit={handleSubmit} className="space-y-4">
          {isLoading ? (
            <div className="py-4 text-center">
              <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          ) : (
            <div className="bg-muted/50 p-3 rounded-md mb-2">
              <p className="text-sm font-medium">
                Submitting as: <span className="font-bold">{userData.fullName}</span>
              </p>
              <p className="text-xs text-muted-foreground">{userData.email}</p>
            </div>
          )}

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
                  <StarIcon className={`h-8 w-8 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
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
              value={comment}
              onChange={handleCommentChange}
              className={commentError ? "border-red-500" : ""}
            />
            {commentError && <p className="text-sm text-red-500">{commentError}</p>}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="testimonial-form" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Testimonial"}
        </Button>
      </CardFooter>
    </Card>
  )
}
