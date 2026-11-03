async function checkLayout() {
  const url = `http://14.194.50.141/api.asmx/GetSeatLayout?strCinemaId=CN06&strTransId=20000232121&strSessId=13635`;
  const res = await fetch(url);
  const text = await res.text();
  console.log('Layout status:', res.status);
  console.log('Layout preview:', text.substring(0, 1500));
}
checkLayout();
