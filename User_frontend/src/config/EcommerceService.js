import axios from "axios";

export const ECOMMERCE_API_ENDPOINT =
  import.meta.env.VITE_ECOMMERCE_BASE_URL ||
  (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:3067/api"
    : "https://admin.theconnplex.com/ecommerce-api");

export const ECOMMERCE_IMAGES_API_ENDPOINT =
  import.meta.env.VITE_ECOMMERCE_IMAGE_URL ||
  (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:3067/api/uploads"
    : "https://admin.theconnplex.com/ecommerce-api/uploads");

const EcommerceService = axios.create({
  baseURL: ECOMMERCE_API_ENDPOINT,
});

export default EcommerceService;
