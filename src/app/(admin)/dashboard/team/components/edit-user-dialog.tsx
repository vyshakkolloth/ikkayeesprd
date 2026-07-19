"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react"

export type User = {
  _id: string
  name: string
  email: string
  role: string
  isActive: boolean
  updatedAt: string
}

interface Props {
  user: User
  onClose: () => void
  onSuccess: (updated: User) => void
}

export function EditUserDialog({ user, onClose, onSuccess }: Props) {
  const [password, setPassword] = useState("")
  const [role, setRole] = useState(user.role)
  const [active, setActive] = useState(user.isActive)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      // Password change (if provided)
      if (password) {
        const resPwd = await fetch(`/api/admin/users/${user._id}/password`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
          credentials: "include",
        })
        if (!resPwd.ok) throw new Error("Password update failed")
      }

      // Role / active update
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, isActive: active }),
        credentials: "include",
      })
      if (!res.ok) throw new Error("User update failed")
      const updated = (await res.json()) as User
      onSuccess(updated)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Member: {user.name}</DialogTitle>
          <DialogDescription>
            Update password credentials, system role permissions, or status settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              New Password
            </label>
            <Input
              type="password"
              placeholder="Leave empty to keep current"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Role Permission
            </label>
            <Select value={role} onValueChange={(v) => setRole(v ?? "")}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="waiter">Waiter</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between border rounded-xl p-3 bg-muted/20">
            <div className="space-y-0.5">
              <label htmlFor="active" className="text-sm font-semibold text-foreground">
                Active Status
              </label>
              <p className="text-xs text-muted-foreground">
                Enable or restrict portal access for this user
              </p>
            </div>
            <Switch id="active" checked={active} onCheckedChange={setActive} />
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2Icon className="size-3.5 mr-1.5 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

