"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BannerPreviewProps {
  banners: {
    page: string
    title: string
    path: string
    alt: string
  }[]
}

export function BannerPreview({ banners }: BannerPreviewProps) {
  const [activeTab, setActiveTab] = useState("home_hero")

  const activeBanner = banners.find((banner) => banner.page === activeTab) || banners[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banner Preview</CardTitle>
        <CardDescription>Preview how your banners will look on different pages</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-4">
            {banners.map((banner) => (
              <TabsTrigger key={banner.page} value={banner.page}>
                {banner.page.replace(/_/g, " ")}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="relative w-full h-64 overflow-hidden rounded-md border">
            <Image
              src={activeBanner.path || "/placeholder.svg"}
              alt={activeBanner.alt}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center text-white p-4">
                <h3 className="text-2xl font-bold">{activeBanner.title}</h3>
                <p className="text-sm opacity-80 mt-2">This is how the banner will appear on your website</p>
              </div>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
