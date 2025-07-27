"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileIcon, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { DocumentUpload } from "./document-upload"
import { Alert, AlertDescription } from "@/components/ui/alert"

export interface UserDocumentsProps {
  userId: string
  documents?: any[] // Make documents optional
}

export function UserDocuments({ userId, documents: initialDocuments = [] }: UserDocumentsProps) {
  const [documents, setDocuments] = useState<any[]>(initialDocuments)
  const [documentTypes, setDocumentTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(!initialDocuments.length)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  const fetchData = async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      // Fetch document types
      const { data: typesData, error: typesError } = await supabase.from("document_types").select("*").order("name")

      if (typesError) throw typesError
      setDocumentTypes(typesData || [])

      // Fetch user documents
      const { data: docsData, error: docsError } = await supabase
        .from("user_documents")
        .select(`
          *,
          document_type:document_type_id(id, name, description, required)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (docsError) throw docsError
      setDocuments(docsData || [])
    } catch (error) {
      console.error("Error fetching documents:", error)
      setError("Failed to load documents. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId && !initialDocuments.length) {
      fetchData()
    }
  }, [userId, initialDocuments.length])

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

  const getMissingDocuments = () => {
    const uploadedDocTypeIds = documents.map((doc) => doc.document_type_id)
    return documentTypes.filter((type) => type.required && !uploadedDocTypeIds.includes(type.id))
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading documents...</div>
          ) : documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-start p-3 border rounded-md">
                  <FileIcon className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{doc.document_type?.name || "Document"}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{doc.file_name}</p>
                      </div>
                      <div>{getStatusBadge(doc.status)}</div>
                    </div>
                    {doc.admin_notes && doc.status === "rejected" && (
                      <div className="mt-2 text-sm p-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded">
                        <p className="font-medium">Reason for rejection:</p>
                        <p>{doc.admin_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No documents uploaded yet.</div>
          )}

          {documentTypes.length > 0 && getMissingDocuments().length > 0 && (
            <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
              <p className="font-medium text-amber-800 dark:text-amber-200">Required documents missing:</p>
              <ul className="list-disc list-inside mt-2 text-sm text-amber-700 dark:text-amber-300">
                {getMissingDocuments().map((type) => (
                  <li key={type.id}>{type.name}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <DocumentUpload userId={userId} documentTypes={documentTypes} onUploadComplete={fetchData} />
    </div>
  )
}
