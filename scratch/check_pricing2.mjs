import mongoose from 'mongoose';

async function checkPrice() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const price = await db.collection('prices').findOne({ cinemaId: 'CN06', tTypeCode: '0002' });
  console.log('Price document for tTypeCode 0002:', price);

  const pricePkg = await db.collection('pricepackages').findOne({ cinemaId: 'CN06', pGroupCode: '0069' });
  console.log('PricePackage for 0069:', pricePkg);

  await mongoose.disconnect();
}

checkPrice();
