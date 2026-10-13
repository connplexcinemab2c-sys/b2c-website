import fs from 'fs';

const summary = JSON.parse(fs.readFileSync('c:/Users/admin/Downloads/Connplex-B2C/scratch/wa_summary.json', 'utf8'));
const records = JSON.parse(fs.readFileSync('c:/Users/admin/Downloads/Connplex-B2C/scratch/wa_records.json', 'utf8'));

// 1. Date & Movie Summary CSV
const dateMovieCsvRows = [
  'Date,Movie,Number of Bookings,Number of Tickets,Ticket Revenue (INR),Total Revenue (INR)'
];

for (const [date, movies] of Object.entries(summary.dateMovieMap)) {
  for (const [movie, val] of Object.entries(movies)) {
    dateMovieCsvRows.push(`"${date}","${movie}",${val.bookings},${val.tickets},${val.ticketRevenue.toFixed(2)},${val.totalRevenue.toFixed(2)}`);
  }
}

fs.writeFileSync('c:/Users/admin/Downloads/Connplex-B2C/whatsapp_bookings_date_and_movie_wise.csv', dateMovieCsvRows.join('\n'));

// 2. Individual Bookings CSV
const individualCsvRows = [
  'Transaction ID,Booking ID,Date Time (IST),Movie Name,Tickets Count,Ticket Revenue (INR),Total Paid (INR),Payment ID'
];

for (const r of records.filter(x => x.isConfirmed)) {
  individualCsvRows.push(`"${r.id}","${r.strBookId || ''}","${r.istDateTime}","${r.movieName}",${r.ticketCount},${r.ticketRevenue.toFixed(2)},${r.totalRevenue.toFixed(2)},"${r.paymentId || ''}"`);
}

fs.writeFileSync('c:/Users/admin/Downloads/Connplex-B2C/whatsapp_individual_confirmed_bookings.csv', individualCsvRows.join('\n'));

console.log("Generated CSV files successfully.");
