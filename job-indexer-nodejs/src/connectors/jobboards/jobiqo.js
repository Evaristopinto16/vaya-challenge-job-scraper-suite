const { fetchConfigured } = require("./generic");
module.exports = {
  platform: "jobiqo",
  async fetch(source) {
    // Configure the actual public feed/API or HTML selectors for this Jobiqo deployment.
    return fetchConfigured(source);
  }
};
