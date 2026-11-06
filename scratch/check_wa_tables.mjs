import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const waBookings = await db.collection('whatsappbookings').find().toArray();
    console.log('whatsappbookings total:', waBookings.length);
    if (waBookings.length > 0) console.log('Sample waBooking:', waBookings.slice(0, 2));

    const waCampaigns = await db.collection('whatsappcampaigns').find().toArray();
    console.log('whatsappcampaigns total:', waCampaigns.length);
    if (waCampaigns.length > 0) {
      console.log('Campaign names:', waCampaigns.map(c => ({ name: c.name || c.title || c.campaignName, id: c._id })));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
