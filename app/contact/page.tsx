import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import ContactForm from "@/components/contact/contact-form"
import Image from "next/image"
import { generatePageMetadata } from "@/lib/metadata"
import { PageTracker } from "@/components/analytics/page-tracker"

// Mark this page as dynamic to prevent static rendering errors
export const dynamic = "force-dynamic"

// Use generateMetadata instead of static metadata
export async function generateMetadata() {
  return generatePageMetadata("Contact Us", "Get in touch with our team for any questions or support")
}

export default async function ContactPage() {
  // Use client component client instead of server client
  const supabase = createClientComponentClient()

  // Fetch contact page content
  const { data: content, error } = await supabase
    .from("content")
    .select("*")
    .eq("type", "contact")
    .eq("language", "en")
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching contact page content:", error)
  }

  // Fetch admin settings
  const { data: settingsArray, error: settingsError } = await supabase
    .from("admin_settings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)

  if (settingsError) {
    console.error("Error fetching admin settings:", settingsError)
  }

  // Use the first settings object if available
  const settings = settingsArray && settingsArray.length > 0 ? settingsArray[0] : null

  // Use a placeholder image that's guaranteed to work
  const heroImageUrl = "/placeholder.svg?key=5uihd"

  // Hardcoded fallback values to ensure contact info always appears
  const contactInfo = {
    address: {
      line1: settings?.site_address_line1 || "Al Quasis Industrial Area 4",
      line2: settings?.site_address_line2 || "Al Quasis Industrial Area 4",
      city: settings?.site_address_city || "Dubai",
      state: settings?.site_address_state || "Emirate of Dubai",
      postal: settings?.site_address_postal || "25314",
      country: settings?.site_address_country || "UAE",
    },
    phone: settings?.contact_phone || "+9953886899",
    email: settings?.contact_email || "ezizkakam@gmail.com",
    formTitle: settings?.contact_form_title || "Send us a message",
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <PageTracker pageTitle="Contact Us" />
      {/* Hero section with updated background image */}
      <div className="relative w-full h-64 md:h-80 mb-12 rounded-lg overflow-hidden shadow-lg">
        <Image
          src={heroImageUrl || "/placeholder.svg"}
          alt="Our Premium Customer Service"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white">{content?.title || "Contact Us"}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="space-y-6">
            {/* Get in Touch section */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Get in Touch</h2>
              <p className="text-muted-foreground">
                We're here to help with any questions or concerns you may have about our car rental services.
              </p>
            </div>

            {/* Customer Support section */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Customer Support</h2>
              <p className="text-muted-foreground">
                Our customer support team is available Monday through Friday from 9:00 AM to 6:00 PM.
              </p>
            </div>

            {/* Contact Information - Always show actual data with fallbacks */}
            <div className="space-y-6">
              {/* Office Location */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Office Location</h3>
                <address className="not-italic text-muted-foreground">
                  <p>{contactInfo.address.line1}</p>
                  {contactInfo.address.line2 && <p>{contactInfo.address.line2}</p>}
                  <p>
                    {contactInfo.address.city}
                    {contactInfo.address.state && `, ${contactInfo.address.state}`}
                    {contactInfo.address.postal && ` ${contactInfo.address.postal}`}
                  </p>
                  <p>{contactInfo.address.country}</p>
                </address>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Phone</h3>
                <p className="text-muted-foreground">
                  <a href={`tel:${contactInfo.phone}`} className="hover:underline">
                    {contactInfo.phone}
                  </a>
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Email</h3>
                <p className="text-muted-foreground">
                  <a href={`mailto:${contactInfo.email}`} className="hover:underline">
                    {contactInfo.email}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold mb-6">{contactInfo.formTitle}</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
