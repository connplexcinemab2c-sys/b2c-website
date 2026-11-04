async function testAddSeats() {
  const cinemaId = "CN24";
  const sessionId = 16099;

  // 1. InitBooking
  const initRes = await fetch(`http://14.194.50.141/api.asmx/InitBooking?strCinemaId=${cinemaId}`);
  const initData = await initRes.json();
  const strTransId = initData.data;
  console.log("InitBooking transId:", strTransId);

  // 2. AddSeats with strType=0015
  console.log(`Calling AddSeats for transId ${strTransId}, sessionId ${sessionId}, strType 0015, intQty 2...`);
  const addRes = await fetch(`http://14.194.50.141/api.asmx/AddSeats?CinemaId=${cinemaId}&strTransId=${strTransId}&strSessId=${sessionId}&strType=0015&intQty=2`);
  const addData = await addRes.json();
  console.log("AddSeats Response (raw):", JSON.stringify(addData, null, 2));

  // Cancel
  await fetch(`http://14.194.50.141/api.asmx/CancelTrans?CinemaId=${cinemaId}&strTransId=${strTransId}`);
}

testAddSeats().catch(console.error);
