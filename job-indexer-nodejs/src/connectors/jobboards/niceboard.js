const { fetchConfigured } = require("./generic");
module.exports = {
  platform: "niceboard",
  async fetch(source) {
    // Niceboard installations may expose different endpoints. Supply endpoint + field map,
    // or listingUrl + CSS selectors in source.config.
    return fetchConfigured(source);
  }
};
