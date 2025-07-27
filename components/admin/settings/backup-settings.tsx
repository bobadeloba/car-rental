"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Upload } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

const backupSettingsSchema = z.object({
  enable_auto_backup: z.boolean().default(false),
  backup_frequency: z.string().min(1, {
    message: "Please select a backup frequency.",
  }),
  backup_retention_days: z.coerce.number().int().min(1).max(365).default(30),
  backup_storage_location: z.string().min(1, {
    message: "Please select a storage location.",
  }),
  s3_bucket_name: z.string().optional(),
  s3_access_key: z.string().optional(),
  s3_secret_key: z.string().optional(),
  s3_region: z.string().optional(),
})

type BackupSettingsValues = z.infer<typeof backupSettingsSchema>

interface BackupSettingsProps {
  settings: any
  onSave: (values: BackupSettingsValues) => void
  isLoading: boolean
}

export function BackupSettings({ settings, onSave, isLoading }: BackupSettingsProps) {
  const [backupInProgress, setBackupInProgress] = useState(false)
  const [restoreInProgress, setRestoreInProgress] = useState(false)

  const form = useForm<BackupSettingsValues>({
    resolver: zodResolver(backupSettingsSchema),
    defaultValues: {
      enable_auto_backup: settings?.enable_auto_backup ?? false,
      backup_frequency: settings?.backup_frequency || "daily",
      backup_retention_days: settings?.backup_retention_days || 30,
      backup_storage_location: settings?.backup_storage_location || "local",
      s3_bucket_name: settings?.s3_bucket_name || "",
      s3_access_key: settings?.s3_access_key || "",
      s3_secret_key: settings?.s3_secret_key || "",
      s3_region: settings?.s3_region || "",
    },
  })

  function onSubmit(values: BackupSettingsValues) {
    onSave(values)
  }

  const triggerManualBackup = async () => {
    setBackupInProgress(true)
    try {
      // This would be replaced with actual backup logic
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Backup Completed",
        description: "Database backup has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "There was an error creating the backup.",
        variant: "destructive",
      })
    } finally {
      setBackupInProgress(false)
    }
  }

  const triggerManualRestore = async () => {
    setRestoreInProgress(true)
    try {
      // This would be replaced with actual restore logic
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Restore Completed",
        description: "Database has been restored successfully.",
      })
    } catch (error) {
      toast({
        title: "Restore Failed",
        description: "There was an error restoring the database.",
        variant: "destructive",
      })
    } finally {
      setRestoreInProgress(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="enable_auto_backup"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Automatic Backups</FormLabel>
                <FormDescription>Enable scheduled automatic backups of your database.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="backup_frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Backup Frequency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select backup frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>How often automatic backups should run.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="backup_retention_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Backup Retention (days)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="365" {...field} />
                </FormControl>
                <FormDescription>Number of days to keep backups before deletion.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="backup_storage_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Storage Location</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select storage location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="local">Local Storage</SelectItem>
                    <SelectItem value="s3">Amazon S3</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Where to store backup files.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {form.watch("backup_storage_location") === "s3" && (
          <div className="space-y-6 border rounded-lg p-4">
            <h3 className="text-lg font-medium">Amazon S3 Configuration</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="s3_bucket_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>S3 Bucket Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="s3_region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>S3 Region</FormLabel>
                    <FormControl>
                      <Input placeholder="us-east-1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="s3_access_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>S3 Access Key</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="s3_secret_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>S3 Secret Key</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Backup Settings"}
          </Button>

          <Button type="button" variant="outline" onClick={triggerManualBackup} disabled={backupInProgress}>
            <Download className="mr-2 h-4 w-4" />
            {backupInProgress ? "Backing Up..." : "Manual Backup"}
          </Button>

          <Button type="button" variant="outline" onClick={triggerManualRestore} disabled={restoreInProgress}>
            <Upload className="mr-2 h-4 w-4" />
            {restoreInProgress ? "Restoring..." : "Restore Backup"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
