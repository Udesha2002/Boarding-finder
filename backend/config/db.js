const mongoose = require("mongoose");
const dns = require("dns");

// Configure reliable public DNS servers (Google + Cloudflare) to resolve MongoDB Atlas SRV records reliably
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"]);
} catch (err) {
  console.warn("DNS server setup notice:", err.message);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("✕ MongoDB connection error:", error.message);

    // Provide friendly guidance if Atlas IP whitelist is blocking the connection
    if (
      error.message.includes("whitelist") ||
      error.message.includes("SSL alert number 80") ||
      error.message.includes("Could not connect to any servers") ||
      error.message.includes("querySrv ECONNREFUSED")
    ) {
      console.warn("\n=======================================================");
      console.warn("📌 MONGODB ATLAS NETWORK ACCESS NOTICE");
      console.warn("To allow connections from your current internet connection:");
      console.warn("1. Log in to cloud.mongodb.com");
      console.warn("2. Go to 'Security' -> 'Network Access'");
      console.warn("3. Click 'Add IP Address' -> Select 'Allow Access from Anywhere' (0.0.0.0/0)");
      console.warn("4. Click 'Confirm'");
      console.warn("=======================================================\n");
    }

    // Do not crash server process immediately so health/status APIs remain responsive
    // Instead retry periodically
    setTimeout(() => {
      console.log("Attempting to reconnect to MongoDB Atlas...");
      connectDB().catch(() => { });
    }, 10000);
  }
};

module.exports = connectDB;
