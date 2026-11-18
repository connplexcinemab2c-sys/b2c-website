const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/full_details.json', 'utf8'));

for (const d of data) {
  console.log('----------------------------------------------------');
  console.log('InitTransId:', d.initTransId);
  console.log('Vista BookId:', d.tx.commitBookingData?.strBookId, 'Ex:', d.tx.commitBookingData?.strBookIdEx);
  console.log('Customer Name:', (d.user?.firstName || '') + ' ' + (d.user?.lastName || ''), 'Phone:', d.tx.normalized_phone || d.tx.paymentResponse?.contact || d.user?.mobileNumber, 'Email:', d.tx.paymentResponse?.email || d.user?.email);
  console.log('Movie:', d.movie?.name, 'Type:', d.movie?.movieType, 'Lang:', d.movie?.languages);
  console.log('Cinema:', d.cinema?.cinemaName, 'City:', d.region?.name);
  console.log('Screen:', d.show?.screenName, 'SessionId:', d.show?.sessionId);
  
  const showTime = d.show?.sessionRealShow ? new Date(new Date(d.show.sessionRealShow).getTime() + 5.5 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19) : null;
  console.log('Show Time (IST):', showTime);
  console.log('Booking Time (IST):', new Date(new Date(d.tx.createdAt).getTime() + 5.5 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19));
  console.log('Seats:', d.tx.commitBookingData?.strSeatInfo || d.tx.setSeatData?.strSeatInfo);
  console.log('Final Amount:', d.tx.finalBookingCalculation?.finalAmount);
  console.log('Ticket Total:', d.tx.finalBookingCalculation?.ticketCart?.ticketTotal);
  console.log('F&B Total:', d.tx.finalBookingCalculation?.foodCart?.fnbTotal);
  console.log('Convenience Fee:', d.tx.finalBookingCalculation?.convenienceFeesObject?.convenienceFees, 'GST:', d.tx.finalBookingCalculation?.convenienceFeesObject?.gst, 'Total Conv:', d.tx.finalBookingCalculation?.convenienceFeesObject?.total);
  console.log('Payment ID:', d.tx.paymentResponse?.id, 'Order ID:', d.tx.paymentResponse?.order_id, 'Method:', d.tx.paymentResponse?.method);
  console.log('Commit Status:', d.tx.commitStatus, 'Payment Status:', d.tx.paymentsStatus);
}
