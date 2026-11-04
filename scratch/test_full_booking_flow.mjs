async function testFullBookingFlow() {
  const cinemaId = "CN24";
  const sessionId = 16099;

  // 1. InitBooking
  console.log("\n1. Calling InitBooking...");
  const initRes = await fetch(`http://14.194.50.141/api.asmx/InitBooking?strCinemaId=${cinemaId}`);
  const initData = await initRes.json();
  const strTransId = initData.data;
  console.log("InitBooking transId:", strTransId);

  // 2. Get seat layout
  console.log("2. Fetching seat layout...");
  const layoutRes = await fetch(`http://14.194.50.141/api.asmx/GetSeatLayout?strCinemaId=${cinemaId}&strTransId=&strSessId=${sessionId}`);
  const layoutData = await layoutRes.json();
  const seats = layoutData?.data?.SeatLayout || layoutData?.data || [];
  const availSeat = seats.find(s => s.strSeatStatus === "0" && s.AreaCat_strCode === "0000000002") || seats.find(s => s.strSeatStatus === "0");
  console.log("Selected test seat:", {
    AreaCat_strCode: availSeat?.AreaCat_strCode,
    Area_bytNum: availSeat?.Area_bytNum,
    Seat_strId: availSeat?.Seat_strId,
    Seat_intRowId: availSeat?.Seat_intRowId,
    Seat_strNumber: availSeat?.Seat_strNumber
  });

  // 3. AddSeats with strType=0015, qty=1
  console.log("\n3. Calling AddSeats...");
  const addRes = await fetch(`http://14.194.50.141/api.asmx/AddSeats?CinemaId=${cinemaId}&strTransId=${strTransId}&strSessId=${sessionId}&strType=0015&intQty=1`);
  const addData = await addRes.json();
  console.log("AddSeats Response:", JSON.stringify(addData, null, 2));

  // 4. SetSeats
  const seatString = `|1|${availSeat.AreaCat_strCode}|${availSeat.Area_bytNum}|${availSeat.Seat_intRowId}|${availSeat.Seat_strNumber}|`;
  console.log(`\n4. Calling SetSeats with ${seatString}...`);
  const setRes = await fetch(`http://14.194.50.141/api.asmx/SetSeats?CinemaId=${cinemaId}&strTransId=${strTransId}&lngSessionId=${sessionId}&strSelectedSeats=${encodeURIComponent(seatString)}`);
  const setData = await setRes.json();
  console.log("SetSeats Response:", JSON.stringify(setData, null, 2));

  // 5. CancelTrans
  console.log("\n5. Cleaning up (CancelTrans)...");
  await fetch(`http://14.194.50.141/api.asmx/CancelTrans?CinemaId=${cinemaId}&strTransId=${strTransId}`);
  console.log("Booking flow test complete.");
}

testFullBookingFlow().catch(console.error);
