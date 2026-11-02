async function run() {
  try {
    const res = await fetch('http://14.194.50.141/api.asmx?WSDL');
    const text = await res.text();
    
    function printElement(name) {
      const start = text.indexOf(`<s:element name="${name}">`);
      if (start !== -1) {
        const end = text.indexOf('</s:element>', start);
        console.log(`\n--- Element: ${name} ---`);
        console.log(text.slice(start, end + 12));
      }
    }

    printElement('CommitBookingEx');
    printElement('SetBookingFee');
    printElement('BookingVerify');
    printElement('InitBooking');
    printElement('AddSeats');
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
