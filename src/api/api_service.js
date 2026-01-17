import axios from "axios";

// Ganti URL ini dengan alamat BASE_URL backend Go Anda
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Enable cookies
});

// Interceptor Request: Jaminan Token Selalu Terkirim
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "logged_in") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Set Content-Type default ke application/json (kecuali multipart)
    if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/auth/sign-in") {
        window.location.href = "/auth/sign-in";
      }
    }
    return Promise.reject(error);
  }
);

class ApiService {
  // Metode Login: Menerima data {username, password} dari frontend
  login(data) {
    return new Promise((resolve, reject) => {
      // Backend Go menggunakan field 'username' dan 'password'
      const loginPayload = {
        username: data.username,
        password: data.password,
      };

      api
        .post(`/admin/login`, loginPayload)
        .then((res) => resolve(res.data))
        .catch((er) => reject(er.response?.data)); // Mengambil data error dari respons
    });
  }

  get(endpoint) {
    return new Promise((resolve, reject) => {
      api
        .get(endpoint)
        .then((res) => resolve(res.data))
        .catch((er) => reject(er.response));
    });
  }

  // Metode POST umum (Menggunakan instance axios yang sudah di-interceptor)
  post(endpoint, data) {
    return api
      .post(endpoint, data)
      .then((res) => res.data)
      .catch((er) => Promise.reject(er.response));
  }

  // Metode POST dengan Document (Menangani Content-Type multipart)
  postWithDocument(endpoint, data) {
    return api
      .post(endpoint, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data)
      .catch((er) => Promise.reject(er.response));
  }

  // Metode DELETE
  delete(endpoint) {
    return api
      .delete(endpoint)
      .then((res) => res.data)
      .catch((er) => Promise.reject(er.response));
  }

  // Metode PUT
  put(endpoint, data) {
    return api
      .put(endpoint, data)
      .then((res) => res.data)
      .catch((er) => Promise.reject(er.response));
  }

  // Metode PUT dengan Document
  putWithDocument(endpoint, data) {
    return api
      .put(endpoint, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data)
      .catch((er) => Promise.reject(er.response));
  }
}

export default new ApiService();
