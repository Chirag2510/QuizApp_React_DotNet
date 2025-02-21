import axios from "axios";

export const BASE_URL = "http://localhost:5220/";

export const ENDPOINTS = {
  login: "Participants/login",
  signup: "Participants/signup",
  logout: "Participants/logout",
  participant: "Participants",
  question: "Questions",
  answer: "Questions/GetAnswers",
};

const axiosInstance = axios.create({
  baseURL: BASE_URL + "api/",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = JSON.parse(localStorage.getItem("context")).authToken;
    console.log('Index js', token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const createAPIEndpoint = (endpoint) => {
  let url = endpoint + "/";

  return {
    fetch: () => axiosInstance.get(url),
    fetchById: (id) => axiosInstance.get(url + id),
    post: (newRecord) => axiosInstance.post(url, newRecord),
    put: (id, updatedRecord) => axiosInstance.put(url + id, updatedRecord),
    delete: (id) => axiosInstance.delete(url + id),
  };
};