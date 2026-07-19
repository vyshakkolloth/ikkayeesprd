const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://kolloth:jamesbond@cluster0.icgrzgz.mongodb.net/ikkayees?retryWrites=true&w=majority";

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db("ikkayees");

    const categories = await db.collection("categories").find({}).toArray();
    console.log("Categories found:", categories.length);
    categories.forEach(c => {
      console.log(`- Cat: ${c.name?.en} (Slug: ${c.slug}, ID: ${c._id})`);
    });

    const products = await db.collection("products").find({}).toArray();
    console.log("\nProducts found:", products.length);
    products.slice(0, 15).forEach(p => {
      console.log(`- Prod: ${p.name?.en} (Category ID: ${p.categoryId}, Price: ${p.price}, ChefRec: ${p.chefRecommended}, TopPick: ${p.topPick}, Tags: ${JSON.stringify(p.tags)})`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
