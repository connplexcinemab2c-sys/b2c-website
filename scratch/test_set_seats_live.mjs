async function testSetSeats() {
  const cinemaId = "CN24";
  const sessionId = 16099;

  // 1. InitBooking
  const initRes = await fetch(`http://14.194.50.141/api.asmx/InitBooking?strCinemaId=${cinemaId}`);
  const initData = await initRes.json();
  const strTransId = initData.data;
  console.log("InitBooking transId:", strTransId);

  // 2. AddSeats (1 ticket of 0019)
  console.log("Calling AddSeats...");
  const addRes = await fetch(`http://14.194.50.141/api.asmx/AddSeats?CinemaId=${cinemaId}&strTransId=${strTransId}&strSessId=${sessionId}&strType=0019&intQty=1`);
  const addData = await addRes.json();
  console.log("AddSeats Result:", addData);

  // 3. SetSeats: seatString = |1|0000000005|3|1|12|
  const seatString = "|1|0000000005|3|1|12|";
  console.log("Calling SetSeats with:", seatString);
  const setRes = await fetch(`http://14.194.50.141/api.asmx/SetSeats?strCinemaId=${cinemaId}&strTransId=${strTransId}&lngSessionId=${sessionId}&strSelectedSeats=${encodeURIComponent(seatString)}`);
  const setData = await setRes.json();
  console.log("SetSeats Result:", JSON.stringify(setData, null, 2));

  // 4. CancelTrans
  console.log("Cleaning up (CancelTrans)...");
  await fetch(`http://14.194.50.141/api.asmx/CancelTrans?CinemaId=${cinemaId}&strTransId=${strTransId}`);
}

testSetSeats().catch(console.error);
