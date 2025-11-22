import mongoose from "mongoose";

/**
 * ============================================
 * CONNECT TO MONGODB DATABASE
 * ============================================
 * This function establishes a connection to MongoDB
 * It's async because connecting to database takes time
 */
const connectDB = async () => {
  try {
    // ============================================
    // CONNECTION OPTIONS (Updated for Mongoose 6+)
    // ============================================
    // Modern Mongoose versions don't need most options as they're default
    // Only include options that are actually needed
    const options = {
      // Maximum number of connections in the pool
      maxPoolSize: 10,

      // Timeout for server selection (30 seconds)
      serverSelectionTimeoutMS: 30000,

      // Timeout for socket operations (45 seconds)
      socketTimeoutMS: 45000,
    };

    // ============================================
    // ESTABLISH CONNECTION
    // ============================================
    // Connect to MongoDB using the URI from .env file
    // Modern Mongoose (v6+) handles connection options automatically
    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    // ============================================
    // CONNECTION SUCCESS
    // ============================================
    console.log(`
    ════════════════════════════════════════════════════════════
      ✅ MongoDB Connected Successfully                        
    
      Host: ${conn.connection.host.padEnd(33)}
      Port: ${conn.connection.port.toString().padEnd(33)}
      DB:   ${conn.connection.name.padEnd(33)}
    ════════════════════════════════════════════════════════════
    `);

    // ============================================
    // MONGOOSE EVENT LISTENERS
    // ============================================
    // These listeners help monitor the database connection status

    // When connected
    mongoose.connection.on("connected", () => {
      console.log("🔗 Mongoose connected to MongoDB");
    });

    // When disconnected
    mongoose.connection.on("disconnected", () => {
      console.log("⚠️  Mongoose disconnected from MongoDB");
    });

    // When connection error occurs
    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongoose connection error:", err.message);
    });

    // When reconnected
    mongoose.connection.on("reconnected", () => {
      console.log("🔄 Mongoose reconnected to MongoDB");
    });
  } catch (error) {
    // ============================================
    // CONNECTION FAILURE
    // ============================================
    console.error("❌ MongoDB Connection Failed:");
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);

    // Exit process with failure code
    // In production, you might want to retry connection instead
    process.exit(1);
  }
};

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
/**
 * Close database connection gracefully when app shuts down
 * This ensures all operations complete before closing
 */
const closeDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed successfully");
  } catch (error) {
    console.error("❌ Error closing MongoDB connection:", error.message);
  }
};

// Listen for app termination signals
process.on("SIGINT", async () => {
  await closeDatabase();
  process.exit(0);
});

// Export the connection function
export default connectDB;

/**
 * ============================================
 * TROUBLESHOOTING COMMON ERRORS:
 * ============================================
 *
 * 1. "MongooseServerSelectionError: connect ECONNREFUSED"
 *    - MongoDB is not running. Start it with: mongod
 *    - Or check if MONGO_URI in .env is correct
 *
 * 2. "MongooseServerSelectionError: Authentication failed"
 *    - Wrong username or password in MONGO_URI
 *    - Check MongoDB Atlas credentials
 *
 * 3. "MongooseServerSelectionError: connection timed out"
 *    - MongoDB Atlas: Add your IP address to whitelist
 *    - Check firewall settings
 *
 * 4. "Error: querySrv ENOTFOUND"
 *    - Wrong connection string format
 *    - Check MONGO_URI in .env file
 *
 * ============================================
 * LOCAL vs CLOUD MONGODB:
 * ============================================
 *
 * LOCAL (Development):
 * MONGO_URI=mongodb://localhost:27017/pos_inventory
 *
 * CLOUD - MongoDB Atlas (Production):
 * MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pos_inventory
 *
 * ============================================
 * USEFUL MONGOOSE METHODS:
 * ============================================
 *
 * Check connection status:
 *   mongoose.connection.readyState
 *   0 = disconnected
 *   1 = connected
 *   2 = connecting
 *   3 = disconnecting
 *
 * Get database name:
 *   mongoose.connection.db.databaseName
 *
 * List collections:
 *   mongoose.connection.db.listCollections()
 */
