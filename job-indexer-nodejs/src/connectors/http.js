const axios = require("axios");
const config = require("../config");

const http = axios.create({
  timeout: config.requestTimeoutMs,
  headers: {
    "User-Agent": config.userAgent,
    "Accept": "application/json,text/html;q=0.9,*/*;q=0.8"
  },
  maxRedirects: 5
});

async function getJson(url, options = {}) {
  const response = await http.get(url, options);
  return response.data;
}

async function getText(url, options = {}) {
  const response = await http.get(url, { ...options, responseType: "text" });
  return response.data;
}

module.exports = { http, getJson, getText };
