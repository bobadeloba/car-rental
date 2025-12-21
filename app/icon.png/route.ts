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
      // Create a professional car-themed web app icon
      const carIcon = await sharp({
        create: {
          width: 192,
          height: 192,
          channels: 4,
          background: { r: 37, g: 99, b: 235, alpha: 1 }, // Professional blue background
        },
      })
        .composite([
          {
            input: Buffer.from(`
            <svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
              <g fill="white">
                <!-- Car silhouette scaled up -->
                <path d="M32 118h13c0 7 6 13 13 13s13-6 13-13h51c0 7 6 13 13 13s13-6 13-13h13v-26l-19-38H51l-19 38v26z"/>
                <circle cx="58" cy="118" r="7"/>
                <circle cx="134" cy="118" r="7"/>
                <!-- Car body -->
                <path d="M51 54h90l13 26H38l13-26z"/>
                <!-- Car details -->
                <rect x="64" y="64" width="64" height="9" rx="4"/>
                <rect x="80" y="80" width="32" height="7" rx="3"/>
                <!-- Headlights -->
                <circle cx="45" cy="90" r="3"/>
                <circle cx="147" cy="90" r="3"/>
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

    // Process the image to create a web app icon (192x192 png)
    const iconBuffer = await sharp(logoBuffer)
      .resize(192, 192, {
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
    console.error("Error generating web app icon:", error)

    // Return a professional car-themed icon on error
    const fallbackIcon = await sharp({
      create: {
        width: 192,
        height: 192,
        channels: 4,
        background: { r: 37, g: 99, b: 235, alpha: 1 },
      },
    })
      .composite([
        {
          input: Buffer.from(`
          <svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
            <g fill="white">
              <!-- Car silhouette scaled up -->
              <path d="M32 118h13c0 7 6 13 13 13s13-6 13-13h51c0 7 6 13 13 13s13-6 13-13h13v-26l-19-38H51l-19 38v26z"/>
              <circle cx="58" cy="118" r="7"/>
              <circle cx="134" cy="118" r="7"/>
              <!-- Car body -->
              <path d="M51 54h90l13 26H38l13-26z"/>
              <!-- Car details -->
              <rect x="64" y="64" width="64" height="9" rx="4"/>
              <rect x="80" y="80" width="32" height="7" rx="3"/>
              <!-- Headlights -->
              <circle cx="45" cy="90" r="3"/>
              <circle cx="147" cy="90" r="3"/>
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
