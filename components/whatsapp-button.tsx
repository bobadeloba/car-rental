"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { MessageCircle } from "lucide-react"

export default function WhatsAppButton() {
  const [whatsappPhone, setWhatsappPhone] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchWhatsAppPhone = async () => {
      try {
        // First try the API route
        const response = await fetch("/api/app-metadata")
        if (response.ok) {
          const { data } = await response.json()
          if (data && data.whatsappPhone) {
            setWhatsappPhone(data.whatsappPhone)
            return
          }
        }

        // Fallback to direct query if API route fails
        const { data, error } = await supabase
          .from("admin_settings")
          .select("whatsapp_phone")
          .order("updated_at", { ascending: false })
          .limit(1)
          .single()

        if (error) {
          console.error("Error fetching WhatsApp phone:", error)
          return
        }

        if (data && data.whatsapp_phone) {
          setWhatsappPhone(data.whatsapp_phone)
        }
      } catch (error) {
        console.error("Error in fetchWhatsAppPhone:", error)
      }
    }

    fetchWhatsAppPhone()
  }, [supabase])

  if (!whatsappPhone) return null

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappPhone}`, "_blank")
  }

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-125 animate-pulse hover:animate-none"
      aria-label="Contact us on WhatsApp"
    >
      <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
      <div className="absolute inset-0 rounded-full bg-green-400 animate-pulse opacity-30"></div>
      <MessageCircle size={24} className="relative z-10" />
    </button>
  )
}
