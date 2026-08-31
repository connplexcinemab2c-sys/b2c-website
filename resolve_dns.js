import dns from "dns";

dns.resolve4("backend.theconnplex.com", (err, addresses) => {
  if (err) {
    console.error("DNS Resolution Error:", err);
  } else {
    console.log("IP Addresses for backend.theconnplex.com:", addresses);
  }
});

dns.resolve4("admin.theconnplex.com", (err, addresses) => {
  if (err) {
    console.error("DNS Resolution Error:", err);
  } else {
    console.log("IP Addresses for admin.theconnplex.com:", addresses);
  }
});
