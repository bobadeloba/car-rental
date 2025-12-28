import { getSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AccountSettings from "@/components/dashboard/account-settings"
import NotificationSettings from "@/components/dashboard/notification-settings"
import PasswordSettings from "@/components/dashboard/password-settings"
import PaymentMethodsSettings from "@/components/dashboard/payment-methods-settings"
import PrivacySettings from "@/components/dashboard/privacy-settings"
import ConnectedAccountsSettings from "@/components/dashboard/connected-accounts-settings"
import { getCompanyName } from "@/lib/company-name"
import type { Metadata, ResolvingMetadata } from "next"

type Props = {
  params: {}
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const companyName = await getCompanyName()

  return {
    title: `Settings | ${companyName}`,
    description: "Manage your account settings and preferences",
  }
}

export default async function SettingsPage() {
  const supabase = await getSupabaseServer()

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin?redirect=/dashboard/settings")
  }

  // Get user details
  const { data: user } = await supabase.from("users").select("*").eq("id", session.user.id).single()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="connected">Connected Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Update your account settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <AccountSettings user={user} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettings userId={session.user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods and billing information</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentMethodsSettings userId={session.user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your data and privacy preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <PrivacySettings userId={session.user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connected">
          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>Manage your connected social accounts and services</CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectedAccountsSettings userId={session.user.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
