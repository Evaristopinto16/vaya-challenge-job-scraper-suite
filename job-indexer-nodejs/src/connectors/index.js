const connectors = [
  require("./ats/greenhouse"),
  require("./ats/lever"),
  require("./ats/ashby"),
  require("./ats/smartrecruiters"),
  require("./ats/workable"),
  require("./jobboards/wp-job-manager"),
  require("./jobboards/niceboard"),
  require("./jobboards/jobiqo"),
  require("./jobboards/smartjobboard"),
  require("./jobboards/jobboardio")
];

const map = new Map(connectors.map(connector => [connector.platform, connector]));

function getConnector(platform) {
  const connector = map.get(String(platform || "").toLowerCase());
  if (!connector) throw new Error(`Unsupported platform: ${platform}`);
  return connector;
}

module.exports = { getConnector, supportedPlatforms: [...map.keys()] };
