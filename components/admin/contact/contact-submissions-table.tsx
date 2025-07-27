"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, MailOpen, MailX, Trash2 } from "lucide-react"
import DataTable from "@/components/admin/shared/data-table"
import { formatDate } from "@/lib/utils"
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

export function ContactSubmissionsTable({ initialSubmissions }: { initialSubmissions: ContactSubmission[] }) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>(initialSubmissions)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("all")
  const pageSize = 10
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Filter submissions based on active tab
  const filteredSubmissions = submissions.filter((submission) => {
    if (activeTab === "all") return true
    if (activeTab === "new") return submission.status === "new"
    if (activeTab === "read") return submission.status === "read"
    if (activeTab === "archived") return submission.status === "archived"
    return true
  })

  const updateSubmissionStatus = async (id: string, status: "new" | "read" | "archived") => {
    try {
      const { error } = await supabase.from("contact_submissions").update({ status }).eq("id", id)

      if (error) throw error

      // Update local state
      setSubmissions((prev) =>
        prev.map((submission) => (submission.id === id ? { ...submission, status } : submission)),
      )

      toast({
        title: "Status updated",
        description: `Message marked as ${status}`,
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

  const deleteSubmission = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("contact_submissions").delete().eq("id", id)

      if (error) throw error

      // Update local state
      setSubmissions((prev) => prev.filter((submission) => submission.id !== id))

      toast({
        title: "Message deleted",
        description: "The message has been permanently deleted",
      })
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      })
    }
  }

  const viewSubmission = (id: string) => {
    router.push(`/admin/contact/${id}`)
  }

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Subject",
      accessorKey: "subject",
    },
    {
      header: "Date",
      accessorKey: "created_at",
      cell: (submission: ContactSubmission) => formatDate(submission.created_at),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (submission: ContactSubmission) => {
        const statusMap = {
          new: { label: "New", variant: "default" },
          read: { label: "Read", variant: "secondary" },
          archived: { label: "Archived", variant: "outline" },
        }
        const status = statusMap[submission.status] || statusMap.new
        return <Badge variant={status.variant as any}>{status.label}</Badge>
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (submission: ContactSubmission) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => viewSubmission(submission.id)} title="View details">
            <Eye className="h-4 w-4" />
          </Button>
          {submission.status !== "read" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSubmissionStatus(submission.id, "read")}
              title="Mark as read"
            >
              <MailOpen className="h-4 w-4" />
            </Button>
          )}
          {submission.status !== "archived" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSubmissionStatus(submission.id, "archived")}
              title="Archive"
            >
              <MailX className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteSubmission(submission.id)}
            title="Delete"
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Form Submissions</CardTitle>
        <CardDescription>Manage messages from the contact form</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="space-y-4">
            <DataTable
              data={filteredSubmissions.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
              columns={columns}
              count={filteredSubmissions.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              emptyState={
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium">No messages found</h3>
                  <p className="text-muted-foreground">There are no contact form submissions to display.</p>
                </div>
              }
            />
          </TabsContent>

          <TabsContent value="new" className="space-y-4">
            <DataTable
              data={filteredSubmissions.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
              columns={columns}
              count={filteredSubmissions.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              emptyState={
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium">No new messages</h3>
                  <p className="text-muted-foreground">There are no new contact form submissions.</p>
                </div>
              }
            />
          </TabsContent>

          <TabsContent value="read" className="space-y-4">
            <DataTable
              data={filteredSubmissions.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
              columns={columns}
              count={filteredSubmissions.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              emptyState={
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium">No read messages</h3>
                  <p className="text-muted-foreground">There are no read contact form submissions.</p>
                </div>
              }
            />
          </TabsContent>

          <TabsContent value="archived" className="space-y-4">
            <DataTable
              data={filteredSubmissions.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
              columns={columns}
              count={filteredSubmissions.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              emptyState={
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium">No archived messages</h3>
                  <p className="text-muted-foreground">There are no archived contact form submissions.</p>
                </div>
              }
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
