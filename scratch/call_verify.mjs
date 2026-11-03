async function verify() {
  const url = `http://14.194.50.141/api.asmx/BookingVerify?strCinemaId=CN06&strKey=&lngBookingId=230911&lngSessionId=13635&strTypeCode=0002&intQty=2&blnPaid=true`;
  const res = await fetch(url);
  const text = await res.text();
  console.log('BookingVerify result:', text);
}
verify();
