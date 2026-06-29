import Movies from "../models/Movies.js";
import Price from "../models/Price.js";
import Shows from "../models/Shows.js";
import PricePackage from "../models/PricePackage.js";
import Items from "../models/Items.js";
import TodayShow from "../models/TodayShow.js";

/**
 * Ensures all critical sync fields are indexed.
 * Without these, bulkWrite performs a "Collection Scan" for every update,
 * making the sync extremely slow as the database grows.
 */
export const ensureIndexes = async () => {
  try {
    console.log("Ensuring database indexes for high-speed sync...");

    // Movies: Fast lookup by cinema + filmCode
    await Movies.collection.createIndex({ cinemaId: 1, filmCode: 1 });
    
    // Price: Fast lookup by cinema + pGroupCode
    await Price.collection.createIndex({ cinemaId: 1, pGroupCode: 1 });

    // Shows: Fast lookup by cinema + sessionId (The most important index for bulkWrite)
    await Shows.collection.createIndex({ cinemaId: 1, sessionId: 1 });
    await Shows.collection.createIndex({ cinemaId: 1, isActive: 1 });

    // PricePackage: Compound index for the unique combination used in sync
    await PricePackage.collection.createIndex({ cinemaId: 1, pPackCode: 1, pGroupCode: 1, tTypeCode: 1 });

    // Items: Fast lookup for F&B
    await Items.collection.createIndex({ cinemaId: 1, itemId: 1 });

    // TodayShow: Frequent deletes and inserts
    await TodayShow.collection.createIndex({ cinemaId: 1 });

    console.log("Database indexes verified successfully.");
  } catch (error) {
    console.error("Error creating indexes:", error);
  }
};
