"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClientComponentClient } from "@/lib/supabase/client"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Star } from "lucide-react"

interface Car {
  id: string
  name: string
  brand: string
  images: string[]
}

const formSchema = z.object({
  carId: z.string().min(1, { message: "Please select a car" }),
  rating: z.number().min(1, { message: "Please select a rating" }).max(5),
  comment: z.string().min(10, { message: "Comment must be at least 10 characters" }),
})

type FormData = z.infer<typeof formSchema>

export default function ReviewForm({
  userId,
  selectedCarId,
  rentedCars,
}: {
  userId: string
  selectedCarId?: string
  rentedCars: Car[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      carId: selectedCarId || "",
      rating: 0,
      comment: "",
    },
  })

  const selectedCarIdValue = watch("carId")
  const selectedCar = rentedCars.find((car) => car.id === selectedCarIdValue)

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      // Insert review into database
      const { error } = await supabase.from("reviews").insert({
        user_id: userId,
        car_id: data.carId,
        rating: data.rating,
        comment: data.comment,
      })

      if (error) throw error

      toast({
        title: "Review submitted",
        description: "Thank you for sharing your experience!",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRatingChange = (value: number) => {
    setRating(value)
    setValue("rating", value)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {!selectedCarId && (
        <div className="space-y-2">
          <Label htmlFor="carId">Select Car</Label>
          <Select value={selectedCarIdValue} onValueChange={(value) => setValue("carId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a car you've rented" />
            </SelectTrigger>
            <SelectContent>
              {rentedCars.length > 0 ? (
                rentedCars.map((car) => (
                  <SelectItem key={car.id} value={car.id}>
                    {car.brand} {car.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No cars available for review
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.carId && <p className="text-sm text-red-500">{errors.carId.message}</p>}
        </div>
      )}

      {selectedCar && (
        <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="relative h-16 w-16 rounded-md overflow-hidden">
            <Image
              src={selectedCar.images[0] || "/placeholder.svg?height=200&width=200"}
              alt={selectedCar.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium">
              {selectedCar.brand} {selectedCar.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">You're reviewing this car</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleRatingChange(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-8 w-8 ${
                  value <= (hoveredRating || rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            </button>
          ))}
        </div>
        {errors.rating && <p className="text-sm text-red-500">{errors.rating.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Your Review</Label>
        <Textarea id="comment" placeholder="Share your experience with this car..." rows={5} {...register("comment")} />
        {errors.comment && <p className="text-sm text-red-500">{errors.comment.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading || !selectedCarIdValue}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
          </>
        ) : (
          "Submit Review"
        )}
      </Button>
    </form>
  )
}
