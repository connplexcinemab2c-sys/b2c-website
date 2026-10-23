import fs from 'fs';

const filePath = 'Backend/src/controller/user/CouponCart.js';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize CRLF to LF for matching, or match directly
const target = `    } else {
      for (let i = 1; i <= qtyVal; i++) {
        updateTicketsXml += \`<Ticket><Id>\${i}</Id><PriceEach>\${priceEach}</PriceEach></Ticket>\`;
      }
    }`;

const replacement = `    } else {
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

const isCRLF = content.includes('\r\n');
const normalizedTarget = isCRLF ? target.replace(/\n/g, '\r\n') : target;
const normalizedReplacement = isCRLF ? replacement.replace(/\n/g, '\r\n') : replacement;

if (content.includes(normalizedTarget)) {
  content = content.replace(normalizedTarget, normalizedReplacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("SUCCESSFULLY PATCHED CouponCart.js");
} else {
  console.log("Target not found!");
}
