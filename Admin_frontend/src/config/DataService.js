import axios from "axios";

const API_ENDPOINT = import.meta.env.VITE_BASE_URL;
// export const IMAGES_API_ENDPOINT = `${import.meta.env.VITE_BASE_URL}/uploads`;
export const IMAGES_API_ENDPOINT = import.meta.env.VITE_IMAGE_URL;

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
