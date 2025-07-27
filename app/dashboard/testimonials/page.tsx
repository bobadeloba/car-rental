import { UserTestimonials } from "@/components/dashboard/user-testimonials"
import { generatePageMetadata } from "@/lib/metadata"

export async function generateMetadata() {
  return generatePageMetadata(
    "My Testimonials | Dashboard",
    "Manage your testimonials and feedback for our car rental service.",
  )
}

export default function UserTestimonialsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Testimonials</h1>
      <UserTestimonials />
    </div>
  )
}
