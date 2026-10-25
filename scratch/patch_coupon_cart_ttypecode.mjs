import fs from 'fs';

const couponPath = 'Backend/src/controller/user/CouponCart.js';
let couponContent = fs.readFileSync(couponPath, 'utf8');

// 1. Signature update for updateVistaOrderPrice
const targetSig = `export const updateVistaOrderPrice = async ({
  cinemaId,
  transId,
  newTicketTotal,
  quantity,
  addSeatData,
  setSeatData,
}) => {`;

const replaceSig = `export const updateVistaOrderPrice = async ({
  cinemaId,
  transId,
  newTicketTotal,
  quantity,
  addSeatData,
  setSeatData,
  tTypeCode,
}) => {`;

// 2. XML ticket generation fallback
const targetXml = `    } else {
      // Use outcome ID from AddSeats API (intBookId, strBookId, or strBookIdEx)
      const outcomeId =
        addSeatData.intBookId ||
        addSeatData.strBookId ||
        addSeatData.strBookIdEx ||
        addSeatData.bookingId ||
        addSeatData.id;

      if (outcomeId) {
        updateTicketsXml += \`<Ticket><Id>\${outcomeId}</Id><PriceEach>\${priceEach}</PriceEach></Ticket>\`;
      } else {
        for (let i = 1; i <= qtyVal; i++) {
          updateTicketsXml += \`<Ticket><Id>\${i}</Id><PriceEach>\${priceEach}</PriceEach></Ticket>\`;
        }
      }
    }`;

const replaceXml = `    } else {
      // Use Ticket Type Code (tTypeCode) passed into AddSeats
      const ticketId =
        tTypeCode ||
        addSeatData.tTypeCode ||
        addSeatData.strType ||
        "0001";

      for (let i = 1; i <= qtyVal; i++) {
        updateTicketsXml += \`<Ticket><Id>\${ticketId}</Id><PriceEach>\${priceEach}</PriceEach></Ticket>\`;
      }
    }`;

// 3. Invocation in couponCart
const targetCall = `              const updateResult = await updateVistaOrderPrice({
                cinemaId: cinemaDoc.cinemaId,
                transId,
                newTicketTotal: cart.ticketCart.total,
                quantity,
                addSeatData: findTx.addSeatData,
                setSeatData: findTx.setSeatData,
              });`;

const replaceCall = `              const updateResult = await updateVistaOrderPrice({
                cinemaId: cinemaDoc.cinemaId,
                transId,
                newTicketTotal: cart.ticketCart.total,
                quantity,
                addSeatData: findTx.addSeatData,
                setSeatData: findTx.setSeatData,
                tTypeCode:
                  tTypeCode ||
                  findTx.tTypeCode ||
                  findTx.addSeatData?.tTypeCode ||
                  findTx.addSeatData?.strType ||
                  "0001",
              });`;

const isCRLF = couponContent.includes('\r\n');
const toNorm = (str) => isCRLF ? str.replace(/\n/g, '\r\n') : str;

if (
  couponContent.includes(toNorm(targetSig)) &&
  couponContent.includes(toNorm(targetXml)) &&
  couponContent.includes(toNorm(targetCall))
) {
  couponContent = couponContent
    .replace(toNorm(targetSig), toNorm(replaceSig))
    .replace(toNorm(targetXml), toNorm(replaceXml))
    .replace(toNorm(targetCall), toNorm(replaceCall));

  fs.writeFileSync(couponPath, couponContent, 'utf8');
  console.log("SUCCESSFULLY PATCHED CouponCart.js with tTypeCode");
} else {
  console.log("Matches failed:", {
    targetSig: couponContent.includes(toNorm(targetSig)),
    targetXml: couponContent.includes(toNorm(targetXml)),
    targetCall: couponContent.includes(toNorm(targetCall)),
  });
}
