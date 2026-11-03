import fs from 'fs';

try {
  const f = fs.readFileSync('Connplex_Nov03_2026_Refund_List.csv', 'utf8');
  console.log('Connplex_Nov03_2026_Refund_List.csv content:');
  console.log(f);
} catch (e) {
  console.log('No Nov 03 refund file or error:', e.message);
}
