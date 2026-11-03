async function checkOp() {
  const res = await fetch('http://14.194.50.141/api.asmx?op=BookingVerify');
  const text = await res.text();
  const forms = text.match(/<pre>[\s\S]*?<\/pre>/g);
  console.log(forms?.join('\n\n'));
}
checkOp();
