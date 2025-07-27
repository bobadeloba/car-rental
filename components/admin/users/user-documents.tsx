"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { FileIcon, CheckCircle, XCircle, Clock, Download, Check, X } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface UserDocumentsProps {
  userId: string
}

export default function UserDocuments({ userId }: UserDocumentsProps) {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewingDoc, setReviewingDoc] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient()

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("user_documents")
        .select(`
          *,
          document_type:document_type_id(id, name, description, required)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error("Error fetching documents:", error)
      toast({
        title: "Error",
        description: "Failed to load user documents",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchDocuments()
    }
  }, [userId])

  const handleApprove = async (docId: string) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("user_documents")
        .update({ status: "approved", admin_notes: null })
        .eq("id", docId)

      if (error) throw error

      toast({
        title: "Document approved",
        description: "The document has been approved successfully.",
      })

      fetchDocuments()
    } catch (error) {
      console.error("Error approving document:", error)
      toast({
        title: "Error",
        description: "Failed to approve document",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openRejectDialog = (doc: any) => {
    setReviewingDoc(doc)
    setRejectionReason("")
  }

  const handleReject = async () => {
    if (!reviewingDoc) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("user_documents")
        .update({
          status: "rejected",
          admin_notes: rejectionReason || "Document rejected by administrator",
        })
        .eq("id", reviewingDoc.id)

      if (error) throw error

      toast({
        title: "Document rejected",
        description: "The document has been rejected with feedback.",
      })

      setReviewingDoc(null)
      fetchDocuments()
    } catch (error) {
      console.error("Error rejecting document:", error)
      toast({
        title: "Error",
        description: "Failed to reject document",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" /> Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" /> Rejected
          </Badge>
        )
      case "pending":
      default:
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        )
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">User Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading documents...</div>
          ) : documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-start p-4 border rounded-md">
                  <FileIcon className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{doc.document_type?.name || "Document"}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{doc.file_name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>{getStatusBadge(doc.status)}</div>
                    </div>

                    {doc.admin_notes && (
                      <div className="mt-2 text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <p className="font-medium">Admin notes:</p>
                        <p>{doc.admin_notes}</p>
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(doc.public_url, "_blank")}>
                        <Download className="h-4 w-4 mr-1" /> View
                      </Button>

                      {doc.status !== "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                          onClick={() => handleApprove(doc.id)}
                          disabled={isSubmitting}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      )}

                      {doc.status !== "rejected" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                          onClick={() => openRejectDialog(doc)}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">This user has not uploaded any documents yet.</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!reviewingDoc} onOpenChange={(open) => !open && setReviewingDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document. This feedback will be visible to the user.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="Reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewingDoc(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Reject Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
