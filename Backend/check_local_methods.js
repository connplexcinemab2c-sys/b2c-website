import axios from "axios";

async function main() {
  try {
    const url = "http://202.142.85.158/VistaWebService/clsbook.asmx";
    console.log("Checking local web service methods at:", url);
    const response = await axios.get(url);
    const html = response.data;
    const methods = [];
    const regex = /href="clsbook\.asmx\?op=([^"]+)"/ig;
    let match;
    while ((match = regex.exec(html)) !== null) {
      methods.push(match[1]);
    }
    console.log("Found Local Web Methods:", methods.sort());
  } catch (err) {
    console.error("Failed to connect:", err.message);
  }
}

main();
