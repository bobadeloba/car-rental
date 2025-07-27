import { createServerClient } from "@/lib/supabase/server"
import { ContactSubmissionsTable } from "@/components/admin/contact/contact-submissions-table"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { generatePageMetadata } from "@/lib/metadata"

export async function generateMetadata() {
  return generatePageMetadata("Contact Submissions | Admin Dashboard", "Manage contact form submissions")
}

export default async function ContactSubmissionsPage() {
  try {
    // Use the server client with admin privileges
    const supabase = createServerClient({ admin: true })

    // Fetch contact submissions directly with service role
    const { data: submissions, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    return (
      <div className="space-y-6">
        <AdminPageHeader title="Contact Submissions" description="Manage messages from the contact form" />
        <ContactSubmissionsTable initialSubmissions={submissions || []} />
      </div>
    )
  } catch (error) {
    console.error("Error fetching contact submissions:", error)
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Contact Submissions" description="Manage messages from the contact form" />
        <div className="bg-destructive/10 p-4 rounded-md">
          <h2 className="text-lg font-medium text-destructive">Error loading submissions</h2>
          <p>There was a problem loading the contact form submissions. Please try again later.</p>
        </div>
      </div>
    )
  }
}
