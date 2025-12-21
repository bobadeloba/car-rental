"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createBrowserClient } from "@/lib/supabase/client"

interface BannerSetupProps {
  onComplete?: () => void
}

interface Banner {
  page: string
  title: string
  path: string
  alt: string
}

export function BannerSetup({ onComplete }: BannerSetupProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<Record<string, "pending" | "success" | "error">>({})
  const { toast } = useToast()
  const supabase = createBrowserClient()

  // Define the banners to set up
  const banners: Banner[] = [
    {
      page: "home_hero",
      title: "Home Hero Banner",
      path: "/banners/home-hero-banner.jpg",
      alt: "Luxury car rental showroom with premium sports cars",
    },
    {
      page: "about_hero",
      title: "About Hero Banner",
      path: "/banners/about-hero-banner.jpg",
      alt: "Team of professional car rental staff in front of luxury vehicles",
    },
    {
      page: "contact_hero",
      title: "Contact Hero Banner",
      path: "/banners/contact-hero-banner.jpg",
      alt: "Customer service representatives at car rental desk helping clients",
    },
    {
      page: "cars_hero",
      title: "Cars Hero Banner",
      path: "/banners/cars-hero-banner.jpg",
      alt: "Collection of luxury and sports cars parked in showroom",
    },
    {
      page: "home_about",
      title: "Home About Banner",
      path: "/banners/home-about-banner.jpg",
      alt: "Close up of car keys being handed over to customer",
    },
  ]

  const setupBanners = async () => {
    setIsLoading(true)

    // First, check if the page_images table exists
    try {
      const { error: tableCheckError } = await supabase.from("page_images").select("count").limit(1)

      if (tableCheckError && tableCheckError.message.includes("does not exist")) {
        // Table doesn't exist, create it
        toast({
          title: "Creating page_images table",
          description: "Setting up the necessary database table...",
        })

        try {
          const response = await fetch("/api/setup/page-images", { method: "POST" })
          if (!response.ok) {
            throw new Error("Failed to create page_images table")
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to create page_images table. Please try again.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }
    } catch (error) {
      console.error("Error checking table:", error)
      toast({
        title: "Error",
        description: "Failed to check if page_images table exists",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Process each banner
    for (const banner of banners) {
      setProgress((prev) => ({ ...prev, [banner.page]: "pending" }))

      try {
        // 1. First, upload the image to the media library
        const { data: mediaData, error: mediaError } = await supabase
          .from("media")
          .insert({
            name: banner.title,
            file_path: banner.path,
            file_type: "image/jpeg",
            alt_text: banner.alt,
            category: "banners",
            is_active: true,
            size: 1024 * 1024, // Adding a default size of 1MB
          })
          .select()
          .single()

        if (mediaError) {
          throw new Error(`Failed to add media: ${mediaError.message}`)
        }

        // 2. Check if a page image already exists for this page
        const { data: existingImage, error: checkError } = await supabase
          .from("page_images")
          .select("*")
          .eq("page", banner.page)
          .maybeSingle()

        if (checkError && !checkError.message.includes("No rows found")) {
          throw new Error(`Failed to check existing image: ${checkError.message}`)
        }

        // 3. Create or update the page image
        if (existingImage) {
          // Update existing image
          const { error: updateError } = await supabase
            .from("page_images")
            .update({
              image_url: banner.path,
              alt_text: banner.alt,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingImage.id)

          if (updateError) {
            throw new Error(`Failed to update page image: ${updateError.message}`)
          }
        } else {
          // Create new image
          const { error: insertError } = await supabase.from("page_images").insert({
            page: banner.page,
            title: banner.title,
            image_url: banner.path,
            alt_text: banner.alt,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (insertError) {
            throw new Error(`Failed to create page image: ${insertError.message}`)
          }
        }

        setProgress((prev) => ({ ...prev, [banner.page]: "success" }))
      } catch (error: any) {
        console.error(`Error setting up ${banner.title}:`, error)
        setProgress((prev) => ({ ...prev, [banner.page]: "error" }))

        // Show error toast for each failure
        toast({
          title: `Error setting up ${banner.title}`,
          description: error.message || "An unknown error occurred",
          variant: "destructive",
        })
      }

      // Small delay between operations
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsLoading(false)

    // Count successes
    const successCount = Object.values(progress).filter((status) => status === "success").length

    if (successCount === banners.length) {
      toast({
        title: "Success!",
        description: "All banner images have been set up successfully.",
      })
    } else {
      toast({
        title: "Partially Complete",
        description: `${successCount} out of ${banners.length} banners were set up successfully.`,
        variant: "destructive",
      })
    }

    if (onComplete) {
      onComplete()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banner Setup</CardTitle>
        <CardDescription>
          Set up banner images for your website. This will add the generated banner images to your media library and
          assign them to the appropriate pages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {banners.map((banner) => (
            <div key={banner.page} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{banner.title}</p>
                <p className="text-sm text-muted-foreground">{banner.page.replace(/_/g, " ")}</p>
              </div>
              <div>
                {progress[banner.page] === "success" && <Check className="h-5 w-5 text-green-500" />}
                {progress[banner.page] === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
                {progress[banner.page] === "pending" && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={setupBanners} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting Up Banners...
            </>
          ) : (
            "Set Up Banner Images"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
