import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: 'Backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URL);
  const users = await mongoose.connection.db.collection('users')
    .find({ otp: { $ne: null } })
    .sort({ updatedAt: -1 })
    .limit(5)
    .toArray();
  
  console.log("Recent OTPs in DB:", JSON.stringify(users.map(u => ({
    id: u._id,
    name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
    mobileNumber: u.mobileNumber,
    email: u.email,
    otp: u.otp,
    otpExpiryDate: u.otpExpiryDate,
    updatedAt: u.updatedAt
  })), null, 2));

  process.exit(0);
}
check().catch(console.error);
