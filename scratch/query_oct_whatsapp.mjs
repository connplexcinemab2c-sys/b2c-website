import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // Check year of transactions
    const minMaxDates = await db.collection('transactions').aggregate([
      {
        $group: {
          _id: null,
          minDate: { $min: '$createdAt' },
          maxDate: { $max: '$createdAt' }
        }
      }
    ]).toArray();
    console.log('Overall Transaction min/max createdAt:', minMaxDates);

    // Check distinct utm_source with whatsapp
    const waSources = await db.collection('transactions').distinct('utm_source', {
      utm_source: { $regex: /whatsapp/i }
    });
    console.log('Distinct whatsapp sources:', waSources);

    // Query for Oct 2026 (and also check if Oct 2025 exists)
    // IST Oct 1 00:00:00 to Oct 31 23:59:59.999 is UTC 2026-09-30T18:30:00.000Z to 2026-10-31T18:29:59.999Z
    // Let's widen slightly or query both createdAt and showDate
    const oct2026Start = new Date('2026-09-30T18:30:00.000Z');
    const oct2026End = new Date('2026-10-31T18:29:59.999Z');

    const oct2026Count = await db.collection('transactions').countDocuments({
      createdAt: { $gte: oct2026Start, $lte: oct2026End },
      utm_source: { $regex: /whatsapp/i }
    });
    console.log('Oct 2026 WhatsApp transactions count:', oct2026Count);

    const oct2025Start = new Date('2025-09-30T18:30:00.000Z');
    const oct2025End = new Date('2025-10-31T18:29:59.999Z');
    const oct2025Count = await db.collection('transactions').countDocuments({
      createdAt: { $gte: oct2025Start, $lte: oct2025End },
      utm_source: { $regex: /whatsapp/i }
    });
    console.log('Oct 2025 WhatsApp transactions count:', oct2025Count);

    // Also let's check without date range, group all WhatsApp transactions by month/year
    const monthlySummary = await db.collection('transactions').aggregate([
      {
        $match: {
          utm_source: { $regex: /whatsapp/i }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.status': 1 }
      }
    ]).toArray();
    console.log('WhatsApp transactions by Year/Month/Status:');
    console.dir(monthlySummary, { depth: null });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
