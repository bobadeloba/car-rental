import type React from "react"
import { Button } from "@/components/ui/button"
import { FileX } from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
  title: string
  description: string
  link?: string
  linkText?: string
  icon?: React.ReactNode
}

export default function EmptyState({
  title,
  description,
  link,
  linkText = "Add New",
  icon = <FileX className="h-12 w-12 text-gray-400" />,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md">{description}</p>
      {link && (
        <Button asChild>
          <Link href={link}>{linkText}</Link>
        </Button>
      )}
    </div>
  )
}
