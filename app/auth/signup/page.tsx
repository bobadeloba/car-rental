import type { Metadata } from "next"
import SignUpForm from "@/components/auth/signup-form"
import { getSiteMetadata } from "@/lib/metadata"
import { PageTracker } from "@/components/analytics/page-tracker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthErrorHandler } from "@/components/auth/auth-error-handler"

export async function generateMetadata(): Promise<Metadata> {
  const { siteName, description } = await getSiteMetadata()

  return {
    title: `Sign Up | ${siteName}`,
    description: `Create your ${siteName} account to access premium car rentals and exclusive deals`,
    openGraph: {
      title: `Sign Up | ${siteName}`,
      description: `Create your ${siteName} account to access premium car rentals and exclusive deals`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `Sign Up | ${siteName}`,
      description: `Create your ${siteName} account to access premium car rentals and exclusive deals`,
    },
  }
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const redirectUrl = searchParams.redirect as string | undefined
  const error = searchParams.error as string | undefined
  const { siteName } = await getSiteMetadata()

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-900">
      <PageTracker pageTitle="Sign Up" />
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Join {siteName} today</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthErrorHandler error={error} />
            <SignUpForm redirectUrl={redirectUrl} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
