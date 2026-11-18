import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const XLSX = require('C:/Users/admin/Downloads/Connplex-B2C/Admin_frontend/node_modules/xlsx');

const rawData = JSON.parse(fs.readFileSync('scratch/full_details.json', 'utf8'));

// Format functions with proper IST conversion
function toISTDateTime(date) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

function toISTDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function toISTTime(date) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

const detailedRows = rawData.map((d, index) => {
  const t = d.tx;
  const m = d.movie || {};
  const c = d.cinema || {};
  const s = d.show || {};
  const u = d.user || {};
  const fbc = t.finalBookingCalculation || {};
  const tc = fbc.ticketCart || {};
  const fc = fbc.foodCart || {};
  const conv = fbc.convenienceFeesObject || {};

  const seats = t.commitBookingData?.strSeatInfo || t.setSeatData?.strSeatInfo || '-';
  const seatCategory = seats.includes('-') ? seats.split('-')[0].trim() : '-';
  const seatNumbers = seats.includes('-') ? seats.split('-')[1].trim() : seats;
  const ticketCount = seatNumbers.split(',').filter(x => x.trim().length > 0).length;

  const grossTicketTotal = tc.ticketTotal || t.totalPrice || 0;
  const membershipDiscount = tc.membershipDiscount || 0;
  const rewardDiscount = fbc.rewardDiscount || tc.couponDiscount || 0;
  const totalDiscount = membershipDiscount + rewardDiscount;
  const netTicketTotal = tc.totalAfterDiscount || (grossTicketTotal - totalDiscount);
  const fnbTotal = fc.fnbTotal || 0;
  const convFee = conv.convenienceFees || 0;
  const convGst = conv.gst || 0;
  const convTotal = conv.total || (convFee + convGst);
  const finalAmount = fbc.finalAmount || t.finalPrice || (t.paymentResponse?.amount ? t.paymentResponse.amount / 100 : 0);

  const customerName = (u.firstName || u.lastName) ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : (t.userName || 'Guest User');
  const contactPhone = t.paymentResponse?.contact || t.normalized_phone || (u.mobileNumber ? String(u.mobileNumber) : '-');
  const registeredPhone = u.mobileNumber ? String(u.mobileNumber) : '-';
  const email = (u.email && u.email !== 'false') ? u.email : (t.paymentResponse?.email && t.paymentResponse?.email !== 'void@razorpay.com' ? t.paymentResponse.email : '-');

  return {
    "S.No.": index + 1,
    "Init Trans ID": d.initTransId,
    "Vista Booking ID": t.commitBookingData?.strBookId || '-',
    "Vista Booking Reference (Extended)": t.commitBookingData?.strBookIdEx || '-',
    "Booking Status": (t.commitStatus && t.paymentsStatus) ? "Confirmed / Success" : "Pending / Other",
    "Booking Date & Time (IST)": toISTDateTime(t.createdAt),
    "Movie Name": m.name || '-',
    "Experience / Format": m.movieType || (m.name?.includes('3D') ? '3D' : '2D'),
    "Language": m.languages || 'HINDI',
    "Cinema Name": c.cinemaName || '-',
    "City": d.region?.region || d.region?.name || '-',
    "Screen / Audi": s.screenName || '-',
    "Session ID": s.sessionId || '-',
    "Show Date": toISTDate(s.sessionRealShow),
    "Show Time": toISTTime(s.sessionRealShow),
    "Seat Class / Category": seatCategory,
    "Seat Numbers": seatNumbers,
    "Tickets Quantity": ticketCount,
    "Gross Ticket Total (INR)": grossTicketTotal,
    "Membership Discount (INR)": membershipDiscount,
    "Reward Discount (INR)": rewardDiscount,
    "Total Discount (INR)": totalDiscount,
    "Net Ticket Total (INR)": netTicketTotal,
    "F&B / 3D Glasses (INR)": fnbTotal,
    "Convenience Fee (INR)": convFee,
    "Convenience Fee GST (INR)": convGst,
    "Total Convenience Fee (INR)": convTotal,
    "Total Amount Paid (INR)": finalAmount,
    "Payment Gateway": "Razorpay",
    "Razorpay Payment ID": t.paymentResponse?.id || t.razorpayPaymentId || '-',
    "Razorpay Order ID": t.paymentResponse?.order_id || t.orderId || '-',
    "Payment Method": (t.paymentResponse?.method || 'UPI').toUpperCase(),
    "Payment Status": t.paymentResponse?.status || (t.paymentsStatus ? "captured" : "-"),
    "Customer Name": customerName,
    "Contact Phone (Payment)": contactPhone,
    "Registered Phone (Account)": registeredPhone,
    "Customer Email": email,
    "Booking Channel / Device": u.registeredFrom || t.bookedFrom || 'Mobile App',
    "Audit Number": t.commitBookingData?.lngAuditNumber || '-'
  };
});

// Sheet 2: Query Mapping (handling each ID requested by user, including duplicates)
const queryList = [
  '20000144987',
  '20000190161',
  '20000190161',
  '20000144987',
  '20000237010',
  '20000190499'
];

const mappingRows = queryList.map((qId, idx) => {
  const match = detailedRows.find(r => r["Init Trans ID"] === qId);
  return {
    "Query Position": idx + 1,
    "Requested ID": qId,
    "Match Status": match ? "Found" : "Not Found",
    "Vista Booking ID": match ? match["Vista Booking ID"] : "-",
    "Movie Name": match ? match["Movie Name"] : "-",
    "Cinema Name": match ? match["Cinema Name"] : "-",
    "Show Date & Time": match ? `${match["Show Date"]} ${match["Show Time"]}` : "-",
    "Seats": match ? match["Seat Numbers"] : "-",
    "Total Paid Amount (INR)": match ? match["Total Amount Paid (INR)"] : "-",
    "Record Type": (idx === 2 || idx === 3) ? "Duplicate in request" : "Unique record"
  };
});

// Create Workbook
const wb = XLSX.utils.book_new();

// Sheet 1: Booking Details
const wsBookings = XLSX.utils.json_to_sheet(detailedRows);
const colWidths = Object.keys(detailedRows[0]).map(k => {
  const maxLen = Math.max(
    k.length,
    ...detailedRows.map(row => String(row[k] ?? '').length)
  );
  return { wch: Math.min(Math.max(maxLen + 3, 12), 42) };
});
wsBookings['!cols'] = colWidths;
XLSX.utils.book_append_sheet(wb, wsBookings, 'Booking Details');

// Sheet 2: Requested IDs Mapping
const wsMapping = XLSX.utils.json_to_sheet(mappingRows);
const mapColWidths = Object.keys(mappingRows[0]).map(k => {
  const maxLen = Math.max(
    k.length,
    ...mappingRows.map(row => String(row[k] ?? '').length)
  );
  return { wch: Math.min(Math.max(maxLen + 3, 14), 38) };
});
wsMapping['!cols'] = mapColWidths;
XLSX.utils.book_append_sheet(wb, wsMapping, 'Requested IDs Mapping');

// Save Excel file
const excelPath = path.resolve('Connplex_Booking_Details_Report.xlsx');
XLSX.writeFile(wb, excelPath);
console.log('Successfully wrote Excel file to:', excelPath);

// Save CSV file
const csvPath = path.resolve('Connplex_Booking_Details_Report.csv');
const csvContent = XLSX.utils.sheet_to_csv(wsBookings);
fs.writeFileSync(csvPath, csvContent, 'utf8');
console.log('Successfully wrote CSV file to:', csvPath);
