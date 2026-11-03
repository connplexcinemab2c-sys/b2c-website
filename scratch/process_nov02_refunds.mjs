import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Razorpay from '../Backend/node_modules/razorpay/dist/razorpay.js';
import path from 'path';

// Load env from Backend/.env or current env
dotenv.config({ path: path.resolve('Backend/.env') });

const isDryRun = process.argv.includes('--dry-run');

async function run() {
  console.log('========================================================================');
  console.log(`CONNPLEX REFUND PROCESSOR - NOV 02, 2026 STATUS 4 TRANSACTIONS`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN (No live API calls)' : 'LIVE EXECUTION (Will refund on Razorpay)'}`);
  console.log('========================================================================\n');

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId.includes('dummy')) {
    console.warn('[WARNING] Real Razorpay credentials not found in local .env.');
    if (!isDryRun) {
      console.error('[ERROR] Cannot run live refunds without valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
      console.log('Provide credentials via env vars or run this script on the production server:');
      console.log('RAZORPAY_KEY_ID=... RAZORPAY_KEY_SECRET=... node scratch/process_nov02_refunds.mjs');
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

  const start = new Date('2026-11-02T00:00:00.000Z');
  const end = new Date('2026-11-02T23:59:59.999Z');

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
      console.error(`  -> FAILED to refund ${tx.initTransId} (${paymentId}):`, err.message || err);
      failCount++;
    }
  }

  console.log('\n========================================================================');
  console.log(`PROCESSING COMPLETE`);
  console.log(`Total Transactions: ${s4Txs.length}`);
  console.log(`Total Value: ₹${totalAmount.toFixed(2)}`);
  console.log(`Success / Ready: ${successCount}`);
  console.log(`Failed / Skipped: ${failCount}`);
  console.log('========================================================================');

  await mongoose.disconnect();
}

run();
