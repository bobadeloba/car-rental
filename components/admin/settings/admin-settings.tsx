"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettings } from "@/components/admin/settings/general-settings"
import { ContactSettings } from "@/components/admin/settings/contact-settings"
import { SecuritySettings } from "@/components/admin/settings/security-settings"
import { PaymentSettings } from "@/components/admin/settings/payment-settings"
import { NotificationSettings } from "@/components/admin/settings/notification-settings"
import { ApiSettings } from "@/components/admin/settings/api-settings"
import { ContentSettings } from "@/components/admin/settings/content-settings"
import { BrandingSettings } from "@/components/admin/settings/branding-settings"
import { ContactFormSettings } from "@/components/admin/settings/contact-form-settings"

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general")

  return (
    <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="relative overflow-auto pb-2">
        <TabsList className="flex flex-wrap w-full h-auto">
          <TabsTrigger value="general" className="flex-grow">
            General
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex-grow">
            Branding
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex-grow">
            Contact
          </TabsTrigger>
          <TabsTrigger value="content" className="flex-grow">
            Content
          </TabsTrigger>
          <TabsTrigger value="contact-form" className="flex-grow">
            Forms
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-grow">
            Security
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex-grow">
            Payment
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-grow">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="api" className="flex-grow">
            API
          </TabsTrigger>
        </TabsList>
      </div>
      <div className="mt-4 w-full">
        <TabsContent value="general" className="w-full">
          <GeneralSettings />
        </TabsContent>
        <TabsContent value="branding" className="w-full">
          <BrandingSettings />
        </TabsContent>
        <TabsContent value="contact" className="w-full">
          <ContactSettings />
        </TabsContent>
        <TabsContent value="content" className="w-full">
          <ContentSettings />
        </TabsContent>
        <TabsContent value="contact-form" className="w-full">
          <ContactFormSettings />
        </TabsContent>
        <TabsContent value="security" className="w-full">
          <SecuritySettings />
        </TabsContent>
        <TabsContent value="payment" className="w-full">
          <PaymentSettings />
        </TabsContent>
        <TabsContent value="notifications" className="w-full">
          <NotificationSettings />
        </TabsContent>
        <TabsContent value="api" className="w-full">
          <ApiSettings />
        </TabsContent>
      </div>
    </Tabs>
  )
}
