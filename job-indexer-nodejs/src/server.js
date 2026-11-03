const app = require("./app");
const config = require("./config");
const cron = require("node-cron");
const { syncAll } = require("./services/sync.service");

const server = app.listen(config.port, () => {
  console.log(`Job Indexer API listening on http://localhost:${config.port}`);
});

cron.schedule(config.syncCron, async () => {
  console.log("Scheduled source sync started.");
  try {
    const results = await syncAll();
    console.log("Scheduled sync finished:", results);
  } catch (error) {
    console.error("Scheduled sync failed:", error.message);
  }
});

async function shutdown() {
  console.log("Shutting down...");
  server.close(() => process.exit(0));
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
