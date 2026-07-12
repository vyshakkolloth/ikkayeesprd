const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

// Simple parser for .env.local
const envPath = path.resolve(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const parts = trimmed.split("=");
      const key = parts[0].trim();
      let value = parts.slice(1).join("=").trim();
      // Strip outer quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Error: MONGODB_URI not found in environment or .env.local");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected successfully to database server.");

    const dbName = process.env.MONGODB_DB || "ikkayes_db";
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    const email = "ikkayees@gmail.com".toLowerCase();
    const password = "ikkatey@123";
    const role = "super admin";

    console.log("Hashing password...");
    const passwordHash = await bcrypt.hash(password, 10);

    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      console.log(`User ${email} already exists. Updating role to '${role}' and resetting password...`);
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
      console.log("Super Admin user updated successfully.");
    } else {
      console.log(`Creating new user ${email} with role '${role}'...`);
      await usersCollection.insertOne({
        name: "Super Admin",
        email,
        passwordHash,
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log("Super Admin user created successfully.");
    }
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await client.close();
    console.log("Database connection closed.");
  }
}

main();
