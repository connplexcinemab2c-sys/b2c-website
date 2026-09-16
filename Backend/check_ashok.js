import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
dotenv.config();

const MONGO_URL = process.env.MONGO_URL || "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function check() {
  try {
    await mongoose.connect(MONGO_URL);
    const db = mongoose.connection.db;

    const ashok = await db.collection("admins").findOne({ email: "ashok.parmar@theconnplex.com" });
    console.log("Ashok account found:", ashok ? "YES" : "NO");
    if (ashok) {
      console.log("Current fields:", {
        _id: ashok._id,
        name: ashok.name,
        email: ashok.email,
        type: ashok.type,
        isAdmin: ashok.isAdmin,
        roleId: ashok.roleId,
        isActive: ashok.isActive,
        isVerified: ashok.isVerified,
        deletedStatus: ashok.deletedStatus
      });

      const match = await bcrypt.compare("Admin@1234", ashok.password);
      console.log("Does 'Admin@1234' match current hash?", match);

      const role = await db.collection("roles").findOne({ _id: ashok.roleId });
      console.log("Current assigned role:", role?.role);
      console.log("Role permissions count:", role?.permissions?.length);
      console.log("Includes 'ecommerce_view'?:", role?.permissions?.includes("ecommerce_view"));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

check();
