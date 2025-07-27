"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getSupabaseClient } from "@/lib/supabase/client"

const formSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  phone_number: z.string().optional(),
  role: z.string(),
  loyalty_points: z.coerce.number().int().nonnegative(),
})

type FormData = z.infer<typeof formSchema>

export default function UserCreateForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      phone_number: "",
      role: "customer",
      loyalty_points: 0,
    },
  })

  const role = watch("role")

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
          },
        },
      })

      if (authError) throw new Error(authError.message)

      if (!authData.user) {
        throw new Error("Failed to create user account")
      }

      // Then, create the user profile in the users table
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone_number || null,
        role: data.role,
        loyalty_points: data.loyalty_points,
      })

      if (profileError) throw new Error(profileError.message)

      toast({
        title: "User created",
        description: `${data.full_name} has been created successfully.`,
      })

      // Redirect back to users list
      router.push("/admin/users")
      router.refresh()
    } catch (error: any) {
      console.error("Error creating user:", error)
      setError(error.message || "Failed to create user. Please try again.")
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
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
        <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create User
        </Button>
      </div>
    </form>
  )
}
