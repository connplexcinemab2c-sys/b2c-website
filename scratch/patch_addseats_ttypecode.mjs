import fs from 'fs';

// 1. Patch Booking.js to persist tTypeCode / strType on addSeatData and Transaction
const bookingPath = 'Backend/src/controller/booking/Booking.js';
let bookingContent = fs.readFileSync(bookingPath, 'utf8');

const bookingTarget = `        const properties = response.data.data || {};
        if (!properties.strTransId) {
          properties.strTransId = strTransId;
        }
        if (!properties.strBookId && properties.intBookId) {
          properties.strBookId = String(properties.intBookId);
        }

        await Transaction.findOneAndUpdate(
          { initTransId: strTransId },
          {
            $set: { addSeatData: properties },
            $push: {
              logs: {
                addSeat: new Date(),
              },
            },
          }
        ).sort({ createdAt: -1 });`;

const bookingReplacement = `        const properties = response.data.data || {};
        if (!properties.strTransId) {
          properties.strTransId = strTransId;
        }
        if (!properties.strBookId && properties.intBookId) {
          properties.strBookId = String(properties.intBookId);
        }
        if (strType) {
          properties.tTypeCode = strType;
          properties.strType = strType;
        }

        await Transaction.findOneAndUpdate(
          { initTransId: strTransId },
          {
            $set: {
              addSeatData: properties,
              ...(strType ? { tTypeCode: strType } : {}),
            },
            $push: {
              logs: {
                addSeat: new Date(),
              },
            },
          }
        ).sort({ createdAt: -1 });`;

const isBookingCRLF = bookingContent.includes('\r\n');
const normBookingTarget = isBookingCRLF ? bookingTarget.replace(/\n/g, '\r\n') : bookingTarget;
const normBookingReplacement = isBookingCRLF ? bookingReplacement.replace(/\n/g, '\r\n') : bookingReplacement;

if (bookingContent.includes(normBookingTarget)) {
  bookingContent = bookingContent.replace(normBookingTarget, normBookingReplacement);
  fs.writeFileSync(bookingPath, bookingContent, 'utf8');
  console.log("SUCCESSFULLY PATCHED Booking.js");
} else {
  console.log("Target not found in Booking.js!");
}
