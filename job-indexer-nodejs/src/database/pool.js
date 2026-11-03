const { Pool } = require("pg");
const config = require("../config");

if (!config.databaseUrl) {
  console.warn("DATABASE_URL not set. Database operations will fail until configured.");
}

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseSsl ? { rejectUnauthorized: false } : false
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

module.exports = pool;
