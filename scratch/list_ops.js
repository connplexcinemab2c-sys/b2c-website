const http = require('http');

http.get('http://14.194.50.141/api.asmx', res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const regex = /href="api\.asmx\?op=([^"]+)"/g;
    let match;
    const ops = [];
    while ((match = regex.exec(data)) !== null) {
      ops.push(match[1]);
    }
    console.log('Operations:', ops);
  });
});
