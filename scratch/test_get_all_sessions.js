const http = require('http');

http.get('http://14.194.50.141/api.asmx/GetAllSession?test=string', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const list = parsed.data?.SessionList || [];
      console.log('GetAllSession count:', list.length);
      const cinemasInSessions = new Set(list.map(s => s.Cinema_strID));
      console.log('Cinemas in GetAllSession (' + cinemasInSessions.size + '):', Array.from(cinemasInSessions).sort());
    } catch (e) {
      console.log('Parse error or raw data:', data.slice(0, 300));
    }
  });
}).on('error', err => {
  console.log('Network error:', err.message);
});
