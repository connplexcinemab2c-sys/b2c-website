async function getLogs() {
  try {
    // Get the latest run
    const res = await fetch('https://api.github.com/repos/connplexcinemab2c-sys/b2c-website/actions/runs?per_page=1');
    const d = await res.json();
    const run = d.workflow_runs[0];
    console.log(`Latest Run Name: ${run.name}, ID: ${run.id}`);

    // Get jobs for the latest run
    const jobsRes = await fetch(`https://api.github.com/repos/connplexcinemab2c-sys/b2c-website/actions/runs/${run.id}/jobs`);
    const jobsData = await jobsRes.json();
    const job = jobsData.jobs[0];
    console.log(`Job Name: ${job.name}, ID: ${job.id}, Status: ${job.status}, Conclusion: ${job.conclusion}`);

    // Fetch logs
    const logsRes = await fetch(`https://api.github.com/repos/connplexcinemab2c-sys/b2c-website/actions/jobs/${job.id}/logs`);
    const logsText = await logsRes.text();
    console.log("LOGS (first 1000 chars):");
    console.log(logsText.substring(0, 1000));
    console.log("LOGS (last 1000 chars):");
    console.log(logsText.substring(logsText.length - 1000));
  } catch (err) {
    console.error(err);
  }
}
getLogs();
