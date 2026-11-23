import axios from "axios";

async function testSeats() {
  const tests = [
    { cid: "CN40", sess: "4909", name: "NAROL" },
    { cid: "CN42", sess: "4249", name: "ADANI" },
    { cid: "CN27", sess: "6343", name: "BHARUCH" }
  ];
  for (const t of tests) {
    try {
      const res = await axios.get(`https://backend.theconnplex.com/api/seat-layout/${t.cid}/${t.sess}`, { timeout: 8000 });
      console.log(`[${t.cid}] ${t.name} => HTTP ${res.status}:`, JSON.stringify(res.data).slice(0, 300));
    } catch (e) {
      console.log(`[${t.cid}] ${t.name} => FAIL: ${e.message}`);
    }
  }
}

testSeats();
