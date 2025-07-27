"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

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

interface ClientFooterProps {
  initialData: FooterData | null
}

export default function ClientFooter({ initialData }: ClientFooterProps) {
  // Format address from footer data
  const formatAddress = () => {
    if (!initialData) return []

    const addressParts = []
    if (initialData.site_address_line1) addressParts.push(initialData.site_address_line1)

    let cityStateZip = ""
    if (initialData.site_address_city) cityStateZip += initialData.site_address_city
    if (initialData.site_address_state) {
      if (cityStateZip) cityStateZip += ", "
      cityStateZip += initialData.site_address_state
    }
    if (initialData.site_address_postal) {
      if (cityStateZip) cityStateZip += " "
      cityStateZip += initialData.site_address_postal
    }

    if (cityStateZip) addressParts.push(cityStateZip)
    if (initialData.site_address_country) addressParts.push(initialData.site_address_country)

    return addressParts
  }

  // Render social links from footer data
  const renderSocialLinks = () => {
    if (!initialData) return null

    const links = []

    if (initialData.social_facebook) {
      links.push(
        <a
          key="facebook"
          href={initialData.social_facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Facebook size={20} />
          <span className="sr-only">Facebook</span>
        </a>,
      )
    }

    if (initialData.social_twitter) {
      links.push(
        <a
          key="twitter"
          href={initialData.social_twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Twitter size={20} />
          <span className="sr-only">Twitter</span>
        </a>,
      )
    }

    if (initialData.social_instagram) {
      links.push(
        <a
          key="instagram"
          href={initialData.social_instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Instagram size={20} />
          <span className="sr-only">Instagram</span>
        </a>,
      )
    }

    if (initialData.social_youtube) {
      links.push(
        <a
          key="youtube"
          href={initialData.social_youtube}
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

  // Error or no data state - minimal footer
  if (!initialData) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Car Rental. All rights reserved.</p>
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
            <h3 className="text-xl font-bold mb-4">{initialData.site_name || "Car Rental"}</h3>
            {initialData.footer_tagline && <p className="text-gray-400 mb-4">{initialData.footer_tagline}</p>}
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
              {initialData.contact_phone && <p className="mt-2">Phone: {initialData.contact_phone}</p>}
              {initialData.contact_email && <p>Email: {initialData.contact_email}</p>}
            </address>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} {initialData.site_name || "Car Rental"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
