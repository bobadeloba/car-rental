import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentUpload } from "@/components/documents/document-upload"
import { UserDocuments } from "@/components/documents/user-documents"
import { createServerComponentClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Add this export to make the page dynamic and skip static generation
export const dynamic = "force-dynamic"

export default async function DocumentsPage() {
  const supabase = createServerComponentClient()

  try {
    // Check if user is logged in
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/login?callbackUrl=/documents")
    }

    const userId = session.user.id

    // Get document types
    const { data: documentTypes } = await supabase
      .from("document_types")
      .select("*")
      .order("required", { ascending: false })

    // Get user documents
    const { data: userDocuments } = await supabase
      .from("user_documents")
      .select(`
        *,
        document_type:document_type_id (
          id,
          name,
          description,
          required
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    return (
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
          <p className="text-muted-foreground mt-2">Upload and manage your verification documents for car rentals</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <DocumentUpload userId={userId} documentTypes={documentTypes || []} />
          </div>
          <div className="md:col-span-2">
            <UserDocuments documents={userDocuments || []} userId={userId} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document Verification Process</CardTitle>
            <CardDescription>Learn about our document verification process</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Why we need your documents</h3>
              <p className="text-sm text-muted-foreground">
                For your safety and security, we require certain documents to verify your identity and eligibility
                before approving car rentals. This helps us maintain high standards and comply with legal requirements.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium">Verification Timeline</h3>
              <p className="text-sm text-muted-foreground">
                Documents are typically reviewed within 1-2 business days. You'll receive a notification once your
                documents have been approved or if additional information is needed.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium">Privacy & Security</h3>
              <p className="text-sm text-muted-foreground">
                All your documents are securely stored and encrypted. We follow strict data protection guidelines and
                only authorized personnel can access your verification documents.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Error in DocumentsPage:", error)

    // Return a fallback UI for error state
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
        <Card className="mt-6">
          <CardContent className="py-6">
            <p>Unable to load documents. Please try again later or contact support.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
}
