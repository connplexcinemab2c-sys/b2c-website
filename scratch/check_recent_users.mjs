import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: 'Backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URL);
  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
  const users = await mongoose.connection.db.collection('users')
    .find({ updatedAt: { $gte: fiveMinsAgo } })
    .sort({ updatedAt: -1 })
    .toArray();
  
  console.log("Users in last 5 mins:", JSON.stringify(users.map(u => ({
    id: u._id,
    mobile: u.mobileNumber,
    email: u.email,
    otp: u.otp,
    registeredFrom: u.registeredFrom,
    updatedAt: u.updatedAt
  })), null, 2));

  process.exit(0);
}
check().catch(console.error);
