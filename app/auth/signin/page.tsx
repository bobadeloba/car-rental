import SignInForm from "@/components/auth/signin-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function SignInPage({ searchParams }: PageProps) {
  const redirectUrl = typeof searchParams.redirect === "string" ? searchParams.redirect : undefined
  const error = typeof searchParams.error === "string" ? searchParams.error : undefined

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  {error === "oauth_error" && "There was an error with social authentication. Please try again."}
                  {error === "access_denied" && "Access was denied. Please try again if this was unintentional."}
                  {!["oauth_error", "access_denied"].includes(error) &&
                    "An authentication error occurred. Please try again."}
                </p>
              </div>
            )}
            <SignInForm redirectUrl={redirectUrl} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
