async function check() {
  try {
    const res = await fetch('https://api.github.com/repos/connplexcinemab2c-sys/b2c-website/actions/runs?per_page=5');
    const d = await res.json();
    for (const r of d.workflow_runs) {
      console.log(`Name: ${r.name}, RunID: ${r.id}, Conclusion: ${r.conclusion}`);
      if (r.conclusion === 'failure') {
        const jobsRes = await fetch(`https://api.github.com/repos/connplexcinemab2c-sys/b2c-website/actions/runs/${r.id}/jobs`);
        const jobsData = await jobsRes.json();
        jobsData.jobs.forEach(job => {
          console.log(`  Job Name: ${job.name}, Conclusion: ${job.conclusion}`);
          job.steps.forEach(step => {
            console.log(`    Step Name: ${step.name}, Conclusion: ${step.conclusion}`);
          });
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
}
check();
