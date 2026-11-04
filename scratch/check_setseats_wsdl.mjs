async function checkSetSeatsWSDL() {
  const res = await fetch("http://14.194.50.141/api.asmx?WSDL");
  const wsdl = await res.text();
  const m = wsdl.match(/<s:element name="SetSeats">[\s\S]*?<\/s:element>/);
  console.log(m ? m[0] : "Not found");
}

checkSetSeatsWSDL();
