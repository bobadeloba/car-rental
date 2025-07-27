"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ImageIcon } from "lucide-react"

interface BackgroundManagerProps {
  userId: string
}

export function BackgroundManager({ userId }: BackgroundManagerProps) {
  const [backgrounds, setBackgrounds] = useState<any[]>([])
  const [media, setMedia] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBackground, setSelectedBackground] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    media_id: "",
    page: "home",
    section: "hero",
    is_active: true,
  })
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Initial setup
    setIsLoading(false)
  }, [])

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
            <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Background Management</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Background management functionality will be implemented soon.
            </p>
            <Button>Add Background</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
