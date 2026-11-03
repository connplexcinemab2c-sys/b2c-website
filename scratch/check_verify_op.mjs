async function checkOp() {
  const res = await fetch('http://14.194.50.141/api.asmx?op=BookingVerify');
  const text = await res.text();
  console.log(text.substring(0, 1500));
}
checkOp();
