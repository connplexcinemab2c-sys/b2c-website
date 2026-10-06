
async function run() {
  try {
    console.log("Calling Vista GetAllPrice for CN42...");
    const res = await fetch('http://14.194.50.141/api.asmx/GetAllPrice?test=string', { signal: AbortSignal.timeout(15000) });
    const data = await res.json();
    const prices = data?.data?.PriceList || [];
    console.log(`Total prices returned from Vista: ${prices.length}`);

    const cn42Prices = prices.filter(p => p.Cinema_strID === 'CN42');
    console.log(`CN42 prices count: ${cn42Prices.length}`);

    const p0074 = cn42Prices.filter(p => p.Price_strPackage === '0074' || p.Price_strGroupCode === '0074' || p.pGroupCode === '0074');
    console.log(`CN42 pGroup 0074 count: ${p0074.length}`);
    for (const p of p0074) {
      console.log(p);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();
