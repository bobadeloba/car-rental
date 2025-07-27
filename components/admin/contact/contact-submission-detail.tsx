"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, MailOpen, MailX, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

type ContactSubmission = {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: "new" | "read" | "archived"
  created_at: string
}

export function ContactSubmissionDetail({ submission }: { submission: ContactSubmission }) {
  const [status, setStatus] = useState(submission.status)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const updateStatus = async (newStatus: "new" | "read" | "archived") => {
    try {
      const { error } = await supabase.from("contact_submissions").update({ status: newStatus }).eq("id", submission.id)

      if (error) throw error

      setStatus(newStatus)
      toast({
        title: "Status updated",
        description: `Message marked as ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive",
      })
    }
  }

  const deleteSubmission = async () => {
    if (!confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("contact_submissions").delete().eq("id", submission.id)

      if (error) throw error

      toast({
        title: "Message deleted",
        description: "The message has been permanently deleted",
      })

      router.push("/admin/contact")
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = () => {
    const statusMap = {
      new: { label: "New", variant: "default" },
      read: { label: "Read", variant: "secondary" },
      archived: { label: "Archived", variant: "outline" },
    }
    const statusInfo = statusMap[status] || statusMap.new
    return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{submission.subject}</CardTitle>
            <CardDescription>
              From {submission.name} on {formatDate(submission.created_at, true)}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm">{submission.email}</p>
            </div>
            {submission.phone && (
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm">{submission.phone}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Message</h3>
          <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">{submission.message}</div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/admin/contact")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
        </Button>
        <div className="flex space-x-2">
          {status !== "read" && (
            <Button variant="outline" onClick={() => updateStatus("read")}>
              <MailOpen className="mr-2 h-4 w-4" /> Mark as Read
            </Button>
          )}
          {status !== "archived" && (
            <Button variant="outline" onClick={() => updateStatus("archived")}>
              <MailX className="mr-2 h-4 w-4" /> Archive
            </Button>
          )}
          <Button variant="destructive" onClick={deleteSubmission}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
