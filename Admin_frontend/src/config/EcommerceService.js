import axios from "axios";

const API_ENDPOINT =
  import.meta.env.VITE_ECOMMERCE_BASE_URL ||
  (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:3067/api"
    : "https://shop-api.theconnplex.com/api/");

export const ECOMMERCE_IMAGES_API_ENDPOINT =
  import.meta.env.VITE_ECOMMERCE_IMAGE_URL ||
  (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:3067/api/uploads"
    : "https://shop-api.theconnplex.com/api/uploads");

const EcommerceService = axios.create({
  baseURL: API_ENDPOINT,
});

export default EcommerceService;
