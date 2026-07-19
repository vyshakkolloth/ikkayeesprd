import { NextResponse } from "next/server"
import { userRepository } from "@/lib/db/repositories/user.repository"
import { ObjectId } from "mongodb"
import bcrypt from "bcrypt"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { password } = await request.json()
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }
    const hash = await bcrypt.hash(password, 10)
    const success = await userRepository.updateOne({ _id: new ObjectId(id) }, { passwordHash: hash })
    if (!success) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`PUT /api/admin/users/${"${id}"}/password error:`, error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
