import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CarLoader } from "@/components/ui/car-loader"

export default function SignInLoading() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Loading sign in form...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <CarLoader size="lg" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
