"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageImageManager } from "@/components/admin/media/page-image-manager"
import { MediaLibrary } from "@/components/admin/media/media-library"

export function MediaSettings() {
  const [activeTab, setActiveTab] = useState("library")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Media Settings</h2>
        <p className="text-muted-foreground">Manage your media library and page images.</p>
      </div>

      <Tabs defaultValue="library" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="library">Media Library</TabsTrigger>
          <TabsTrigger value="page-images">Page Images</TabsTrigger>
        </TabsList>
        <TabsContent value="library" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>Upload and manage images and other media files for your website.</CardDescription>
            </CardHeader>
            <CardContent>
              <MediaLibrary />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="page-images" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Images</CardTitle>
              <CardDescription>Assign images to specific pages in your website.</CardDescription>
            </CardHeader>
            <CardContent>
              <PageImageManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
