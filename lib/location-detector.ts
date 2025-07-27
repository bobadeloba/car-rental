// Location detection utility using IP geolocation
export interface LocationInfo {
  country?: string
  city?: string
  region?: string
}

export async function detectLocation(ipAddress: string): Promise<LocationInfo> {
  try {
    // Skip location detection for localhost/private IPs
    if (
      !ipAddress ||
      ipAddress === "127.0.0.1" ||
      ipAddress === "::1" ||
      ipAddress.startsWith("192.168.") ||
      ipAddress.startsWith("10.") ||
      ipAddress.startsWith("172.")
    ) {
      return {
        country: "Local",
        city: "Local",
        region: "Local",
      }
    }

    // Use a free IP geolocation service (ip-api.com)
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,regionName,city`, {
      headers: {
        "User-Agent": "Car Rental Analytics",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch location data")
    }

    const data = await response.json()

    if (data.status === "success") {
      return {
        country: data.country || undefined,
        city: data.city || undefined,
        region: data.regionName || undefined,
      }
    }

    return {}
  } catch (error) {
    console.error("Error detecting location:", error)
    return {}
  }
}
