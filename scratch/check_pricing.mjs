import mongoose from 'mongoose';

async function checkPrice() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const show = await db.collection('shows').findOne({ sessionId: 13635, cinemaId: 'CN06' });
  console.log('Show:', show?._id, show?.pGroupCode, show?.layoutId);

  const pricePackages = await db.collection('pricepackages').find({ cinemaId: 'CN06' }).toArray();
  console.log(`Found ${pricePackages.length} price packages for CN06`);
  for (const pp of pricePackages.slice(0, 5)) {
    console.log(pp.pGroupCode, pp.pGroupDesc, pp.ticketTypeWisePrice?.map(t => ({ code: t.ticketTypeCode, name: t.ticketTypeName, price: t.price })));
  }

  const prices = await db.collection('prices').find({ cinemaId: 'CN06' }).toArray();
  console.log(`Found ${prices.length} prices for CN06`);
  for (const p of prices.slice(0, 5)) {
    console.log(p.tTypeCode, p.tTypeName, p.price);
  }

  await mongoose.disconnect();
}

checkPrice();
