import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // mora biti npr. "http://localhost:5000"
  withCredentials: true,                   // jer koristiš CORS sa credentials
});

export const flightsApi = axios.create({
  baseURL: import.meta.env.VITE_FLIGHTS_API_URL,
});
