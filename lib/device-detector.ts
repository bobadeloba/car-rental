// Device detection utility
export interface DeviceInfo {
  deviceType: "mobile" | "tablet" | "desktop"
  browser: string
  operatingSystem: string
}

export function detectDevice(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase()

  // Device type detection
  let deviceType: "mobile" | "tablet" | "desktop" = "desktop"

  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    deviceType = "tablet"
  } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    deviceType = "mobile"
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
  let operatingSystem = "Unknown"
  if (ua.includes("windows")) {
    operatingSystem = "Windows"
  } else if (ua.includes("mac")) {
    operatingSystem = "macOS"
  } else if (ua.includes("linux")) {
    operatingSystem = "Linux"
  } else if (ua.includes("android")) {
    operatingSystem = "Android"
  } else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad")) {
    operatingSystem = "iOS"
  }

  return {
    deviceType,
    browser,
    operatingSystem,
  }
}
