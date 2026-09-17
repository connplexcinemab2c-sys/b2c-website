const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUrl =
      process.env.MONGO_URL ||
      "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(
      `[Ecommerce DB] Connected to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`
    );
  } catch (error) {
    console.error("[Ecommerce DB] MongoDB connection error:", error.message);
    console.log("[Ecommerce DB] Will retry connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
