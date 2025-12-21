export const dynamic = "force-dynamic"

import { createServerClient } from "@/lib/supabase/server"
import sharp from "sharp"
import { Buffer } from "buffer"

export async function GET() {
  try {
    // Create a Supabase client
    const supabase = await createServerClient()

    // Fetch the logo URL from admin settings
    const { data: settings, error } = await supabase
      .from("admin_settings")
      .select("logo_url")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !settings?.logo_url) {
      // Create a professional car-themed Apple icon
      const carIcon = await sharp({
        create: {
          width: 180,
          height: 180,
          channels: 4,
          background: { r: 37, g: 99, b: 235, alpha: 1 }, // Professional blue background
        },
      })
        .composite([
          {
            input: Buffer.from(`
            <svg width="180" height="180" xmlns="http://www.w3.org/2000/svg">
              <g fill="white">
                <!-- Car silhouette scaled up -->
                <path d="M30 110h12c0 6.6 5.4 12 12 12s12-5.4 12-12h48c0 6.6 5.4 12 12 12s12-5.4 12-12h12v-24l-18-36H48l-18 36v24z"/>
                <circle cx="54" cy="110" r="6"/>
                <circle cx="126" cy="110" r="6"/>
                <!-- Car body -->
                <path d="M48 50h84l12 24H36l12-24z"/>
                <!-- Car details -->
                <rect x="60" y="60" width="60" height="8" rx="4"/>
                <rect x="75" y="75" width="30" height="6" rx="3"/>
              </g>
            </svg>
          `),
            top: 0,
            left: 0,
          },
        ])
        .png()
        .toBuffer()

      return new Response(carIcon, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      })
    }

    // Fetch the logo image
    const logoResponse = await fetch(settings.logo_url)
    if (!logoResponse.ok) {
      throw new Error("Failed to fetch logo")
    }

    const logoBuffer = Buffer.from(await logoResponse.arrayBuffer())

    // Process the image to create an Apple icon (180x180 png)
    const iconBuffer = await sharp(logoBuffer)
      .resize(180, 180, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer()

    // Return the icon with appropriate headers
    return new Response(iconBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        "Last-Modified": new Date().toUTCString(),
      },
    })
  } catch (error) {
    console.error("Error generating Apple icon:", error)

    // Return a professional car-themed icon on error
    const fallbackIcon = await sharp({
      create: {
        width: 180,
        height: 180,
        channels: 4,
        background: { r: 37, g: 99, b: 235, alpha: 1 },
      },
    })
      .composite([
        {
          input: Buffer.from(`
          <svg width="180" height="180" xmlns="http://www.w3.org/2000/svg">
            <g fill="white">
              <!-- Car silhouette scaled up -->
              <path d="M30 110h12c0 6.6 5.4 12 12 12s12-5.4 12-12h48c0 6.6 5.4 12 12 12s12-5.4 12-12h12v-24l-18-36H48l-18 36v24z"/>
              <circle cx="54" cy="110" r="6"/>
              <circle cx="126" cy="110" r="6"/>
              <!-- Car body -->
              <path d="M48 50h84l12 24H36l12-24z"/>
              <!-- Car details -->
              <rect x="60" y="60" width="60" height="8" rx="4"/>
              <rect x="75" y="75" width="30" height="6" rx="3"/>
            </g>
          </svg>
        `),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer()

    return new Response(fallbackIcon, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    })
  }
}
