import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 15000,  // 15s to find a server
  socketTimeoutMS: 45000,           // 45s socket idle timeout
  connectTimeoutMS: 15000,          // 15s to establish connection
  maxPoolSize: 10,                  // keep up to 10 connections open
  heartbeatFrequencyMS: 5000,       // check server health every 5s
  retryWrites: true,
  retryReads: true,
};

export const dbConnection = () => {
  const connect = () => {
    mongoose
      .connect(process.env.MONGO_URL, MONGO_OPTIONS)
      .then(() => {
        const db = mongoose.connection.db;
        if (db) {
          console.log("connected to database.", db.databaseName);
          console.log("connected to database URL.", process.env.MONGO_URL);
        } else {
          console.log("MongoDB connected (db reference pending).");
        }
      })
      .catch((e) => {
        console.error("MongoDB connection failed:", e.message);
        console.log("Retrying connection in 5 seconds...");
        setTimeout(connect, 5000);
      });
  };

  connect();

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Attempting to reconnect...");
    setTimeout(connect, 5000);
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected successfully.");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connection established.");
  });
};
