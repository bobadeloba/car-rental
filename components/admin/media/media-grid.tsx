"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Trash2, ImageIcon, FileText, Film, Edit, File } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface MediaGridProps {
  media: any[]
  onEdit: (media: any) => void
  onDelete: (media: any) => void
}

export function MediaGrid({ media, onEdit, onDelete }: MediaGridProps) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  const handleDownload = (url: string, filename: string) => {
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-6 w-6" />
    } else if (fileType.startsWith("video/")) {
      return <Film className="h-6 w-6" />
    } else {
      return <FileText className="h-6 w-6" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const renderThumbnail = (item: any) => {
    if (item.file_type.startsWith("image/")) {
      return (
        <img
          src={item.file_path || "/placeholder.svg"}
          alt={item.alt_text || item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )
    }

    return (
      <div className="flex items-center justify-center w-full h-full bg-muted">
        <File className="h-10 w-10 text-muted-foreground" />
      </div>
    )
  }

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-md bg-muted/20">
        <ImageIcon className="h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">No media items found</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((item) => (
          <Card key={item.id} className={`overflow-hidden ${!item.is_active ? "opacity-60" : ""}`}>
            <div className="relative aspect-square">
              {renderThumbnail(item)}
              {!item.is_active && (
                <div className="absolute top-2 right-2 bg-background/80 text-xs font-medium px-2 py-1 rounded">
                  Inactive
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <div className="truncate font-medium" title={item.name}>
                {item.name}
              </div>
              <div className="text-xs text-muted-foreground flex justify-between mt-1">
                <span>{item.category || "General"}</span>
                <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
              </div>
            </CardContent>
            <CardFooter className="p-2 pt-0 flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(item)}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Media</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this media item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between items-center mt-2">
            <span className="font-medium">{selectedItem?.title}</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(selectedItem)
                setShowDeleteDialog(false)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Media Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem?.file_type.startsWith("image/") && (
              <div className="flex justify-center">
                <img
                  src={selectedItem?.url || "/placeholder.svg"}
                  alt={selectedItem?.alt_text || selectedItem?.title}
                  className="max-h-48 object-contain"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="media-url">URL</Label>
              <div className="flex gap-2">
                <Input id="media-url" value={selectedItem?.url} readOnly />
                <Button type="button" size="icon" variant="outline" onClick={() => handleCopyUrl(selectedItem?.url)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>File Type</Label>
              <p className="text-sm">{selectedItem?.file_type}</p>
            </div>
            <div className="grid gap-2">
              <Label>File Size</Label>
              <p className="text-sm">{formatFileSize(selectedItem?.file_size)}</p>
            </div>
            {selectedItem?.dimensions && (
              <div className="grid gap-2">
                <Label>Dimensions</Label>
                <p className="text-sm">
                  {selectedItem?.dimensions.width} × {selectedItem?.dimensions.height}
                </p>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Uploaded</Label>
              <p className="text-sm">{new Date(selectedItem?.created_at).toLocaleString()}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
