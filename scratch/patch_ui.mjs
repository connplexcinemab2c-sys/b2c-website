import fs from 'fs';

// Patch BookingCart.jsx
let bc = fs.readFileSync('User_frontend/src/container/pages/user/addSnacks/BookingCart.jsx', 'utf8');

bc = bc.replace(
  "{`'${item}' applied`}",
  "{`'${item?.couponTitle || item}' applied`}"
);

// Replace both occurrences of handleRemoveCoupon(item) in ticketCart and foodCart map loops
bc = bc.replace(
  'onClick={() => handleRemoveCoupon(item)}',
  'onClick={() => handleRemoveCoupon(item?.couponTitle || item)}'
);

bc = bc.replace(
  'onClick={() => handleRemoveCoupon(item)}',
  'onClick={() => handleRemoveCoupon(item?.couponTitle || item)}'
);

bc = bc.split('ticketCart?.coupons?.[0] || ""').join('ticketCart?.coupons?.[0]?.couponTitle || ticketCart?.coupons?.[0] || ""');

fs.writeFileSync('User_frontend/src/container/pages/user/addSnacks/BookingCart.jsx', bc, 'utf8');
console.log('BookingCart.jsx patched.');

// Patch AddSnacks.jsx
let as = fs.readFileSync('User_frontend/src/container/pages/user/addSnacks/AddSnacks.jsx', 'utf8');
const searchPart = 'const handleRemoveCoupon = async (coupon, transId) => {';
const idx = as.indexOf(searchPart);
if (idx !== -1) {
  const endIdx = as.indexOf('try {', idx);
  const snippet = as.substring(idx, endIdx);
  const newSnippet = `const handleRemoveCoupon = async (coupon, transId) => {
    console.log(coupon, ":coupon121");
    if (isRemovingCoupon?.isRemoving) return;

    const couponCodeStr = typeof coupon === "object" ? coupon?.couponTitle : coupon;
    setIsRemovingCoupon({ couponCode: couponCodeStr, isRemoving: true });
    const payload = {
      transId,
      couponCode: couponCodeStr,
      cinemaId: stateData?.cinemaData?.cinemaData?._id,
    };
    `;
  as = as.substring(0, idx) + newSnippet + as.substring(endIdx);
  fs.writeFileSync('User_frontend/src/container/pages/user/addSnacks/AddSnacks.jsx', as, 'utf8');
  console.log('AddSnacks.jsx patched.');
}
