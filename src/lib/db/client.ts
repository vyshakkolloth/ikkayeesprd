import { MongoClient, MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
// Connection options tuned for production stability and reduced latency.
// Values can be overridden via environment variables.
const options: MongoClientOptions = {
  // Number of connections in the pool (default 10). Adjust based on load.
  maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE) || 10,
  // How long the driver will try selecting a server before erroring out.
  serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 30000,
  // Socket inactivity timeout – closes idle sockets after this period.
  socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS) || 30000,
  // Timeout for establishing initial TCP connection.
  connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS) || 30000,
  // Enable retryable writes for transient network errors.
  retryWrites: true,
  // Enable retryable reads.
  retryReads: true,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

async function connectWithRetry(mongoClient: MongoClient, retries = 3, delay = 2000): Promise<MongoClient> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Connecting to MongoDB (Attempt ${attempt}/${retries})...`);
      await mongoClient.connect();
      console.log("Connected to MongoDB successfully.");
      return mongoClient;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, err);
      if (attempt === retries) {
        throw err;
      }
      console.log(`Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Failed to connect after all retries");
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable to preserve connection across hot reloads
  if (!globalThis._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalThis._mongoClientPromise = connectWithRetry(client, 3, 2000);
  }
  clientPromise = globalThis._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri, options);
  clientPromise = connectWithRetry(client, 3, 2000);
}

export default clientPromise;

/**
 * Helper to get the database instance directly
 */
export async function getDb() {
  const conn = await clientPromise;
  return conn.db(process.env.MONGODB_DB || "ikkayes_db");
}

