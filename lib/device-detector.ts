// Device detection utility
export interface DeviceInfo {
  device_type: "mobile" | "tablet" | "desktop"
  browser: string
  operating_system: string
}

export function detectDevice(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase()

  // Device type detection
  let device_type: "mobile" | "tablet" | "desktop" = "desktop"

  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    device_type = "tablet"
  } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    device_type = "mobile"
  }

  // Browser detection
  let browser = "Unknown"
  if (ua.includes("firefox")) {
    browser = "Firefox"
  } else if (ua.includes("chrome") && !ua.includes("edg")) {
    browser = "Chrome"
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "Safari"
  } else if (ua.includes("edg")) {
    browser = "Edge"
  } else if (ua.includes("opera") || ua.includes("opr")) {
    browser = "Opera"
  } else if (ua.includes("trident") || ua.includes("msie")) {
    browser = "Internet Explorer"
  }

  // Operating system detection
  let operating_system = "Unknown"
  if (ua.includes("windows")) {
    operating_system = "Windows"
  } else if (ua.includes("mac")) {
    operating_system = "macOS"
  } else if (ua.includes("linux") && !ua.includes("android")) {
    operating_system = "Linux"
  } else if (ua.includes("android")) {
    operating_system = "Android"
  } else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    operating_system = "iOS"
  }

  return {
    device_type,
    browser,
    operating_system,
  }
}
