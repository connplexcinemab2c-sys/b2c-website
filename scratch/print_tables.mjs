import fs from 'fs';

const summary = JSON.parse(fs.readFileSync('c:/Users/admin/Downloads/Connplex-B2C/scratch/wa_summary.json', 'utf8'));

console.log('=== GRAND TOTAL ===');
console.log(summary.grandTotal);

console.log('\n=== DATE-WISE TOTALS ===');
for (const [date, val] of Object.entries(summary.dateTotals)) {
  console.log(`${date} | Bookings: ${val.bookings} | Tickets: ${val.tickets} | Ticket Rev: ₹${val.ticketRevenue.toFixed(2)} | Total Rev: ₹${val.totalRevenue.toFixed(2)}`);
}

console.log('\n=== MOVIE-WISE TOTALS ===');
for (const [movie, val] of Object.entries(summary.movieTotals)) {
  console.log(`${movie} | Bookings: ${val.bookings} | Tickets: ${val.tickets} | Ticket Rev: ₹${val.ticketRevenue.toFixed(2)} | Total Rev: ₹${val.totalRevenue.toFixed(2)}`);
}

console.log('\n=== DATE-WISE & MOVIE-WISE BREAKDOWN ===');
for (const [date, movies] of Object.entries(summary.dateMovieMap)) {
  console.log(`\n--- Date: ${date} ---`);
  for (const [movie, val] of Object.entries(movies)) {
    console.log(`  * ${movie}: Bookings: ${val.bookings}, Tickets: ${val.tickets}, Ticket Rev: ₹${val.ticketRevenue.toFixed(2)}, Total Rev: ₹${val.totalRevenue.toFixed(2)}`);
  }
}
