import { BannerSetup } from "@/components/admin/banner-setup"
import { BannerPreview } from "./page-preview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import { generatePageMetadata } from "@/lib/metadata"

export async function generateMetadata() {
  return generatePageMetadata("Setup Banners | Admin", "Set up banner images for your car rental website")
}

// Define the banners to set up
const banners = [
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

export default function SetupBannersPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Banner Setup</h1>
        <p className="text-muted-foreground">Set up banner images for your car rental website</p>
      </div>

      <div className="grid gap-8">
        <BannerPreview banners={banners} />

        <BannerSetup />

        <Card>
          <CardHeader>
            <CardTitle>What happens when you set up banners?</CardTitle>
            <CardDescription>Understanding the banner setup process</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>When you click the "Set Up Banner Images" button, the following actions will take place:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>The system will check if the page_images table exists in your database</li>
              <li>If the table doesn't exist, it will be created automatically</li>
              <li>Each banner image will be added to your media library</li>
              <li>The banner images will be assigned to their respective pages</li>
              <li>Your website will immediately start displaying these banners</li>
            </ol>
            <p className="text-sm text-muted-foreground mt-4">
              Note: This process will overwrite any existing banner images you may have set up previously.
            </p>
          </CardContent>
        </Card>
      </div>

      <Toaster />
    </div>
  )
}
