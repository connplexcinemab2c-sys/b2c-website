import axios from "axios";

async function main() {
  try {
    const response = await axios.get("http://14.194.50.141/api.asmx?WSDL");
    const wsdl = response.data;
    
    // Find all element names in the schema that start with or contain "Cinema" or "Branch"
    const regex = /<s:element name="([^"]+)"/g;
    let match;
    const methods = [];
    while ((match = regex.exec(wsdl)) !== null) {
      const name = match[1];
      if (name.includes("Cinema") || name.includes("Lic") || name.includes("Branch")) {
        methods.push(name);
      }
    }
    console.log("Matching WSDL Elements:", [...new Set(methods)].sort());
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
