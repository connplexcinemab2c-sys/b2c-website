import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Razorpay from '../Backend/node_modules/razorpay/dist/razorpay.js';
import path from 'path';

// Load env from Backend/.env or current env
dotenv.config({ path: path.resolve('Backend/.env') });

const isDryRun = process.argv.includes('--dry-run');

async function run() {
  console.log('========================================================================');
  console.log(`CONNPLEX REFUND PROCESSOR - NOV 01, 2026 STATUS 4 TRANSACTIONS`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN (No live API calls)' : 'LIVE EXECUTION (Will refund on Razorpay)'}`);
  console.log('========================================================================\n');

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId.includes('dummy')) {
    console.warn('[WARNING] Real Razorpay credentials not found in local .env.');
    if (!isDryRun) {
      console.error('[ERROR] Cannot run live refunds without valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
      console.log('Run this script on the production server or provide credentials.');
      process.exit(1);
    }
  }

  const razorpay = new Razorpay({
    key_id: keyId || 'dummy_id',
    key_secret: keySecret || 'dummy_secret'
  });

  const mongoUrl = process.env.MONGO_URL || 'mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin';
  await mongoose.connect(mongoUrl);
  const db = mongoose.connection.db;

  const start = new Date('2026-11-01T00:00:00.000+05:30');
  const end = new Date('2026-11-01T23:59:59.999+05:30');

  const s4Txs = await db.collection('transactions').find({
    status: 4,
    createdAt: { $gte: start, $lte: end }
  }).sort({ createdAt: 1 }).toArray();

  console.log(`Found ${s4Txs.length} Status 4 transactions to process.\n`);

  let successCount = 0;
  let failCount = 0;
  let totalAmount = 0;

  for (const tx of s4Txs) {
    const paymentId = tx.paymentResponse?.razorpay_payment_id || tx.paymentResponse?.id;
    const amount = Number(tx.finalBookingCalculation?.finalAmount) || Number(tx.paymentResponse?.amount) || 0;
    const amountPaise = Math.round(amount * 100);

    totalAmount += amount;

    console.log(`TX: ${tx.initTransId} | PaymentId: ${paymentId} | Amount: ₹${amount}`);

    if (!paymentId) {
      console.error(`  -> SKIPPED: No paymentId on transaction ${tx.initTransId}`);
      failCount++;
      continue;
    }

    if (isDryRun) {
      console.log(`  -> [DRY RUN] Would refund ₹${amount} to ${paymentId}`);
      successCount++;
      continue;
    }

    try {
      const refund = await razorpay.payments.refund(paymentId, {
        amount: amountPaise,
        notes: {
          transId: tx.initTransId,
          reason: '3D Glasses Vista Commit Underpayment Failure'
        }
      });

      console.log(`  -> SUCCESS: Refund ID ${refund.id} created.`);

      await db.collection('transactions').updateOne(
        { initTransId: tx.initTransId },
        {
          $set: {
            status: 3, // Refunded
            refundStatus: true,
            refundResponse: refund,
            refundId: refund.id,
            refundAmount: amount,
            updatedAt: new Date()
          },
          $push: { logs: { ticketRefunded: new Date() } }
        }
      );

      successCount++;
    } catch (err) {
      console.error(`  -> FAILED: ${err.message}`);
      failCount++;
    }
  }

  console.log('\n========================================================================');
  console.log(`REFUND SUMMARY:`);
  console.log(`  Total Processed: ${s4Txs.length}`);
  console.log(`  Successful: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`  Total Value: ₹${totalAmount.toFixed(2)}`);
  console.log('========================================================================\n');

  await mongoose.disconnect();
}

run();
