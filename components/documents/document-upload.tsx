"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Upload, FileCheck } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export interface DocumentUploadProps {
  userId: string
  documentTypes?: Array<{
    id: string
    name: string
    description: string | null
    required: boolean
  }>
  onUploadComplete?: () => void
}

export function DocumentUpload({ userId, documentTypes = [], onUploadComplete }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [documentTypeId, setDocumentTypeId] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClientComponentClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file || !documentTypeId) {
      toast({
        title: "Missing information",
        description: "Please select a document type and file to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Upload file to storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `user_documents/${fileName}`

      const { error: uploadError } = await supabase.storage.from("user_documents").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data: urlData } = await supabase.storage.from("user_documents").getPublicUrl(filePath)

      // Save document reference in database
      const { error: dbError } = await supabase.from("user_documents").insert({
        user_id: userId,
        document_type_id: documentTypeId,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        status: "pending",
        public_url: urlData?.publicUrl || "",
      })

      if (dbError) {
        throw dbError
      }

      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded and is pending review.",
      })

      // Reset form
      setFile(null)
      setDocumentTypeId("")

      // Call the callback if provided
      if (onUploadComplete) {
        onUploadComplete()
      }
    } catch (error) {
      console.error("Error uploading document:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Upload Document</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="document-type">Document Type</Label>
          <Select value={documentTypeId} onValueChange={setDocumentTypeId}>
            <SelectTrigger id="document-type">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name} {type.required && "(Required)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="document-file">Document File</Label>
          <Input id="document-file" type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
          {file && (
            <div className="flex items-center text-sm text-green-600">
              <FileCheck className="mr-2 h-4 w-4" />
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={!file || !documentTypeId || isUploading} className="w-full">
          {isUploading ? (
            <>Uploading...</>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
