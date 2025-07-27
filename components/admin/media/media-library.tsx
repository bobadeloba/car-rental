"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Search, Filter, ImageIcon, Upload, Grid, List } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface MediaLibraryProps {
  userId: string
  onSelect?: (media: any) => void
  selectable?: boolean
}

export function MediaLibrary({ userId, onSelect, selectable = false }: MediaLibraryProps) {
  const [media, setMedia] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("all")
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadData, setUploadData] = useState({
    name: "",
    alt_text: "",
    category: "general",
  })
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [isUploading, setIsUploading] = useState(false)

  // Fetch media on component mount
  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    setIsLoading(true)
    try {
      let query = supabase.from("media").select("*").order("created_at", { ascending: false })

      if (category !== "all") {
        query = query.eq("category", category)
      }

      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`)
      }

      const { data, error } = await query

      if (error) throw error

      setMedia(data || [])
    } catch (error: any) {
      console.error("Error fetching media:", error)
      toast({
        title: "Error",
        description: "Failed to load media items",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadFile(file)
      setUploadData({
        ...uploadData,
        name: file.name,
      })
    }
  }

  const handleMediaUpload = async () => {
    if (!uploadFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)

      // Create a FormData instance
      const formData = new FormData()
      formData.append("file", uploadFile)
      formData.append("name", uploadData.name || uploadFile.name)
      formData.append("alt_text", uploadData.alt_text || "")
      formData.append("category", uploadData.category || "general")

      // Send POST request to the API with improved error handling
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      })

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Upload failed with status: ${response.status}`

        // Check content type to avoid parsing HTML as JSON
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } catch (parseError) {
            console.error("Error parsing error response:", parseError)
          }
        } else {
          // For non-JSON responses, use text instead
          try {
            const textResponse = await response.text()
            console.error("Non-JSON error response:", textResponse.substring(0, 200) + "...")
          } catch (textError) {
            console.error("Error reading response text:", textError)
          }
        }

        throw new Error(errorMessage)
      }

      // Parse successful response
      let result
      try {
        result = await response.json()
      } catch (parseError) {
        console.error("Error parsing success response:", parseError)
        throw new Error("Invalid response format from server")
      }

      toast({
        title: "Success",
        description: "Media uploaded successfully",
      })

      // Reset form
      setUploadFile(null)
      setUploadData({
        name: "",
        alt_text: "",
        category: "general",
      })
      setIsUploadDialogOpen(false)

      // Refresh media list
      fetchMedia()
    } catch (error: any) {
      console.error("Error uploading media:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload media",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteMedia = async (id: string) => {
    try {
      const response = await fetch(`/api/media/${id}`, {
        method: "DELETE",
      })

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        let errorMessage = `Delete failed with status: ${response.status}`

        // Check content type to avoid parsing HTML as JSON
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } catch (parseError) {
            console.error("Error parsing error response:", parseError)
          }
        }

        throw new Error(errorMessage)
      }

      toast({
        title: "Success",
        description: "Media deleted successfully",
      })

      fetchMedia()
      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      console.error("Error deleting media:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete media",
        variant: "destructive",
      })
    }
  }

  const handleUpdateMedia = async (id: string, data: any) => {
    try {
      const response = await fetch(`/api/media/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          alt_text: data.alt_text,
          category: data.category,
          is_active: data.is_active,
        }),
      })

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        let errorMessage = `Update failed with status: ${response.status}`

        // Check content type to avoid parsing HTML as JSON
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } catch (parseError) {
            console.error("Error parsing error response:", parseError)
          }
        }

        throw new Error(errorMessage)
      }

      toast({
        title: "Success",
        description: "Media updated successfully",
      })

      fetchMedia()
      setIsEditDialogOpen(false)
    } catch (error: any) {
      console.error("Error updating media:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update media",
        variant: "destructive",
      })
    }
  }

  // Helper function to get a valid image source or return a placeholder
  const getValidImageSrc = (src: string | null | undefined) => {
    if (!src || src === "") {
      return "/colorful-abstract-flow.png"
    }
    return src
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchMedia()}
            />
          </div>
          <Select
            value={category}
            onValueChange={(value) => {
              setCategory(value)
              setTimeout(fetchMedia, 100)
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="banner">Banners</SelectItem>
              <SelectItem value="background">Backgrounds</SelectItem>
              <SelectItem value="car">Car Images</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchMedia}>
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="bg-muted rounded-md p-1 flex">
            <Button
              variant="ghost"
              size="icon"
              className={viewMode === "grid" ? "bg-background" : ""}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={viewMode === "list" ? "bg-background" : ""}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </Button>
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)} disabled={isUploading}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : media.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
            <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No media found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm || category !== "all"
                ? "Try changing your search or filter"
                : "Upload images to start building your media library"}
            </p>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-2"
          }
        >
          {media.map((item) => (
            <Card
              key={item.id}
              className={`${viewMode === "list" ? "overflow-hidden" : ""} ${selectable ? "cursor-pointer hover:border-primary transition-colors" : ""}`}
              onClick={selectable && onSelect ? () => onSelect(item) : undefined}
            >
              <CardContent className={`p-3 ${viewMode === "list" ? "flex items-center gap-4" : ""}`}>
                <div
                  className={`relative ${viewMode === "grid" ? "aspect-square" : "w-16 h-16"} rounded-md overflow-hidden bg-muted mb-2`}
                >
                  {item.file_type?.startsWith("image/") ? (
                    <img
                      src={getValidImageSrc(item.file_path) || "/placeholder.svg"}
                      alt={item.alt_text || item.name || "Media item"}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-muted">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(item.size / 1024).toFixed(1)} KB • {item.category || "General"}
                  </p>
                </div>
                {!selectable && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedMedia(item)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedMedia(item)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>Upload a new media file to your library.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">File</Label>
              <Input id="file" type="file" onChange={handleFileChange} accept="image/*,video/*,application/pdf" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={uploadData.name}
                onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={uploadData.alt_text}
                onChange={(e) => setUploadData({ ...uploadData, alt_text: e.target.value })}
                placeholder="Describe the image for accessibility"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={uploadData.category}
                onValueChange={(value) => setUploadData({ ...uploadData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="background">Background</SelectItem>
                  <SelectItem value="car">Car Image</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMediaUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Media</DialogTitle>
            <DialogDescription>Update the details for this media item.</DialogDescription>
          </DialogHeader>
          {selectedMedia && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={selectedMedia.name}
                  onChange={(e) => setSelectedMedia({ ...selectedMedia, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="alt">Alt Text</Label>
                <Input
                  id="alt"
                  value={selectedMedia.alt_text || ""}
                  onChange={(e) => setSelectedMedia({ ...selectedMedia, alt_text: e.target.value })}
                  placeholder="Describe the image for accessibility"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={selectedMedia.category || "general"}
                  onValueChange={(value) => setSelectedMedia({ ...selectedMedia, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="background">Background</SelectItem>
                    <SelectItem value="car">Car Image</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={selectedMedia.is_active !== false}
                  onCheckedChange={(checked) => setSelectedMedia({ ...selectedMedia, is_active: !!checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleUpdateMedia(selectedMedia.id, selectedMedia)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this media item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedMedia && (
            <div className="grid place-items-center py-4">
              <div className="relative w-40 h-40 rounded-md overflow-hidden border">
                {selectedMedia.file_type?.startsWith("image/") ? (
                  <img
                    src={getValidImageSrc(selectedMedia.file_path) || "/placeholder.svg"}
                    alt={selectedMedia.name || "Media item"}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-muted">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="mt-2 font-medium">{selectedMedia.name}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => selectedMedia && handleDeleteMedia(selectedMedia.id)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
