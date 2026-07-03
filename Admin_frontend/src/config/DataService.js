import axios from "axios";

const API_ENDPOINT =
  import.meta.env.VITE_BASE_URL ||
  (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:3020/api"
    : "https://backend.theconnplex.com/api");

export const IMAGES_API_ENDPOINT =
  import.meta.env.VITE_IMAGE_URL ||
  (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:3020/api/uploads"
    : "https://backend.theconnplex.com/api/uploads");

const DataService = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    // "Content-type": "application/x-www-form-urlencoded",
    // Accept: "application/json",
  },
});

// DataService.interceptors.request.use(
//   async function (config) {
//     try {
//       const userToekn = localStorage.getItem("token");
//       config.headers.auth = userToekn;
//     } catch (error) {
//       console.log(error);
//     }
//     return config;
//   },
//   function (error) {
//     return Promise.reject(error);
//   }
// );

export default DataService;
