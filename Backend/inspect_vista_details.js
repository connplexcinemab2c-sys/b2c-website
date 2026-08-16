import axios from "axios";

const VISTA_BASE_URL = "http://14.194.50.141/api.asmx";

async function main() {
  try {
    console.log("Querying Vista GetAllcinemaDetails...");
    const response = await axios.get(`${VISTA_BASE_URL}/GetAllcinemaDetails`);
    if (response.data && response.data.data && response.data.data.ItemCinemaDetails) {
      const items = response.data.data.ItemCinemaDetails;
      console.log(`Found ${items.length} cinemas on Vista:`);
      items.forEach(item => {
        console.log(`- ID: ${item.Cinema_strID}, Name: "${item.Cinema_strName}", URL: "${item.Cinema_strWebServiceURL}", License: "${item.License_strCode}"`);
      });
    } else {
      console.log("Response data structure unexpected:", JSON.stringify(response.data, null, 2));
    }
  } catch (err) {
    console.error("Error fetching from Vista:", err.message);
  }
}

main();
