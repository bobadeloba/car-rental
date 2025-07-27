import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarIcon } from "lucide-react"

type Testimonial = {
  id: string
  full_name: string
  email: string
  rating: number
  comment: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

interface UserTestimonialsListProps {
  testimonials: Testimonial[]
}

export function UserTestimonialsList({ testimonials }: UserTestimonialsListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {testimonials.map((testimonial) => (
        <Card key={testimonial.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{testimonial.full_name}</CardTitle>
                <CardDescription>{new Date(testimonial.created_at).toLocaleDateString()}</CardDescription>
              </div>
              <StatusBadge status={testimonial.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <p className="text-gray-700">{testimonial.comment}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-500">Approved</Badge>
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>
    case "pending":
    default:
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-400 bg-amber-50">
          Pending
        </Badge>
      )
  }
}
