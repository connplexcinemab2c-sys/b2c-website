import axios from 'axios';

async function main() {
  try {
    const url = 'http://202.142.85.158/VistaWebService/clsbook.asmx/GetAllDetails?test=string';
    console.log(`Calling ${url}...`);
    const response = await axios.get(url, { timeout: 10000 });
    console.log("Response Status:", response.status);
    
    // The response is XML. Let's print the first 2000 characters of response.data
    const xml = response.data;
    console.log("XML excerpt (first 2000 chars):");
    console.log(xml.slice(0, 2000));
  } catch (err) {
    console.error("Error calling Khagaul Vista service:", err.message);
  }
}

main();
