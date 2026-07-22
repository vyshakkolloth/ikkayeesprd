const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value.trim();
      }
    });
  }
}

loadEnv();

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db("ikkayees");

    console.log("=== Checking Categories Image URLs ===");
    const categories = await db.collection("categories").find({}).toArray();
    categories.forEach(c => {
      console.log(`- Category [${c.name?.en || c.slug}]: ${c.image}`);
    });

    console.log("\n=== Checking Products Image URLs ===");
    const products = await db.collection("products").find({}).toArray();
    products.forEach(p => {
      console.log(`- Product [${p.name?.en || p.slug}]: ${p.image}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
