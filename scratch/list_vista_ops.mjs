async function listMethods() {
  const res = await fetch('http://14.194.50.141/api.asmx');
  const text = await res.text();
  const matches = [...text.matchAll(/href="api\.asmx\?op=([^"]+)"/g)].map(m => m[1]);
  console.log('Available operations on api.asmx:', matches);
}
listMethods();
