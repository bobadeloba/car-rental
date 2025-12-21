"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface ConnectedAccount {
  id: string
  user_id: string
  provider: string
  provider_id: string
  is_connected: boolean
  created_at: string
  updated_at: string
}

export default function ConnectedAccountsSettings({ userId }: { userId: string }) {
  const { toast } = useToast()
  const supabase = createBrowserClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null)

  const providers = [
    { id: "google", name: "Google", icon: "google.svg" },
    { id: "facebook", name: "Facebook", icon: "facebook.svg" },
    { id: "twitter", name: "Twitter", icon: "twitter.svg" },
    { id: "apple", name: "Apple", icon: "apple.svg" },
  ]

  useEffect(() => {
    fetchConnectedAccounts()
  }, [userId])

  const fetchConnectedAccounts = async () => {
    try {
      setIsFetching(true)

      // Check if connected_accounts table exists
      const { data: tableExists } = await supabase.from("connected_accounts").select("*").limit(1).maybeSingle()

      // If table doesn't exist yet, we'll create it later when connecting an account
      if (tableExists === null) {
        setIsFetching(false)
        setConnectedAccounts([])
        return
      }

      // Fetch user's connected accounts
      const { data, error } = await supabase.from("connected_accounts").select("*").eq("user_id", userId)

      if (error) throw error

      setConnectedAccounts(data || [])
    } catch (error) {
      console.error("Error fetching connected accounts:", error)
      setConnectedAccounts([])
    } finally {
      setIsFetching(false)
    }
  }

  const handleConnect = async (providerId: string) => {
    setConnectingProvider(providerId)

    try {
      // In a real app, you would redirect to the OAuth flow
      // For this example, we'll simulate connecting after a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Check if the account is already connected
      const existingAccount = connectedAccounts.find((account) => account.provider === providerId)

      if (existingAccount) {
        // Update the existing connection
        const { error } = await supabase
          .from("connected_accounts")
          .update({
            is_connected: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingAccount.id)

        if (error) throw error
      } else {
        // Create a new connection
        const { error } = await supabase.from("connected_accounts").insert({
          user_id: userId,
          provider: providerId,
          provider_id: `${providerId}_${Math.random().toString(36).substring(2, 15)}`, // Simulated provider ID
          is_connected: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (error) throw error
      }

      toast({
        title: "Account connected",
        description: `Your ${getProviderName(providerId)} account has been connected successfully`,
      })

      fetchConnectedAccounts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to connect ${getProviderName(providerId)} account. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setConnectingProvider(null)
    }
  }

  const handleDisconnect = async (providerId: string) => {
    setConnectingProvider(providerId)

    try {
      // Find the connected account
      const account = connectedAccounts.find((account) => account.provider === providerId)

      if (!account) {
        throw new Error(`No connected ${getProviderName(providerId)} account found`)
      }

      // Update the connection status
      const { error } = await supabase
        .from("connected_accounts")
        .update({
          is_connected: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", account.id)

      if (error) throw error

      toast({
        title: "Account disconnected",
        description: `Your ${getProviderName(providerId)} account has been disconnected successfully`,
      })

      fetchConnectedAccounts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to disconnect ${getProviderName(providerId)} account. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setConnectingProvider(null)
    }
  }

  const getProviderName = (providerId: string) => {
    return providers.find((provider) => provider.id === providerId)?.name || providerId
  }

  const isConnected = (providerId: string) => {
    return connectedAccounts.some((account) => account.provider === providerId && account.is_connected)
  }

  if (isFetching) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Connect your accounts to enable single sign-on and access additional features.
      </p>

      <div className="space-y-4">
        {providers.map((provider) => (
          <div key={provider.id} className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                {/* In a real app, you would use actual provider icons */}
                <span className="font-medium">{provider.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium">{provider.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isConnected(provider.id) ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>
            {isConnected(provider.id) ? (
              <Button
                variant="outline"
                onClick={() => handleDisconnect(provider.id)}
                disabled={connectingProvider === provider.id}
              >
                {connectingProvider === provider.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Disconnecting...
                  </>
                ) : (
                  "Disconnect"
                )}
              </Button>
            ) : (
              <Button onClick={() => handleConnect(provider.id)} disabled={connectingProvider === provider.id}>
                {connectingProvider === provider.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <h4 className="font-medium">Why connect accounts?</h4>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-500 dark:text-gray-400">
          <li>Sign in quickly and securely without passwords</li>
          <li>Share your rental history across platforms</li>
          <li>Access exclusive partner offers and discounts</li>
          <li>Sync your calendar for better booking management</li>
        </ul>
      </div>
    </div>
  )
}
