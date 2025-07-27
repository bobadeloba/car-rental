import type { Metadata } from "next"
import { getPageImage } from "@/lib/page-images"
import { getCompanyName } from "@/lib/company-name"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { AboutSection } from "@/components/home/about-section"
import { CTASection } from "@/components/home/cta-section"
import { StatsSection } from "@/components/home/stats-section"
import { FeaturedCars } from "@/components/home/featured-cars"
import { Testimonials } from "@/components/home/testimonials"
import CategoryShowcase from "@/components/home/category-showcase"
import { getSupabaseServer } from "@/lib/supabase/server"
import { ErrorBoundary } from "@/components/error-boundary"
import { LuxuryDivider } from "@/components/home/luxury-divider"
import { PageTracker } from "@/components/analytics/page-tracker"

// Force dynamic rendering to avoid static generation issues
export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const companyName = await getCompanyName()

    return {
      title: companyName || "Luxury Car Rental",
      description: `${companyName} - Premium car rental service for all your needs`,
      openGraph: {
        title: companyName || "Luxury Car Rental",
        description: `${companyName} - Premium car rental service for all your needs`,
        type: "website",
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Luxury Car Rental",
      description: "Premium car rental service for all your needs",
      openGraph: {
        title: "Luxury Car Rental",
        description: "Premium car rental service for all your needs",
        type: "website",
      },
    }
  }
}

export default async function HomePage() {
  // Use try-catch to prevent loading screen from getting stuck
  let companyName = "Luxury Car Rental"
  // Use a guaranteed existing image path as default
  let heroImageUrl = "/images/banners/luxury-banner-1.png"
  let heroAltText = "Luxury car rental"
  let categories = []
  let featuredCars = []

  try {
    // Wrap each fetch operation in its own try-catch to prevent cascading failures
    try {
      companyName = await getCompanyName()
    } catch (error) {
      console.error("Error fetching company name:", error)
      // Continue with default value
    }

    try {
      // Fetch hero image from database
      const heroImage = await getPageImage("home_hero")
      if (heroImage?.image_url) {
        // Validate the image URL to ensure it's a complete URL or a valid path
        if (heroImage.image_url.startsWith("http") || heroImage.image_url.startsWith("/")) {
          heroImageUrl = heroImage.image_url
        } else {
          // If it's a relative path without leading slash, add one
          heroImageUrl = `/${heroImage.image_url}`
        }
      }

      if (heroImage?.alt_text) {
        heroAltText = heroImage.alt_text
      }
    } catch (error) {
      console.error("Error fetching hero image:", error)
      // Continue with default values
    }

    try {
      // Fetch categories for the showcase
      const supabase = getSupabaseServer()
      const { data: categoriesData } = await supabase.from("categories").select("*").order("name")

      if (categoriesData) {
        categories = categoriesData.map((category) => ({
          ...category,
          slug: category.slug || category.name.toLowerCase().replace(/\s+/g, "-"),
        }))
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      // Continue with empty categories
    }

    try {
      // Fetch featured cars
      const supabase = getSupabaseServer()
      const { data: carsData } = await supabase
        .from("cars")
        .select("id, name, brand, price_per_day, images")
        .order("price_per_day", { ascending: false })
        .limit(6)

      if (carsData) {
        featuredCars = carsData
      }
    } catch (error) {
      console.error("Error fetching featured cars:", error)
      // Continue with empty featuredCars
    }
  } catch (error) {
    console.error("Error fetching data for home page:", error)
    // Continue with default values
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageTracker pageTitle="Home - Luxury Car Rental" />
      {/* Hero Section */}
      <ErrorBoundary>
        <HeroSection companyName={companyName} heroImageUrl={heroImageUrl} heroAltText={heroAltText} />
      </ErrorBoundary>

      {/* Features Section */}
      <ErrorBoundary>
        <FeaturesSection companyName={companyName} />
      </ErrorBoundary>

      <LuxuryDivider />

      {/* About Section */}
      <ErrorBoundary>
        <AboutSection />
      </ErrorBoundary>

      {/* Categories Showcase */}
      <ErrorBoundary>
        <CategoryShowcase categories={categories} />
      </ErrorBoundary>

      {/* Stats Section */}
      <ErrorBoundary>
        <StatsSection />
      </ErrorBoundary>

      {/* Featured Cars Section */}
      <ErrorBoundary>
        <FeaturedCars cars={featuredCars} />
      </ErrorBoundary>

      {/* Testimonials Section */}
      <ErrorBoundary>
        <Testimonials />
      </ErrorBoundary>

      {/* CTA Section */}
      <ErrorBoundary>
        <CTASection />
      </ErrorBoundary>
    </div>
  )
}
