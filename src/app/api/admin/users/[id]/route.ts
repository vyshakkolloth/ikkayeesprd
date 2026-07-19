import { NextResponse } from "next/server"
import { userRepository } from "@/lib/db/repositories/user.repository"
import { ObjectId } from "mongodb"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { role, isActive } = await request.json()
    const update: Partial<any> = {}
    if (typeof role !== "undefined") update.role = role
    if (typeof isActive !== "undefined") update.isActive = isActive
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }
    const success = await userRepository.updateOne({ _id: new ObjectId(id) }, update)
    if (!success) {
      return NextResponse.json({ error: "User not found or not modified" }, { status: 404 })
    }
    const fresh = await userRepository.findOne({ _id: new ObjectId(id) })
    if (!fresh) return NextResponse.json({ error: "User not found after update" }, { status: 404 })
    const safe = {
      _id: fresh._id?.toString(),
      name: fresh.name,
      email: fresh.email,
      role: fresh.role,
      isActive: (fresh as any).isActive,
      updatedAt: fresh.updatedAt instanceof Date ? fresh.updatedAt.toISOString() : fresh.updatedAt,
    }
    return NextResponse.json(safe)
  } catch (error: any) {
    console.error(`PATCH /api/admin/users/${"${id}"} error:`, error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
