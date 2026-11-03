require("dotenv").config();

module.exports = {
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: process.env.DATABASE_SSL === "true",
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 20000),
  userAgent: process.env.USER_AGENT || "JobIndexer/1.0",
  syncCron: process.env.SYNC_CRON || "0 */6 * * *",
  workableToken: process.env.WORKABLE_TOKEN || "",
  workableAccount: process.env.WORKABLE_ACCOUNT || ""
};
