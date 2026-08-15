import axios from "axios";

const urls = [
  {
    name: "Darbhanga",
    url: "http://175.111.135.248/VistaWebService/clsbook.asmx"
  },
  {
    name: "Solapur",
    url: "http://117.242.9.157/VistaWebService/clsbook.asmx"
  }
];

async function main() {
  for (const item of urls) {
    console.log(`\n=================== ${item.name} ===================`);
    console.log(`Calling ${item.url}...`);
    try {
      const response = await axios.get(item.url, { timeout: 10000 });
      console.log("Status:", response.status);
      const html = response.data;
      const methods = [];
      const regex = /href="clsbook\.asmx\?op=([^"]+)"/ig;
      let match;
      while ((match = regex.exec(html)) !== null) {
        methods.push(match[1]);
      }
      console.log("Found Local Web Methods:", methods.sort());
    } catch (err) {
      console.error(`Failed for ${item.name}:`, err.message);
    }
  }
}

main();
