import { NextResponse } from "next/server"
import { userRepository } from "@/lib/db/repositories/user.repository"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const users = await userRepository.find({})
    // Strip passwordHash before sending to client
    const safe = users.map((u: any) => ({
      _id: u._id?.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : u.updatedAt,
    }))
    return NextResponse.json({ users: safe })
  } catch (error: any) {
    console.error("GET /api/admin/users error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
