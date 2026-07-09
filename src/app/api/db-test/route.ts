import { NextResponse } from "next/server";
import clientPromise, { getDb } from "@/lib/db/client";

export async function GET() {
  try {
    const start = Date.now();
    
    // Trigger connection
    const client = await clientPromise;
    const db = await getDb();
    
    // List existing collections to verify query ability
    const collections = await db.listCollections().toArray();
    const duration = Date.now() - start;

    return NextResponse.json({
      status: "connected",
      database: db.databaseName,
      collections: collections.map(col => col.name),
      latencyMs: duration,
      hosts: client.options.hosts,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to connect to MongoDB",
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
