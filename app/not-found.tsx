import { KeyFob } from "@/components/animations/key-fob"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
      <div className="my-8">
        <KeyFob />
      </div>
      <h2 className="text-2xl font-semibold mb-4">Looks like you've taken a wrong turn</h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved to a different location.
      </p>
      <Button asChild>
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  )
}
