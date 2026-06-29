import axios from "axios";

// Local
// const API_ENDPOINT = "http://localhost:3067/api";
// export const ECOMMERCE_IMAGES_API_ENDPOINT = "http://localhost:3067/api/uploads";

// Live
const API_ENDPOINT = "https://shop-api.theconnplex.com/api/";
// export const ECOMMERCE_IMAGES_API_ENDPOINT = "http://localhost:3067/api/uploads";
export const ECOMMERCE_IMAGES_API_ENDPOINT =
  "https://shop-api.theconnplex.com/api/uploads";

const EcommerceService = axios.create({
  baseURL: API_ENDPOINT,
});

export default EcommerceService;
