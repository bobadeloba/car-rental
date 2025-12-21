import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
// Import dynamic config to force all pages to be dynamic
import "./dynamic.js"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import WhatsAppButton from "@/components/whatsapp-button"
import { checkRequiredEnvVars } from "@/lib/env-check"
import { SupabaseProvider } from "@/components/providers/supabase-provider"
import { siteConfig } from "@/lib/site-config"
import type { Metadata } from "next"
import Script from "next/script"
import { Suspense } from "react"

// Check for required environment variables during build/startup
try {
  checkRequiredEnvVars()
} catch (error) {
  console.error("Environment variable check failed:", error)
  // We'll continue despite missing vars, but log the error
}

const inter = Inter({ subsets: ["latin"] })

// Updated metadata with current information
export const metadata: Metadata = {
  title: {
    default: "YOLO Rental Cars - Premium Car Rental in Dubai, UAE",
    template: `%s | YOLO Rental Cars`,
  },
  description:
    "Experience luxury car rentals in Dubai with YOLO Rental Cars. Premium vehicles, competitive rates, and exceptional service across the UAE.",
  keywords: ["car rental Dubai", "luxury car rental", "UAE car rental", "premium vehicles", "Dubai car hire"],
  authors: [{ name: "YOLO Rental Cars" }],
  creator: "YOLO Rental Cars",
  publisher: "YOLO Rental Cars",
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: "YOLO Rental Cars - Premium Car Rental in Dubai, UAE",
    description:
      "Experience luxury car rentals in Dubai with YOLO Rental Cars. Premium vehicles, competitive rates, and exceptional service across the UAE.",
    siteName: "YOLO Rental Cars",
    images: [
      {
        url: "/icon.png",
        width: 192,
        height: 192,
        alt: "YOLO Rental Cars Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YOLO Rental Cars - Premium Car Rental in Dubai, UAE",
    description:
      "Experience luxury car rentals in Dubai with YOLO Rental Cars. Premium vehicles, competitive rates, and exceptional service across the UAE.",
    images: ["/icon.png"],
    creator: "@yolorentals",
  },
  icons: [
    { rel: "icon", url: "/favicon.ico", sizes: "32x32" },
    { rel: "icon", url: "/icon.png", sizes: "192x192", type: "image/png" },
    { rel: "apple-touch-icon", url: "/apple-icon.png", sizes: "180x180" },
  ],
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.app'
}

// Force dynamic rendering for all pages
export const dynamic = "force-dynamic"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-47JWGGKCZ0" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-47JWGGKCZ0'); // Your existing Google Analytics config
            gtag('config', 'AW-17113926614'); // Add this line for Google Ads
          `}
        </Script>

        {/* Meta Pixel Code - Placed in head as recommended by Meta */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '748353931312637');
          fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=748353931312637&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}

        {/* Structured Data */}
        <Script id="structured-data" type="application/ld+json">
          {`
          {
            "@context": "https://schema.org",
            "@type": "CarRental",
            "name": "YOLO Rental Cars",
            "description": "Premium car rental service in Dubai, UAE. Experience luxury car rentals in Dubai with YOLO Rental Cars. Premium vehicles, competitive rates, and exceptional service across the UAE.",
            "url": "${siteConfig.url}",
            "logo": "${siteConfig.url}/icon.png",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Al Quasis Industrial Area 4",
              "addressLocality": "Dubai",
              "addressRegion": "Emirate of Dubai",
              "postalCode": "25314",
              "addressCountry": "UAE"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+971-58-250-1002",
              "contactType": "customer service",
              "email": "Yolo.Rental@proton.me"
            },
            "sameAs": [
              
            ]
          }
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SupabaseProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <Suspense>
                <main className="flex-1">{children}</main>
              </Suspense>
              <Footer />
              <WhatsAppButton />
              <Toaster />
            </div>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
