async function checkRecentRuns() {
  const res = await fetch("https://api.github.com/repos/connplexcinemab2c-sys/b2c-website/actions/runs?per_page=10");
  const data = await res.json();
  console.log("Recent workflow runs:");
  for (const r of data.workflow_runs || []) {
    console.log({
      name: r.name,
      id: r.id,
      head_branch: r.head_branch,
      head_sha: r.head_sha.substring(0, 7),
      status: r.status,
      conclusion: r.conclusion,
      created_at: r.created_at
    });
  }
}

checkRecentRuns();
