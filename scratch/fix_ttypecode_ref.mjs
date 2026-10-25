import fs from 'fs';

const filePath = 'Backend/src/controller/user/CouponCart.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Destructure tTypeCode from payload
const target1 = `      rewardCoins = 0,
      // } = req.body;
    } = payload;`;

const replace1 = `      rewardCoins = 0,
      tTypeCode,
      // } = req.body;
    } = payload;`;

// 2. Safe tTypeCode usage in call
const target2 = `                tTypeCode:
                  tTypeCode ||
                  findTx.tTypeCode ||
                  findTx.addSeatData?.tTypeCode ||
                  findTx.addSeatData?.strType ||
                  "0001",`;

const replace2 = `                tTypeCode:
                  payload?.tTypeCode ||
                  findTx.tTypeCode ||
                  findTx.addSeatData?.tTypeCode ||
                  findTx.addSeatData?.strType ||
                  "0001",`;

const isCRLF = content.includes('\r\n');
const toNorm = (str) => isCRLF ? str.replace(/\n/g, '\r\n') : str;

if (content.includes(toNorm(target1)) && content.includes(toNorm(target2))) {
  content = content.replace(toNorm(target1), toNorm(replace1)).replace(toNorm(target2), toNorm(replace2));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("SUCCESSFULLY FIXED tTypeCode ReferenceError in CouponCart.js");
} else {
  console.log("Match failed:", {
    target1: content.includes(toNorm(target1)),
    target2: content.includes(toNorm(target2)),
  });
}
