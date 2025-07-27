"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"
import Editor from "@/components/admin/editor"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface ContentSettingsProps {
  userId?: string
}

type ContentType = "about" | "terms" | "privacy" | "faq" | "cookie"

interface ContentItem {
  id?: number
  type: string
  title: string
  content: string
  language: string
  created_at?: string
  updated_at?: string
}

export function ContentSettings({ userId }: ContentSettingsProps) {
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [activeTab, setActiveTab] = useState<ContentType>("about")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [contents, setContents] = useState<Record<ContentType, ContentItem>>({
    about: { type: "about", title: "About Us", content: "", language: "en" },
    terms: { type: "terms", title: "Terms and Conditions", content: "", language: "en" },
    privacy: { type: "privacy", title: "Privacy Policy", content: "", language: "en" },
    faq: { type: "faq", title: "Frequently Asked Questions", content: "", language: "en" },
    cookie: { type: "cookie", title: "Cookie Policy", content: "", language: "en" },
  })

  // Fetch content on component mount
  useEffect(() => {
    async function fetchContent() {
      setIsFetching(true)
      try {
        const { data, error } = await supabase
          .from("content")
          .select("*")
          .in("type", ["about", "terms", "privacy", "faq", "cookie"])

        if (error) {
          throw error
        }

        if (data && data.length > 0) {
          const contentMap = { ...contents }
          data.forEach((item) => {
            const type = item.type as ContentType
            contentMap[type] = item
          })
          setContents(contentMap)
        }
      } catch (error: any) {
        console.error("Error fetching content:", error)
        toast({
          title: "Error",
          description: "Failed to load content. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsFetching(false)
      }
    }

    fetchContent()
  }, [])

  const handleTitleChange = (type: ContentType, title: string) => {
    setContents((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        title,
      },
    }))
  }

  const handleContentChange = (type: ContentType, content: string) => {
    setContents((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        content,
      },
    }))
  }

  const saveContent = async (type: ContentType) => {
    setIsLoading(true)

    try {
      const contentItem = contents[type]
      const now = new Date().toISOString()

      if (contentItem.id) {
        // Update existing content
        const { error } = await supabase
          .from("content")
          .update({
            title: contentItem.title,
            content: contentItem.content,
            updated_at: now,
          })
          .eq("id", contentItem.id)

        if (error) throw error
      } else {
        // Insert new content
        const { data, error } = await supabase
          .from("content")
          .insert({
            type: contentItem.type,
            title: contentItem.title,
            content: contentItem.content,
            language: contentItem.language,
            created_at: now,
            updated_at: now,
          })
          .select()

        if (error) throw error

        // Update the local state with the new ID
        if (data && data[0]) {
          setContents((prev) => ({
            ...prev,
            [type]: {
              ...prev[type],
              id: data[0].id,
            },
          }))
        }
      }

      toast({
        title: "Content saved",
        description: `${contentItem.title} has been updated successfully`,
      })
    } catch (error: any) {
      console.error("Error saving content:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading content...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentType)} className="space-y-4">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="cookie">Cookie</TabsTrigger>
        </TabsList>

        {(["about", "terms", "privacy", "faq", "cookie"] as ContentType[]).map((type) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  <input
                    type="text"
                    value={contents[type].title}
                    onChange={(e) => handleTitleChange(type, e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-xl font-semibold focus:outline-none focus:ring-0"
                    placeholder="Enter page title"
                  />
                </CardTitle>
                <CardDescription>
                  Edit the content for the {type.charAt(0).toUpperCase() + type.slice(1)} page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="min-h-[400px]">
                  <Editor
                    value={contents[type].content}
                    onChange={(value) => handleContentChange(type, value)}
                    placeholder={`Enter ${type} page content here...`}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => saveContent(type)} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
