"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ImageIcon, Plus, Edit } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { type PageImage, getAllPageImages } from "@/lib/page-images"

interface MediaItem {
  id: string
  name: string
  url: string
  type: string
  size: number
  created_at: string
}

export function PageImageManager() {
  const [pageImages, setPageImages] = useState<PageImage[]>([])
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [selectedPage, setSelectedPage] = useState<string>("")
  const [pageTitle, setPageTitle] = useState<string>("")
  const [altText, setAltText] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const { toast } = useToast()

  // Predefined page types
  const pageTypes = [
    { id: "home_hero", name: "Home Hero" },
    { id: "home_about", name: "Home About Section" },
    { id: "about_hero", name: "About Page Hero" },
    { id: "contact_hero", name: "Contact Page Hero" },
    { id: "cars_hero", name: "Cars Page Hero" },
  ]

  useEffect(() => {
    fetchPageImages()
    fetchMediaItems()
  }, [])

  const fetchPageImages = async () => {
    try {
      const images = await getAllPageImages()
      setPageImages(images || [])
    } catch (error) {
      console.error("Error fetching page images:", error)
      toast({
        title: "Error",
        description: "Failed to fetch page images",
        variant: "destructive",
      })
      setPageImages([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMediaItems = async () => {
    try {
      const response = await fetch("/api/media")
      if (!response.ok) {
        throw new Error("Failed to fetch media items")
      }
      const data = await response.json()

      // Ensure mediaItems is always an array
      if (Array.isArray(data)) {
        setMediaItems(data)
      } else if (data && typeof data === "object" && Array.isArray(data.items)) {
        // If the API returns { items: [...] }
        setMediaItems(data.items)
      } else if (data && typeof data === "object" && Array.isArray(data.data)) {
        // If the API returns { data: [...] }
        setMediaItems(data.data)
      } else {
        console.error("Unexpected media items format:", data)
        setMediaItems([])
      }
    } catch (error) {
      console.error("Error fetching media items:", error)
      toast({
        title: "Error",
        description: "Failed to fetch media items",
        variant: "destructive",
      })
      setMediaItems([])
    }
  }

  const handleSelectMedia = (media: MediaItem) => {
    setSelectedMedia(media)
  }

  const handleSubmit = async () => {
    if (!selectedMedia || !selectedPage || !pageTitle) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Check if this page already has an image
      const existingImage = pageImages.find((img) => img.page === selectedPage)

      if (existingImage) {
        // Update existing page image
        console.log("Updating existing page image:", {
          id: existingImage.id,
          image_url: selectedMedia.url,
          alt_text: altText,
        })

        const response = await fetch("/api/page-images", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: existingImage.id,
            image_url: selectedMedia.url,
            alt_text: altText,
          }),
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.message || "Failed to update page image")
        }

        toast({
          title: "Success",
          description: "Page image updated successfully",
        })
      } else {
        // Create new page image
        console.log("Creating new page image:", {
          page: selectedPage,
          title: pageTitle,
          image_url: selectedMedia.url,
          alt_text: altText,
        })

        const response = await fetch("/api/page-images", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page: selectedPage,
            title: pageTitle,
            image_url: selectedMedia.url,
            alt_text: altText,
          }),
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.message || "Failed to create page image")
        }

        toast({
          title: "Success",
          description: "Page image created successfully",
        })
      }

      // Refresh page images
      fetchPageImages()
      setOpenDialog(false)
      resetForm()
    } catch (error: any) {
      console.error("Error saving page image:", error)
      toast({
        title: "Error",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedMedia(null)
    setSelectedPage("")
    setPageTitle("")
    setAltText("")
  }

  const handleEditImage = (image: PageImage) => {
    setSelectedPage(image.page)
    setPageTitle(image.title)
    setAltText(image.alt_text || "")

    // Find the media item that matches the image URL
    // Ensure mediaItems is an array before using find
    if (Array.isArray(mediaItems)) {
      const media = mediaItems.find((item) => item.url === image.image_url)
      if (media) {
        setSelectedMedia(media)
      } else {
        // If we can't find the media item, create a temporary one
        setSelectedMedia({
          id: "temp-" + Date.now(),
          name: image.title,
          url: image.image_url,
          type: "image",
          size: 0,
          created_at: new Date().toISOString(),
        })
      }
    } else {
      console.error("mediaItems is not an array:", mediaItems)
      // Set a default media item based on the image
      setSelectedMedia({
        id: "default-" + Date.now(),
        name: image.title,
        url: image.image_url,
        type: "image",
        size: 0,
        created_at: new Date().toISOString(),
      })
    }

    setOpenDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Page Images</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Page Image
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Page Image</DialogTitle>
              <DialogDescription>
                Select an image and assign it to a specific page in your application.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="page">Page</Label>
                <select
                  id="page"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedPage}
                  onChange={(e) => {
                    setSelectedPage(e.target.value)
                    // Set a default title based on the page
                    const selectedPageType = pageTypes.find((p) => p.id === e.target.value)
                    if (selectedPageType) {
                      setPageTitle(selectedPageType.name)
                    }
                  }}
                >
                  <option value="">Select a page</option>
                  {pageTypes.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder="Enter a title for this image"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="alt">Alt Text</Label>
                <Input
                  id="alt"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image for accessibility"
                />
              </div>

              <div className="grid gap-2">
                <Label>Select an Image</Label>
                <div className="grid grid-cols-3 gap-4 max-h-[300px] overflow-y-auto p-2 border rounded-md">
                  {Array.isArray(mediaItems) && mediaItems.length > 0 ? (
                    mediaItems.map((media) => (
                      <div
                        key={media.id}
                        className={`relative cursor-pointer rounded-md overflow-hidden border-2 ${
                          selectedMedia?.id === media.id ? "border-primary" : "border-transparent"
                        }`}
                        onClick={() => handleSelectMedia(media)}
                      >
                        <div className="aspect-square relative">
                          <Image src={media.url || "/placeholder.svg"} alt={media.name} fill className="object-cover" />
                        </div>
                        <div className="p-1 text-xs truncate bg-background/80 absolute bottom-0 w-full">
                          {media.name}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 p-4 text-center text-muted-foreground">
                      No media items found. Upload some images first.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : pageImages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageImages.map((image) => (
            <Card key={image.id}>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{image.title}</CardTitle>
                <CardDescription>{image.page.replace(/_/g, " ")}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="aspect-video relative rounded-md overflow-hidden">
                  <Image
                    src={image.image_url || "/placeholder.svg"}
                    alt={image.alt_text || image.title}
                    fill
                    className="object-cover"
                  />
                </div>
                {image.alt_text && <p className="mt-2 text-sm text-muted-foreground">Alt: {image.alt_text}</p>}
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button variant="outline" size="sm" onClick={() => handleEditImage(image)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-muted/40 rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No page images found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add images to your pages to enhance your website's visual appeal.
          </p>
          <Button className="mt-4" onClick={() => setOpenDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Page Image
          </Button>
        </div>
      )}
    </div>
  )
}
