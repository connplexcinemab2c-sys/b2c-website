async function getLogs() {
  const RUN_ID = '33251394966';
  try {
    console.log(`Fetching jobs for Run ID: ${RUN_ID}...`);
    const jobsRes = await fetch(`https://api.github.com/repos/connplexcinemab2c-sys/b2c-website/actions/runs/${RUN_ID}/jobs`);
    const jobsData = await jobsRes.json();
    const job = jobsData.jobs[0];
    
    console.log(`Job Name: ${job.name}, ID: ${job.id}, Status: ${job.status}, Conclusion: ${job.conclusion}`);

    console.log("Fetching logs...");
    const logsRes = await fetch(`https://api.github.com/repos/connplexcinemab2c-sys/b2c-website/actions/jobs/${job.id}/logs`);
    const logsText = await logsRes.text();
    
    console.log("LOGS (last 4000 chars):");
    if (logsText.length > 4000) {
      console.log(logsText.substring(logsText.length - 4000));
    } else {
      console.log(logsText);
    }
  } catch (err) {
    console.error(err);
  }
}
getLogs();
