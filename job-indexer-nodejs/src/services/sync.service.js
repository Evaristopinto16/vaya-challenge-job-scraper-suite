const pool = require("../database/pool");
const { getConnector } = require("../connectors");
const { upsertJobs, markMissingFromSourceClosed } = require("./jobs.service");

async function syncSource(source) {
  const run = await pool.query(
    "INSERT INTO fetch_runs(source_id,status) VALUES($1,'running') RETURNING id",
    [source.id]
  );
  const runId = run.rows[0].id;

  try {
    const connector = getConnector(source.platform);
    const rawJobs = await connector.fetch(source);
    if (!Array.isArray(rawJobs)) throw new Error("Connector must return an array.");

    const saved = await upsertJobs(source, rawJobs);
    const seenIds = rawJobs
      .map(j => j.externalId || j.id || j.slug || j.url)
      .filter(Boolean)
      .map(String);

    // If no stable IDs are provided, do not close existing jobs automatically.
    if (seenIds.length > 0) {
      await markMissingFromSourceClosed(source, seenIds);
    }

    await pool.query(
      "UPDATE fetch_runs SET status='success',jobs_found=$1,finished_at=NOW() WHERE id=$2",
      [saved, runId]
    );
    return { sourceId: source.id, status: "success", jobsFound: saved };
  } catch (error) {
    await pool.query(
      "UPDATE fetch_runs SET status='failed',error=$1,finished_at=NOW() WHERE id=$2",
      [String(error.message || error).slice(0, 4000), runId]
    );
    return { sourceId: source.id, status: "failed", error: error.message };
  }
}

async function syncAll() {
  const { rows } = await pool.query("SELECT * FROM sources WHERE enabled=true ORDER BY id");
  const results = [];
  // Sequential sync avoids hammering many source sites at once.
  for (const source of rows) results.push(await syncSource(source));
  return results;
}

module.exports = { syncSource, syncAll };
