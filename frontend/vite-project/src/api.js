import axios from "axios";

console.log("========== API CONFIG ==========");
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("VITE_FLIGHTS_API_URL:", import.meta.env.VITE_FLIGHTS_API_URL);
console.log("================================");

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const flightsApi = axios.create({
  baseURL: import.meta.env.VITE_FLIGHTS_API_URL,
});