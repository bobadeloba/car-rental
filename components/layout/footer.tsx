"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@/lib/supabase/client"
import { CarSpinner } from "@/components/ui/car-spinner"

interface FooterData {
  site_name: string | null
  footer_tagline: string | null
  contact_email: string | null
  contact_phone: string | null
  site_address_line1: string | null
  site_address_line2: string | null
  site_address_city: string | null
  site_address_state: string | null
  site_address_country: string | null
  site_address_postal: string | null
  social_facebook: string | null
  social_twitter: string | null
  social_instagram: string | null
  social_youtube: string | null
}

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    let retryCount = 0
    const maxRetries = 3

    const fetchFooterData = async () => {
      try {
        console.log("Fetching footer data...")
        const supabase = createClientComponentClient()

        // Fetch the most recent settings
        const { data, error } = await supabase
          .from("admin_settings")
          .select(`
            site_name,
            footer_tagline,
            contact_email,
            contact_phone,
            site_address_line1,
            site_address_line2,
            site_address_city,
            site_address_state,
            site_address_country,
            site_address_postal,
            social_facebook,
            social_twitter,
            social_instagram,
            social_youtube
          `)
          .order("updated_at", { ascending: false })
          .limit(1)

        if (error) {
          console.error("Error fetching footer data:", error)

          // Check if we should retry
          if (retryCount < maxRetries) {
            retryCount++
            const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
            console.log(`Retrying in ${delay}ms (attempt ${retryCount} of ${maxRetries})`)
            setTimeout(fetchFooterData, delay)
            return
          }

          if (isMounted) {
            setError(error.message)
          }
          return
        }

        console.log("Footer data from DB:", data)

        if (data && data.length > 0 && isMounted) {
          setFooterData(data[0])
        } else if (isMounted) {
          setError("No settings found")
        }
      } catch (err) {
        console.error("Failed to fetch footer data:", err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unknown error")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchFooterData()

    return () => {
      isMounted = false
    }
  }, [])

  // Format address from footer data
  const formatAddress = () => {
    if (!footerData) return []

    const addressParts = []
    if (footerData.site_address_line1) addressParts.push(footerData.site_address_line1)

    let cityStateZip = ""
    if (footerData.site_address_city) cityStateZip += footerData.site_address_city
    if (footerData.site_address_state) {
      if (cityStateZip) cityStateZip += ", "
      cityStateZip += footerData.site_address_state
    }
    if (footerData.site_address_postal) {
      if (cityStateZip) cityStateZip += " "
      cityStateZip += footerData.site_address_postal
    }

    if (cityStateZip) addressParts.push(cityStateZip)
    if (footerData.site_address_country) addressParts.push(footerData.site_address_country)

    return addressParts
  }

  // Render social links from footer data
  const renderSocialLinks = () => {
    if (!footerData) return null

    const links = []

    if (footerData.social_facebook) {
      links.push(
        <a
          key="facebook"
          href={footerData.social_facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Facebook size={20} />
          <span className="sr-only">Facebook</span>
        </a>,
      )
    }

    if (footerData.social_twitter) {
      links.push(
        <a
          key="twitter"
          href={footerData.social_twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Twitter size={20} />
          <span className="sr-only">Twitter</span>
        </a>,
      )
    }

    if (footerData.social_instagram) {
      links.push(
        <a
          key="instagram"
          href={footerData.social_instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Instagram size={20} />
          <span className="sr-only">Instagram</span>
        </a>,
      )
    }

    if (footerData.social_youtube) {
      links.push(
        <a
          key="youtube"
          href={footerData.social_youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Youtube size={20} />
          <span className="sr-only">YouTube</span>
        </a>,
      )
    }

    return links.length > 0 ? <div className="flex space-x-4">{links}</div> : null
  }

  // Loading state
  if (loading) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CarSpinner color="white" />
            <p className="text-gray-400">Loading footer information...</p>
          </div>
        </div>
      </footer>
    )
  }

  // Error or no data state - minimal footer
  if (error || !footerData) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Premium Car Rentals. All rights reserved.</p>
            {process.env.NODE_ENV === "development" && error && (
              <p className="text-red-400 text-sm mt-2">Error: {error}</p>
            )}
          </div>
        </div>
      </footer>
    )
  }

  const addressParts = formatAddress()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{footerData.site_name || "Car Rental"}</h3>
            {footerData.footer_tagline && <p className="text-gray-400 mb-4">{footerData.footer_tagline}</p>}
            {renderSocialLinks()}
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/cars" className="text-gray-400 hover:text-white transition-colors">
                  Cars
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <address className="not-italic text-gray-400">
              {addressParts.length > 0 ? (
                addressParts.map((part, index) => <p key={index}>{part}</p>)
              ) : (
                <p>No address information available</p>
              )}
              {footerData.contact_phone && <p className="mt-2">Phone: {footerData.contact_phone}</p>}
              {footerData.contact_email && <p>Email: {footerData.contact_email}</p>}
            </address>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} {footerData.site_name || "Car Rental"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
