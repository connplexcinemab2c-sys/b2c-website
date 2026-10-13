import axios from 'axios';

const cinemasToTest = [
  { id: 'CN01', name: 'Ahilyanagar', urls: ['http://203.192.206.11/VistaWebService/clsbook.asmx', 'http://103.129.101.135/VistaWebService/clsbook.asmx'] },
  { id: 'CN42', name: 'Adani Shantigram', urls: ['http://122.187.232.40/VistaWebService/clsBook.asmx'] },
  { id: 'CN30', name: 'MPM Mall', urls: ['http://103.169.178.107/VistaWebService/clsBook.asmx'] },
  { id: 'CN93', name: 'Jagdalpur', urls: ['http://103.136.91.73/VistaWebService/clsBook.asmx', 'http://117.248.253.47/VistaWebService/clsbook.asmx'] },
  { id: 'CN26', name: 'Madhubani', urls: ['http://122.176.213.180/VistaWebService/clsbook.asmx', 'http://116.193.134.135/VistaWebService/clsbook.asmx'] },
  { id: 'CN35', name: 'Mundra', urls: ['http://43.228.97.61/VistaWebService/clsBook.asmx'] },
  { id: 'CN95', name: 'Bhikhana Pahari', urls: ['http://103.225.177.234/VistaWebService/clsbook.asmx'] },
  { id: 'CN39', name: 'Tribeca Highstreet', urls: ['http://45.252.70.254/VistaWebService/clsBook.asmx', 'http://103.252.53.136/VistaWebService/clsbook.asmx'] },
  { id: 'CN96', name: 'Solapur', urls: ['http://103.71.65.58/VistaWebService/clsbook.asmx', 'http://117.242.9.157/VistaWebService/clsbook.asmx'] },
  { id: 'CN44', name: 'Junagadh', urls: ['http://117.223.149.133/VistaWebService/clsBook.asmx'] }
];

const sampleSoapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetFilmList xmlns="http://tempuri.org/">
      <strCinemaId>TEST</strCinemaId>
      <strUserId></strUserId>
      <strUserPWD></strUserPWD>
    </GetFilmList>
  </soap:Body>
</soap:Envelope>`;

async function testUrl(url, cid) {
  const soapPayload = sampleSoapEnvelope.replace('TEST', cid);
  const start = Date.now();
  try {
    const res = await axios.post(url, soapPayload, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/GetFilmList'
      },
      timeout: 8000
    });
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    const hasFilms = res.data?.includes('<GetFilmListResult>');
    return { success: true, duration: `${duration}s`, status: res.status, hasFilms, length: res.data?.length };
  } catch (e) {
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    return { success: false, duration: `${duration}s`, error: e.code || e.message };
  }
}

async function main() {
  console.log('Testing SOAP connectivity for all 10 cinemas...\n');
  for (const c of cinemasToTest) {
    console.log(`=== ${c.id}: ${c.name} ===`);
    for (const url of c.urls) {
      const res = await testUrl(url, c.id);
      if (res.success) {
        console.log(`  [OK] ${url} (${res.duration}) - Films XML returned (${res.length} bytes)`);
      } else {
        console.log(`  [FAIL] ${url} (${res.duration}) - ${res.error}`);
      }
    }
  }
}

main().catch(console.error);
