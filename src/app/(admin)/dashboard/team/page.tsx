import { userRepository } from "@/lib/db/repositories/user.repository"
import { UsersTable, type User } from "./components/users-table"

export const revalidate = 0

export default async function TeamPage() {
    let users: User[] = []
    try {
        const dbUsers = await userRepository.find({})
        users = dbUsers.map((u: any) => ({
            _id: u._id?.toString() || "",
            name: u.name || "",
            email: u.email || "",
            role: u.role || "",
            isActive: !!u.isActive,
            updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : u.updatedAt || "",
        }))
    } catch (e) {
        console.error("Failed to fetch users in TeamPage:", e)
    }

    return (
        <div className="py-6 space-y-6">
            <div className="flex flex-col gap-1 border-b pb-4">
                <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
                <p className="text-muted-foreground text-sm">
                    Manage team members, update system roles, and change account passwords.
                </p>
            </div>
            <UsersTable initialData={users} />
        </div>
    )
}