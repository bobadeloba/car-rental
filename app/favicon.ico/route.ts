import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import sharp from "sharp"
import { Buffer } from "buffer"

export async function GET() {
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Fetch the logo URL from admin settings
    const { data: settings, error } = await supabase
      .from("admin_settings")
      .select("logo_url")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !settings?.logo_url) {
      // Create a professional car-themed favicon
      const carFavicon = await sharp({
        create: {
          width: 32,
          height: 32,
          channels: 4,
          background: { r: 37, g: 99, b: 235, alpha: 1 }, // Professional blue background
        },
      })
        .composite([
          {
            input: Buffer.from(`
            <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
              <g fill="white">
                <!-- Car silhouette -->
                <path d="M6 18h2c0 1.1.9 2 2 2s2-.9 2-2h8c0 1.1.9 2 2 2s2-.9 2-2h2v-4l-3-6H9l-3 6v4z"/>
                <circle cx="10" cy="18" r="1"/>
                <circle cx="22" cy="18" r="1"/>
                <!-- Car body -->
                <path d="M9 8h14l2 4H7l2-4z"/>
              </g>
            </svg>
          `),
            top: 0,
            left: 0,
          },
        ])
        .png()
        .toBuffer()

      return new Response(carFavicon, {
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

    // Process the image to create a favicon (32x32 png)
    const faviconBuffer = await sharp(logoBuffer)
      .resize(32, 32, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer()

    // Return the favicon with appropriate headers
    return new Response(faviconBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        "Last-Modified": new Date().toUTCString(),
      },
    })
  } catch (error) {
    console.error("Error generating favicon:", error)

    // Return a professional car-themed favicon on error
    const fallbackFavicon = await sharp({
      create: {
        width: 32,
        height: 32,
        channels: 4,
        background: { r: 37, g: 99, b: 235, alpha: 1 },
      },
    })
      .composite([
        {
          input: Buffer.from(`
          <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
            <g fill="white">
              <!-- Car silhouette -->
              <path d="M6 18h2c0 1.1.9 2 2 2s2-.9 2-2h8c0 1.1.9 2 2 2s2-.9 2-2h2v-4l-3-6H9l-3 6v4z"/>
              <circle cx="10" cy="18" r="1"/>
              <circle cx="22" cy="18" r="1"/>
              <!-- Car body -->
              <path d="M9 8h14l2 4H7l2-4z"/>
            </g>
          </svg>
        `),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer()

    return new Response(fallbackFavicon, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    })
  }
}
