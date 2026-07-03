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

export const DataService = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    "X-Device-Type": "web",
  },
});

const apiGetHandler = (url, payload, auth) => {
  if (auth) {
    DataService.defaults.headers.common.auth = auth;
  } else {
    delete DataService.defaults.headers.common.auth;
  }
  if (payload) {
    return DataService.get(url + "/" + payload)
      .then((res) => {
        return res?.data;
      })
      .catch((err) => {
        return err?.response?.data;
      });
  } else {
    return DataService.get(url)
      .then((res) => {
        return res?.data;
      })
      .catch((err) => {
        return err?.response?.data;
      });
  }
};
const apiGetHandlerWithQuery = (url, payload, auth) => {
  if (auth) {
    DataService.defaults.headers.common.auth = auth;
  } else {
    delete DataService.defaults.headers.common.auth;
  }
  return DataService.get(url + payload)
    .then((res) => {
      return res?.data;
    })
    .catch((err) => {
      return err?.response?.data;
    });
};
const apiPostHandler = (url, payload, auth) => {
  if (auth) {
    DataService.defaults.headers.common.auth = auth;
  } else {
    delete DataService.defaults.headers.common.auth;
  }
  return DataService.post(url, payload)
    .then((res) => {
      return res?.data;
    })
    .catch((err) => {
      return err?.response?.data;
    });
};
const apiPostHandlerXml = (auth, url, payload) => {
  DataService.defaults.headers.common["Content-Type"] = "application/xml";
  DataService.defaults.headers.common.Accept = "application/xml";
  if (auth) {
    DataService.defaults.headers.common.auth = auth;
  } else {
    delete DataService.defaults.headers.common.auth;
  }
  return DataService.post(url, payload)
    .then((res) => {
      return res?.data;
    })
    .catch((err) => {
      return err?.response?.data;
    });
};

export {
  apiGetHandler,
  apiPostHandler,
  apiPostHandlerXml,
  apiGetHandlerWithQuery,
};
