const cinemaId = 'CN06';
const sessionId = 13995;
const vistaUrl = 'http://14.194.50.141/api.asmx';

// 1. Get Seat Layout
const slRes = await fetch(`${vistaUrl}/GetSeatLayout?strCinemaId=${cinemaId}&strTransId=&strSessId=${sessionId}`);
const slData = await slRes.json();
console.log('Seat layout areas count:', slData.data?.length);
for (const area of slData.data) {
    console.log('Area:', area.colData?.strAreaCode, area.colData?.strAreaDesc, 'GroupSeatsData:', area.colData?.strGroupSeatsData);
}

// 2. Price Details from MongoDB / backend
const prRes = await fetch(`https://backend.theconnplex.com/api/price-details/0079/${cinemaId}`);
const prData = await prRes.json();
console.log('Price details status:', prData.status, 'items:', prData.data?.length);
for (const p of prData.data || []) {
    console.log('  tTypeCode:', p.tTypeCode, 'areaCatCode:', p.areaCatCode, 'price:', p.currentPrice, 'desc:', p.tTypeDescription);
}

// 3. InitBooking
const initRes = await fetch(`${vistaUrl}/InitBooking?strCinemaId=${cinemaId}`);
const initData = await initRes.json();
console.log('InitBooking result:', initData);
const transId = initData.data?.strTransId;

// 4. Test AddSeats with different strType values
for (const p of prData.data || []) {
    const testAdd = await fetch(`${vistaUrl}/AddSeats?CinemaId=${cinemaId}&strTransId=${transId}&strSessId=${sessionId}&strType=${p.tTypeCode}&intQty=2`);
    const addResult = await testAdd.json();
    console.log(`AddSeats test tTypeCode=${p.tTypeCode}:`, addResult.Status, addResult.msg, addResult.data);
}

// Also test intQty=1
for (const p of prData.data || []) {
    const testAdd = await fetch(`${vistaUrl}/AddSeats?CinemaId=${cinemaId}&strTransId=${transId}&strSessId=${sessionId}&strType=${p.tTypeCode}&intQty=1`);
    const addResult = await testAdd.json();
    console.log(`AddSeats test intQty=1 tTypeCode=${p.tTypeCode}:`, addResult.Status, addResult.msg, addResult.data);
}
