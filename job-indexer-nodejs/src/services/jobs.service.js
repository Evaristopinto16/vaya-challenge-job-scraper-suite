const pool = require("../database/pool");
const { normalizeJob } = require("../utils/normalize");

async function upsertJobs(source, rawJobs) {
  const client = await pool.connect();
  let count = 0;
  try {
    await client.query("BEGIN");
    for (const raw of rawJobs) {
      const job = normalizeJob(raw, source);
      if (!job) continue;

      const inserted = await client.query(
        `INSERT INTO jobs
          (dedupe_key,title,company,description,location,source_url,application_url,salary,
           employment_type,remote,original_posted_at,status,first_seen_at,last_checked_at,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'active',NOW(),NOW(),NOW())
         ON CONFLICT (dedupe_key) DO UPDATE SET
           title=EXCLUDED.title,
           company=COALESCE(EXCLUDED.company,jobs.company),
           description=COALESCE(EXCLUDED.description,jobs.description),
           location=COALESCE(EXCLUDED.location,jobs.location),
           source_url=COALESCE(EXCLUDED.source_url,jobs.source_url),
           application_url=COALESCE(EXCLUDED.application_url,jobs.application_url),
           salary=COALESCE(EXCLUDED.salary,jobs.salary),
           employment_type=COALESCE(EXCLUDED.employment_type,jobs.employment_type),
           remote=COALESCE(EXCLUDED.remote,jobs.remote),
           original_posted_at=COALESCE(EXCLUDED.original_posted_at,jobs.original_posted_at),
           status='active',
           last_checked_at=NOW(),
           updated_at=NOW()
         RETURNING id`,
        [job.dedupeKey, job.title, job.company, job.description, job.location,
          job.sourceUrl, job.applicationUrl, job.salary, job.employmentType,
          job.remote, job.originalPostedAt]
      );

      const jobId = inserted.rows[0].id;
      await client.query(
        `INSERT INTO job_sources(job_id,source_id,external_id,source_url,application_url,last_seen_at)
         VALUES($1,$2,$3,$4,$5,NOW())
         ON CONFLICT(job_id,source_id,external_id) DO UPDATE SET
           source_url=EXCLUDED.source_url,
           application_url=EXCLUDED.application_url,
           last_seen_at=NOW()`,
        [jobId, source.id, job.externalId || job.sourceUrl || job.dedupeKey, job.sourceUrl, job.applicationUrl]
      );
      count++;
    }
    await client.query("COMMIT");
    return count;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function markMissingFromSourceClosed(source, seenExternalIds) {
  // Only called after a successful fetch. Do not close jobs after failed requests.
  const result = await pool.query(
    `UPDATE jobs j
     SET status='closed', updated_at=NOW()
     FROM job_sources js
     WHERE js.job_id=j.id AND js.source_id=$1
       AND NOT (js.external_id = ANY($2::text[]))
       AND j.status='active'`,
    [source.id, seenExternalIds]
  );
  return result.rowCount;
}

module.exports = { upsertJobs, markMissingFromSourceClosed };
