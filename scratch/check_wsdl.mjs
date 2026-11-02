async function run() {
  try {
    const res = await fetch('http://14.194.50.141/api.asmx?WSDL');
    const text = await res.text();
    console.log('Status:', res.status, 'Length:', text.length);
    const matches = text.match(/<wsdl:operation name="([^"]+)"/g) || [];
    const ops = [...new Set(matches.map(m => m.replace('<wsdl:operation name="', '').replace('"', '')))];
    console.log('Operations in api.asmx:', ops);
  } catch (err) {
    console.error('Error fetching WSDL:', err.message);
  }
}

run();
