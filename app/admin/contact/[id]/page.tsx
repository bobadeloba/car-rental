import { createServerClient } from "@/lib/supabase/server"
import { ContactSubmissionDetail } from "@/components/admin/contact/contact-submission-detail"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { notFound } from "next/navigation"
import { Breadcrumbs } from "@/components/admin/shared/breadcrumbs"
import { generatePageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: { params: { id: string } }) {
  return generatePageMetadata("Contact Submission Details | Admin Dashboard", "View contact form submission details")
}

export default async function ContactSubmissionPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  try {
    // Fetch contact submission
    const { data: submission, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error || !submission) {
      return notFound()
    }

    // If the submission is new, mark it as read
    if (submission.status === "new") {
      await supabase.from("contact_submissions").update({ status: "read" }).eq("id", params.id)

      // Update the submission object
      submission.status = "read"
    }

    const breadcrumbs = [
      { label: "Dashboard", href: "/admin" },
      { label: "Contact Submissions", href: "/admin/contact" },
      { label: submission.subject || "Submission Details", href: `/admin/contact/${params.id}` },
    ]

    return (
      <div className="space-y-6">
        <AdminPageHeader title="Contact Submission Details" description="View and manage contact form submission" />
        <Breadcrumbs items={breadcrumbs} />
        <ContactSubmissionDetail submission={submission} />
      </div>
    )
  } catch (error) {
    console.error("Error fetching contact submission:", error)
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Contact Submission Details" description="View and manage contact form submission" />
        <div className="bg-destructive/10 p-4 rounded-md">
          <h2 className="text-lg font-medium text-destructive">Error loading submission</h2>
          <p>There was a problem loading the contact form submission. Please try again later.</p>
        </div>
      </div>
    )
  }
}
