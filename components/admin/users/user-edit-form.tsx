"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface User {
  id: string
  full_name: string
  email: string
  phone_number: string | null
  role: string
  loyalty_points: number
}

const formSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone_number: z.string().optional().nullable(),
  role: z.string(),
  loyalty_points: z.coerce.number().int().nonnegative(),
})

type FormData = z.infer<typeof formSchema>

export default function UserEditForm({ user }: { user: User }) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      loyalty_points: user.loyalty_points,
    },
  })

  const role = watch("role")

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      // Update user in database
      const { error } = await supabase
        .from("users")
        .update({
          full_name: data.full_name,
          email: data.email,
          phone_number: data.phone_number,
          role: data.role,
          loyalty_points: data.loyalty_points,
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "User updated",
        description: `${data.full_name}'s information has been updated successfully.`,
      })

      // Redirect back to user details
      router.push(`/admin/users/${user.id}`)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input id="full_name" {...register("full_name")} />
          {errors.full_name && <p className="text-sm text-red-500">{errors.full_name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input id="phone_number" {...register("phone_number")} />
          {errors.phone_number && <p className="text-sm text-red-500">{errors.phone_number.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={(value) => setValue("role", value)}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="loyalty_points">Loyalty Points</Label>
          <Input id="loyalty_points" type="number" {...register("loyalty_points")} />
          {errors.loyalty_points && <p className="text-sm text-red-500">{errors.loyalty_points.message}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.push(`/admin/users/${user.id}`)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>
    </form>
  )
}
