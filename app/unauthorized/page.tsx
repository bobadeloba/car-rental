import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mx-auto max-w-md">
        <div className="rounded-full bg-red-100 p-3 text-red-600 mx-auto w-fit dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Access Denied</h1>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          You don't have permission to access this page. This area is restricted to administrators only.
        </p>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          If you believe you should have access, please contact support or check if your account has the correct role
          assigned.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
        <div className="mt-6 border-t pt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you an administrator having trouble accessing this page?
          </p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/admin/fix-permissions">Fix Admin Permissions</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
