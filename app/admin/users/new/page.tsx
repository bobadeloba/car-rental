import { Breadcrumbs } from "@/components/admin/shared/breadcrumbs"
import UserCreateForm from "@/components/admin/users/user-create-form"

export const metadata = {
  title: "Create New User | Admin Dashboard",
  description: "Create a new user in the Kings Rental Cars admin dashboard",
}

export default function CreateUserPage() {
  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: "Users Management", href: "/admin/users" }, { label: "Create New User" }]} />

      <div>
        <h1 className="text-3xl font-bold mb-2">Create New User</h1>
        <p className="text-gray-600 dark:text-gray-400">Add a new user to the platform</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <UserCreateForm />
      </div>
    </div>
  )
}
