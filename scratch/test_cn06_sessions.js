const http = require('http');

function request(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function testAll() {
  const sessData = await request('http://14.194.50.141/api.asmx/GetCinemawiseSession?CinemaId=CN06');
  const priceData = await request('http://14.194.50.141/api.asmx/GetCinemawisePrice?CinemaId=CN06');

  const sessions = sessData.data?.SessionList || [];
  const prices = priceData.data?.CinemawisePriceList || [];

  console.log('Total sessions for CN06:', sessions.length);

  // Group prices by PGroup_strCode
  const priceMap = {};
  for (const p of prices) {
    if (!priceMap[p.PGroup_strCode]) priceMap[p.PGroup_strCode] = [];
    priceMap[p.PGroup_strCode].push(p.TType_strCode);
  }

  // Pick first 10 future sessions
  for (const s of sessions.slice(0, 10)) {
    const tTypes = priceMap[s.PGroup_strCode] || [];
    console.log(`Checking session ${s.Session_lngSessionId} (screen ${s.Screen_strName}, pGroup ${s.PGroup_strCode}), types:`, tTypes);
    for (const t of tTypes) {
      const initRes = await request('http://14.194.50.141/api.asmx/InitBooking?strCinemaId=CN06');
      const tId = initRes.data;
      const addRes = await request(`http://14.194.50.141/api.asmx/AddSeats?CinemaId=CN06&strTransId=${tId}&strSessId=${s.Session_lngSessionId}&strType=${t}&intQty=1`);
      console.log(`  -> Type ${t}: Status=${addRes.Status}, msg=${addRes.msg}, data=${typeof addRes.data === 'string' ? addRes.data.slice(0, 100) : JSON.stringify(addRes.data)}`);
      if (addRes.Status == 1) {
        console.log('  *** SUCCESS FOR SESSION', s.Session_lngSessionId, 'TYPE', t, '***');
      }
    }
  }
}

testAll();
