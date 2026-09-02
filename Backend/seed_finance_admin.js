import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
dotenv.config();

const MONGO_URL =
  process.env.MONGO_URL ||
  "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

export const FINANCE_PERMISSIONS = [
  "dashboard_view",
  "transaction_view",
  "total_revenue_dashboard_card_view",
  "ecommerce_revenue_dashboard_card_view",
  "ticket_revenue_dashboard_card_view",
  "ticket_transactions_dashboard_card_view",
  "membership_transactions_dashboard_card_view",
  "transactions_dashboard_card_view",
  "failed_transactions_dashboard_card_view",
];

export async function seedFinanceAdmin() {
  let shouldClose = false;
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("Connecting to MongoDB...");
      await mongoose.connect(MONGO_URL);
      shouldClose = true;
    }
    const db = mongoose.connection.db;

    // 1. Ensure Finance Role exists with only finance permissions
    let role = await db.collection("roles").findOne({ role: "Finance Admin" });
    if (!role) {
      const insertResult = await db.collection("roles").insertOne({
        role: "Finance Admin",
        isActive: true,
        deleteStatus: 0,
        permissions: FINANCE_PERMISSIONS,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      role = { _id: insertResult.insertedId, role: "Finance Admin" };
      console.log("Created Finance Admin role:", role._id);
    } else {
      await db.collection("roles").updateOne(
        { _id: role._id },
        {
          $set: {
            permissions: FINANCE_PERMISSIONS,
            isActive: true,
            deleteStatus: 0,
            updatedAt: new Date(),
          },
        }
      );
      console.log("Updated Finance Admin role permissions:", role._id);
    }

    // 2. Ensure Finance Admin exists with requested credentials
    const email = "finance@theconnplex.com";
    const rawPassword = "Finance@123";
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(rawPassword, salt);
    const mobileNumber = 9909049481;

    let admin = await db.collection("admins").findOne({ email, deletedStatus: 0 });
    if (!admin) {
      const insertResult = await db.collection("admins").insertOne({
        name: "Finance Admin",
        email: email,
        password: hashPassword,
        mobileNumber: mobileNumber,
        type: "SubAdmin",
        roleId: role._id,
        cinemaId: null,
        isActive: true,
        isVerified: true,
        isAdmin: false,
        deletedStatus: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("Created Finance Admin user:", insertResult.insertedId);
    } else {
      await db.collection("admins").updateOne(
        { _id: admin._id },
        {
          $set: {
            name: "Finance Admin",
            mobileNumber: mobileNumber,
            password: hashPassword,
            roleId: role._id,
            type: "SubAdmin",
            isActive: true,
            isVerified: true,
            deletedStatus: 0,
            updatedAt: new Date(),
          },
        }
      );
      console.log("Updated Finance Admin user credentials and role:", admin._id);
    }

    console.log("Finance Admin seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding Finance Admin:", error);
    throw error;
  } finally {
    if (shouldClose) {
      await mongoose.disconnect();
    }
  }
}

if (process.argv[1]?.endsWith("seed_finance_admin.js")) {
  seedFinanceAdmin()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
