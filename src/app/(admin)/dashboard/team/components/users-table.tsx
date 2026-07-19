"use client"

import { useState } from "react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { EditUserDialog } from "./edit-user-dialog"
import { toast } from "sonner"
import { 
  SearchIcon, 
  Edit2Icon, 
  Loader2Icon, 
  CalendarIcon, 
  UsersIcon, 
  ShieldAlertIcon, 
  ShieldCheckIcon, 
  UserIcon, 
  CoffeeIcon
} from "lucide-react"

export type User = {
  _id: string
  name: string
  email: string
  role: string
  isActive: boolean
  updatedAt: string
}

export function UsersTable({ initialData }: { initialData: User[] }) {
  const [users, setUsers] = useState<User[]>(initialData)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  
  // Search & Filter state
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const [isUpdating, setIsUpdating] = useState(false)

  const toggleActive = async (user: User) => {
    const previousUsers = [...users]
    
    // Optimistic UI state toggle
    setUsers((prev) =>
      prev.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u))
    )
    
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to update status")
      const updated = await res.json() as User
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)))
      toast.success("User status updated")
    } catch (e) {
      toast.error((e as Error).message)
      // Revert state
      setUsers(previousUsers)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEditSuccess = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)))
    setEditingUser(null)
    toast.success("User saved successfully")
  }

  // Client-side filtering logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive)

    return matchesSearch && matchesRole && matchesStatus
  })

  // Render role badge with appropriate styling
  const renderRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "super admin":
        return (
          <Badge className="bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-300 flex items-center gap-1 w-fit">
            <ShieldAlertIcon className="size-3" />
            Super Admin
          </Badge>
        )
      case "admin":
        return (
          <Badge className="bg-indigo-500/10 text-indigo-700 hover:bg-indigo-500/20 border-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-300 flex items-center gap-1 w-fit">
            <ShieldCheckIcon className="size-3" />
            Admin
          </Badge>
        )
      case "waiter":
        return (
          <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-300 flex items-center gap-1 w-fit">
            <CoffeeIcon className="size-3" />
            Waiter
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1 w-fit">
            <UserIcon className="size-3 text-muted-foreground" />
            {role}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* 1. Filtering toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search team members by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={(val) => val && setRoleFilter(val)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="waiter">Waiter</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 2. Loading state indicators */}
      {isUpdating && (
        <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 p-2.5 rounded-lg animate-pulse w-fit">
          <Loader2Icon className="size-3.5 animate-spin" /> Saving status changes...
        </div>
      )}

      {/* 3. Team Table Grid */}
      <div className="border rounded-xl bg-card overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center bg-background/50 min-h-[300px]">
            <div className="p-4 bg-muted rounded-full text-muted-foreground mb-4">
              <UsersIcon className="size-8" />
            </div>
            <h3 className="text-lg font-bold">No team members found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              We couldn&apos;t find any users matching your selected search or filters. Try adjusting your settings.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const lastLogin = new Date(user.updatedAt).toLocaleString()
                  return (
                    <TableRow key={user._id} className="hover:bg-muted/40">
                      <TableCell className="font-semibold text-foreground">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>{renderRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="size-3.5" />
                          {lastLogin}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={() => toggleActive(user)}
                          disabled={isUpdating}
                        />
                      </TableCell>
                      <TableCell className="p-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-8"
                            onClick={() => setEditingUser(user)}
                            title="Edit Team Member"
                          >
                            <Edit2Icon className="size-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}

