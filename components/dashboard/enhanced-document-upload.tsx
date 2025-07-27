"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, FileText, Trash2, Loader2, AlertCircle, Calendar, ImageIcon, FileIcon as FilePdf } from "lucide-react"
import { format, isAfter, parseISO, addDays } from "date-fns"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface DocumentType {
  id: string
  name: string
  required: boolean
  description?: string | null
}

interface UserDocument {
  id: string
  user_id: string
  document_type: string
  file_name: string
  file_url: string
  verified: boolean
  verification_notes?: string | null
  expiry_date?: string | null
  created_at: string
  updated_at?: string
}

interface EnhancedDocumentUploadProps {
  onDocumentUploaded?: (document: UserDocument) => void
  onCancel?: () => void
}

// File type validation
const ALLOWED_FILE_TYPES = {
  "image/jpeg": { ext: "jpg", icon: ImageIcon },
  "image/png": { ext: "png", icon: ImageIcon },
  "application/pdf": { ext: "pdf", icon: FilePdf },
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MIN_IMAGE_DIMENSION = 800 // Minimum width/height for images

export default function EnhancedDocumentUpload({ onDocumentUploaded, onCancel }: EnhancedDocumentUploadProps) {
  // State for form fields
  const [selectedType, setSelectedType] = useState<string>("")
  const [expiryDate, setExpiryDate] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)

  // State for validation
  const [fileError, setFileError] = useState<string | null>(null)
  const [typeError, setTypeError] = useState<string | null>(null)
  const [dateError, setDateError] = useState<string | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  // State for upload process
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = getSupabaseClient()
  const router = useRouter()

  // Get current user and document types
  useEffect(() => {
    async function initialize() {
      try {
        // Get current user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
          throw new Error(`Authentication error: ${authError.message}`)
        }

        if (!user) {
          router.push("/auth/signin?callbackUrl=/dashboard/documents")
          return
        }

        setUserId(user.id)

        // Get document types
        const { data: types, error: typesError } = await supabase
          .from("document_types")
          .select("*")
          .order("required", { ascending: false })

        if (typesError) {
          throw new Error(`Error fetching document types: ${typesError.message}`)
        }

        setDocumentTypes(types || [])
      } catch (err) {
        console.error("Initialization error:", err)
        setError(err instanceof Error ? err.message : "Failed to initialize")
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [supabase, router])

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    setFilePreview(null)

    if (!e.target.files || e.target.files.length === 0) {
      setFile(null)
      return
    }

    const selectedFile = e.target.files[0]

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError(`File size exceeds the 5MB limit (${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB)`)
      return
    }

    // Validate file type
    if (!Object.keys(ALLOWED_FILE_TYPES).includes(selectedFile.type)) {
      setFileError(`File type not allowed. Please upload JPG, PNG, or PDF files.`)
      return
    }

    // For images, validate dimensions
    if (selectedFile.type.startsWith("image/")) {
      try {
        const dimensions = await getImageDimensions(selectedFile)
        if (dimensions.width < MIN_IMAGE_DIMENSION || dimensions.height < MIN_IMAGE_DIMENSION) {
          setFileError(`Image dimensions too small. Minimum ${MIN_IMAGE_DIMENSION}x${MIN_IMAGE_DIMENSION}px required.`)
          return
        }

        // Create preview for images
        const preview = URL.createObjectURL(selectedFile)
        setFilePreview(preview)
      } catch (err) {
        setFileError("Error validating image. Please try another file.")
        return
      }
    } else if (selectedFile.type === "application/pdf") {
      // Set a generic PDF preview
      setFilePreview("/digital-document.png")
    }

    setFile(selectedFile)
  }

  // Get image dimensions
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
        URL.revokeObjectURL(img.src)
      }
      img.onerror = () => {
        reject(new Error("Failed to load image"))
        URL.revokeObjectURL(img.src)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  // Handle document type selection
  const handleTypeChange = (value: string) => {
    setTypeError(null)
    setSelectedType(value)
  }

  // Handle expiry date change
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateError(null)
    const value = e.target.value

    if (value) {
      const selectedDate = parseISO(value)
      const today = new Date()

      if (!isAfter(selectedDate, today)) {
        setDateError("Expiry date must be in the future")
      }
    }

    setExpiryDate(value)
  }

  // Reset form
  const resetForm = () => {
    setSelectedType("")
    setExpiryDate("")
    setFile(null)
    setFilePreview(null)
    setFileError(null)
    setTypeError(null)
    setDateError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Simulate upload progress
  const simulateProgress = () => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5
      if (progress > 90) {
        clearInterval(interval)
        setUploadProgress(90)
      } else {
        setUploadProgress(progress)
      }
    }, 300)

    return () => clearInterval(interval)
  }

  // Handle form submission
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    let hasError = false

    if (!selectedType) {
      setTypeError("Please select a document type")
      hasError = true
    }

    if (!file) {
      setFileError("Please select a file to upload")
      hasError = true
    }

    if (expiryDate) {
      const selectedDate = parseISO(expiryDate)
      const today = new Date()

      if (!isAfter(selectedDate, today)) {
        setDateError("Expiry date must be in the future")
        hasError = true
      }
    }

    if (hasError || !userId) return

    setIsUploading(true)
    setUploadProgress(0)

    // Start progress simulation
    const stopProgress = simulateProgress()

    try {
      // Generate a descriptive file name based on document type
      const documentType = documentTypes.find((type) => type.id === selectedType)
      const documentTypeName = documentType ? documentType.name.toLowerCase().replace(/\s+/g, "_") : "document"

      const fileExt = file.name.split(".").pop()
      const safeFileName = `${documentTypeName}_${Date.now()}.${fileExt}`
      const filePath = `${userId}/${safeFileName}`

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("user-documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type, // Explicitly set content type
        })

      if (uploadError) {
        throw new Error(`Upload error: ${uploadError.message}`)
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("user-documents").getPublicUrl(filePath)

      // Create document record in the database
      const { data: document, error: documentError } = await supabase
        .from("user_documents")
        .insert({
          user_id: userId,
          document_type: selectedType,
          file_name: file.name,
          file_url: publicUrl,
          verified: false,
          expiry_date: expiryDate || null,
        })
        .select()
        .single()

      if (documentError) {
        // If there's an error creating the document record, try to delete the uploaded file
        await supabase.storage.from("user-documents").remove([filePath])
        throw new Error(`Database error: ${documentError.message}`)
      }

      // Stop progress simulation and set to 100%
      stopProgress()
      setUploadProgress(100)

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })

      // Notify parent component
      if (onDocumentUploaded && document) {
        onDocumentUploaded(document)
      }

      // Reset the form
      resetForm()
    } catch (error) {
      console.error("Upload error:", error)
      stopProgress()

      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Get file icon based on file type
  const getFileIcon = (file: File) => {
    const fileType = file.type as keyof typeof ALLOWED_FILE_TYPES
    if (ALLOWED_FILE_TYPES[fileType]) {
      const Icon = ALLOWED_FILE_TYPES[fileType].icon
      return <Icon className="h-6 w-6 text-blue-500 mr-2" />
    }
    return <FileText className="h-6 w-6 text-blue-500 mr-2" />
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Please upload clear images or PDFs of your documents. Supported formats: JPG, PNG, PDF. Maximum file size:
          5MB.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="document-type" className="flex items-center">
                Document Type <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select value={selectedType} onValueChange={handleTypeChange}>
                <SelectTrigger id="document-type" className={typeError ? "border-red-500" : ""}>
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
              {typeError && <p className="text-xs text-red-500">{typeError}</p>}
              {selectedType && (
                <p className="text-xs text-muted-foreground">
                  {documentTypes.find((type) => type.id === selectedType)?.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry-date" className="flex items-center">
                Expiry Date <span className="text-gray-500 text-xs ml-1">(if applicable)</span>
              </Label>
              <div className="relative">
                <Input
                  id="expiry-date"
                  type="date"
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                  className={dateError ? "border-red-500 pr-10" : "pr-10"}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {dateError && <p className="text-xs text-red-500">{dateError}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-file" className="flex items-center">
              Document File <span className="text-red-500 ml-1">*</span>
            </Label>
            <div
              className={`border-2 border-dashed rounded-md p-6 text-center ${
                fileError ? "border-red-500 bg-red-50" : file ? "border-green-300 bg-green-50" : "border-gray-300"
              }`}
            >
              <input
                id="document-file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
              />

              {!file ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to select a file or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF up to 5MB</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Minimum image resolution: {MIN_IMAGE_DIMENSION}x{MIN_IMAGE_DIMENSION}px
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getFileIcon(file)}
                      <div className="text-left">
                        <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFile(null)
                        setFilePreview(null)
                        if (fileInputRef.current) fileInputRef.current.value = ""
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {filePreview && (
                    <div className="flex justify-center">
                      {file.type.startsWith("image/") ? (
                        <div className="relative h-40 w-auto border rounded overflow-hidden">
                          <Image
                            src={filePreview || "/placeholder.svg"}
                            alt="Document preview"
                            fill
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <FilePdf className="h-20 w-20 text-red-500" />
                          <span className="text-sm">PDF Document</span>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change File
                  </Button>
                </div>
              )}
            </div>
            {fileError && <p className="text-xs text-red-500">{fileError}</p>}
          </div>

          <div className="space-y-2">
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isUploading || !selectedType || !file || !!fileError || !!typeError || !!dateError}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Document"
                )}
              </Button>

              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
