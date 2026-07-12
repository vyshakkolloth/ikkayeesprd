import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const db = await getDb();
    const usersCollection = db.collection("users");

    const email = "ikkayees@gmail.com".toLowerCase();
    const password = "ikkatey@123";
    const role = "super admin";

    const passwordHash = await bcrypt.hash(password, 10);

    const existingUser = await usersCollection.findOne({ email });

    let message = "";
    if (existingUser) {
      await usersCollection.updateOne(
        { _id: existingUser._id },
        {
          $set: {
            passwordHash,
            role,
            name: "Super Admin",
            updatedAt: new Date()
          }
        }
      );
      message = `Updated existing user ${email} with role '${role}' and reset password.`;
    } else {
      await usersCollection.insertOne({
        name: "Super Admin",
        email,
        passwordHash,
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      message = `Created new user ${email} with role '${role}'.`;
    }

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
