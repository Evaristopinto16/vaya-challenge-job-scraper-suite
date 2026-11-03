const router = require("express").Router();
const jobs = require("./jobs.routes");
const sources = require("./sources.routes");
const pool = require("../database/pool");
const { syncAll } = require("../services/sync.service");

router.get("/health", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

router.use("/api/jobs", jobs);
router.use("/api/sources", sources);

router.post("/api/sync", async (req, res, next) => {
  try { res.json({ results: await syncAll() }); }
  catch (error) { next(error); }
});

router.get("/api/runs", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT r.*, s.name AS source_name, s.platform
       FROM fetch_runs r LEFT JOIN sources s ON s.id=r.source_id
       ORDER BY r.started_at DESC LIMIT 100`
    );
    res.json({ runs: result.rows });
  } catch (error) { next(error); }
});

module.exports = router;
