const pool = require("../database/pool");
const { supportedPlatforms } = require("../connectors");
const { syncSource } = require("../services/sync.service");

async function listSources(req, res, next) {
  try {
    const result = await pool.query("SELECT * FROM sources ORDER BY id");
    res.json({ supportedPlatforms, sources: result.rows });
  } catch (error) { next(error); }
}

async function createSource(req, res, next) {
  try {
    const { name, platform, identifier = null, baseUrl = null, config = {}, enabled = true } = req.body;
    if (!name || !platform) return res.status(400).json({ error: "name and platform are required" });
    if (!supportedPlatforms.includes(String(platform).toLowerCase())) {
      return res.status(400).json({ error: "Unsupported platform", supportedPlatforms });
    }
    const result = await pool.query(
      `INSERT INTO sources(name,platform,identifier,base_url,config,enabled)
       VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, String(platform).toLowerCase(), identifier, baseUrl, JSON.stringify(config), enabled]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
}

async function updateSource(req, res, next) {
  try {
    const { name, identifier, baseUrl, config, enabled } = req.body;
    const result = await pool.query(
      `UPDATE sources SET
       name=COALESCE($1,name),
       identifier=COALESCE($2,identifier),
       base_url=COALESCE($3,base_url),
       config=COALESCE($4,config),
       enabled=COALESCE($5,enabled),
       updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [name ?? null, identifier ?? null, baseUrl ?? null,
       config === undefined ? null : JSON.stringify(config), enabled ?? null, req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ error: "Source not found" });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
}

async function deleteSource(req, res, next) {
  try {
    const result = await pool.query("DELETE FROM sources WHERE id=$1 RETURNING id", [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: "Source not found" });
    res.status(204).end();
  } catch (error) { next(error); }
}

async function syncOne(req, res, next) {
  try {
    const result = await pool.query("SELECT * FROM sources WHERE id=$1", [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: "Source not found" });
    res.json(await syncSource(result.rows[0]));
  } catch (error) { next(error); }
}

module.exports = { listSources, createSource, updateSource, deleteSource, syncOne };
