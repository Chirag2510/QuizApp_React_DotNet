const axios = require("axios");

const BASE_URL = "http://localhost:5220/";

const ENDPOINTS = {
  participant: "Participants",
  question: "Questions",
  answer: "Questions/GetAnswers",
};

const createAPIEndpoint = (endpoint) => {
  let url = BASE_URL + "api/" + endpoint + "/";

  return {
    fetch: () => axios.get(url),
    fetchById: (id) => axios.get(url + id),
    post: (newRecord) => axios.post(url, newRecord),
    put: (id, updatedRecord) => axios.put(url + id, updatedRecord),
    delete: (id) => axios.delete(url + id),
  };
};

module.exports = {
  BASE_URL,
  ENDPOINTS,
  createAPIEndpoint,
};
