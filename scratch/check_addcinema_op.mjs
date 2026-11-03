async function checkOp() {
  const res = await fetch("http://14.194.50.141/api.asmx?op=AddCinema");
  const html = await res.text();
  console.log(html);
}
checkOp();
