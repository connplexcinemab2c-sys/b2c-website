import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
dotenv.config();

const MONGO_URL =
  process.env.MONGO_URL ||
  "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

export async function seedMktgSocialAdmin() {
  let shouldClose = false;
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("Connecting to MongoDB...");
      await mongoose.connect(MONGO_URL);
      shouldClose = true;
    }
    const db = mongoose.connection.db;

    const email = "mktg.social@theconnplex.com";
    const rawPassword = "Cinema@123";
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(rawPassword, salt);

    // 1. Fetch reference Jahnvi Gupta account
    const jahnvi = await db.collection("admins").findOne({ email: "guptajahnvi47@gmail.com" });
    if (!jahnvi) {
      throw new Error("Reference account guptajahnvi47@gmail.com not found!");
    }

    console.log("Found reference Jahnvi account:", {
      email: jahnvi.email,
      type: jahnvi.type,
      isAdmin: jahnvi.isAdmin,
      roleId: jahnvi.roleId,
      cinemaId: jahnvi.cinemaId,
    });

    // 2. Find target admin account (active)
    let admin = await db.collection("admins").findOne({ email, deletedStatus: 0 });

    const updateFields = {
      password: hashPassword,
      type: jahnvi.type, // "Admin"
      isAdmin: jahnvi.isAdmin, // true
      roleId: jahnvi.roleId, // ObjectId("64e84eb13239eacf700eb51f")
      cinemaId: null,
      isActive: true,
      isVerified: true,
      deletedStatus: 0,
      updatedAt: new Date(),
    };

    if (!admin) {
      const insertResult = await db.collection("admins").insertOne({
        name: "Cinema Admin",
        email: email,
        mobileNumber: 9327036970,
        image: "false",
        createdAt: new Date(),
        ...updateFields,
      });
      console.log("Created mktg.social admin user:", insertResult.insertedId);
    } else {
      await db.collection("admins").updateOne(
        { _id: admin._id },
        {
          $set: updateFields,
        }
      );
      console.log("Updated mktg.social admin user access and password:", admin._id);
    }

    // Verify the record
    const updated = await db.collection("admins").findOne({ email, deletedStatus: 0 });
    const isPasswordValid = await bcrypt.compare(rawPassword, updated.password);
    console.log("\n--- Verification Result ---");
    console.log({
      _id: updated._id,
      email: updated.email,
      type: updated.type,
      isAdmin: updated.isAdmin,
      roleId: updated.roleId,
      isActive: updated.isActive,
      isVerified: updated.isVerified,
      passwordMatches: isPasswordValid,
    });

    console.log("\nmktg.social admin access grant completed successfully!");
  } catch (error) {
    console.error("Error seeding mktg.social admin:", error);
    throw error;
  } finally {
    if (shouldClose) {
      await mongoose.disconnect();
    }
  }
}

if (process.argv[1]?.endsWith("seed_mktg_social_admin.js")) {
  seedMktgSocialAdmin()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
