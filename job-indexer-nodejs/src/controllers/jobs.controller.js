const pool = require("../database/pool");

async function listJobs(req, res, next) {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit || "20", 10)));
    const offset = (page - 1) * limit;
    const values = [];
    const where = ["j.status = 'active'"];

    function addFilter(expression, value) {
      values.push(`%${value}%`);
      where.push(expression.replace("?", `$${values.length}`));
    }

    if (req.query.keyword) {
      addFilter("(j.title ILIKE ? OR j.description ILIKE ?)", req.query.keyword);
      // Replace second placeholder with same parameter index.
      where[where.length - 1] = `(j.title ILIKE $${values.length} OR j.description ILIKE $${values.length})`;
    }
    if (req.query.company) addFilter("j.company ILIKE ?", req.query.company);
    if (req.query.location) addFilter("j.location ILIKE ?", req.query.location);

    const whereSql = where.join(" AND ");
    const count = await pool.query(`SELECT COUNT(*)::int AS total FROM jobs j WHERE ${whereSql}`, values);
    const result = await pool.query(
      `SELECT j.*, COALESCE(
        (SELECT json_agg(json_build_object(
          'sourceId', s.id, 'sourceName', s.name, 'platform', s.platform,
          'sourceUrl', js.source_url, 'applicationUrl', js.application_url
        )) FROM job_sources js JOIN sources s ON s.id=js.source_id WHERE js.job_id=j.id),
        '[]'::json
      ) AS sources
       FROM jobs j WHERE ${whereSql}
       ORDER BY j.last_checked_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset]
    );
    res.json({ page, limit, total: count.rows[0].total, jobs: result.rows });
  } catch (error) { next(error); }
}

async function getJob(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT j.*,
       COALESCE((SELECT json_agg(json_build_object(
         'sourceId',s.id,'sourceName',s.name,'platform',s.platform,
         'sourceUrl',js.source_url,'applicationUrl',js.application_url
       )) FROM job_sources js JOIN sources s ON s.id=js.source_id WHERE js.job_id=j.id),'[]'::json) AS sources
       FROM jobs j WHERE j.id=$1`,
      [req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ error: "Job not found" });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
}

module.exports = { listJobs, getJob };
