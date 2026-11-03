const { fetchConfigured } = require("./generic");
module.exports = {
  platform: "jobboardio",
  async fetch(source) {
    // Configure endpoint + itemsPath + fields, or listingUrl + selectors.
    return fetchConfigured(source);
  }
};
