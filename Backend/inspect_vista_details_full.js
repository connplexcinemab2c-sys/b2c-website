import axios from "axios";

async function main() {
  try {
    console.log("Querying Vista GetAllDetails...");
    const response = await axios.get("http://14.194.50.141/api.asmx/GetAllDetails?test=string");
    if (response.data && response.data.data && response.data.data.CinemaList) {
      const list = response.data.data.CinemaList;
      console.log(`Found ${list.length} cinemas in CinemaList:`);
      list.forEach(c => {
        console.log(`- ID: ${c.Cinema_strID}, Name: "${c.Cinema_strName}", Branch: "${c.Cinema_strBranchCode}", URL: "${c.Cinema_strWebServiceURL}", License: "${c.Cinema_strLicenseNo}"`);
      });
    } else {
      console.log("Response did not contain CinemaList:", JSON.stringify(response.data).slice(0, 500));
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
