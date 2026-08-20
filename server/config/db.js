const mongoose = require("mongoose");

const connectDB = async () => {
    const dbUrl = process.env.ATLAS_DB_URL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wanderlust";

    try {
        const conn = await mongoose.connect(dbUrl);
        console.log(`[MongoDB] Connected: ${conn.connection.host}`);
        return conn;
    } catch (err) {
        console.error("[MongoDB] Connection failed:", err);
        process.exit(1);
    }
};

module.exports = connectDB;
