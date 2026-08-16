import axios from "axios";

async function main() {
  try {
    const response = await axios.get("http://14.194.50.141/api.asmx?WSDL");
    const wsdl = response.data;
    console.log("WSDL length:", wsdl.length);
    
    // Find AddCinema element definition in schema
    const startIdx = wsdl.indexOf('<s:element name="AddCinema">');
    if (startIdx !== -1) {
      const endIdx = wsdl.indexOf('</s:element>', startIdx);
      console.log("AddCinema Schema Definition:");
      console.log(wsdl.slice(startIdx, endIdx + 12));
    } else {
      console.log("AddCinema definition not found in WSDL.");
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
