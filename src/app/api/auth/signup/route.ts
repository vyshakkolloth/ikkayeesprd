import { NextResponse } from "next/server";
import { userRepository } from "@/lib/db/repositories/user.repository";
import { createSession } from "@/lib/auth/session";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Basic fields validation
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = await userRepository.createNewUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "customer",
    });

    // Automatically create a session for the registered user
    await createSession(userId, normalizedEmail, "customer");

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
        role: "customer",
      },
    });
  } catch (error: any) {
    console.error("Signup API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
