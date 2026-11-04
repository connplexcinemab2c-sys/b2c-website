async function checkPrices() {
  const pRes = await fetch("http://14.194.50.141/api.asmx/GetCinemawisePrice?CinemaId=CN24");
  const pData = await pRes.json();
  const prices = pData?.data?.CinemawisePriceList || [];
  console.log("Total prices for CN24:", prices.length);
  const p0189 = prices.filter(p => p.PGroup_strCode === "0189");
  console.log("Prices for PGroup 0189:", p0189);
}

checkPrices();
