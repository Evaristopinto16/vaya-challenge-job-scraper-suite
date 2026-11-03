const { syncAll } = require("../services/sync.service");
const pool = require("../database/pool");

syncAll()
  .then(results => console.log(JSON.stringify(results, null, 2)))
  .catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => pool.end());
