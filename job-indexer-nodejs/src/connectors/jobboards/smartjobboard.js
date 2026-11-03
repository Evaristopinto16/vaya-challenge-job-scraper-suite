const { fetchConfigured } = require("./generic");
module.exports = {
  platform: "smartjobboard",
  async fetch(source) {
    // Configure endpoint + itemsPath + fields, or listingUrl + selectors.
    return fetchConfigured(source);
  }
};
