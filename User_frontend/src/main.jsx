import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { Provider } from "react-redux";
import Store from "./redux/Store";
import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
// import { trackPageView } from "./utils/Analytics";

// ✅ Sentry Setup
// import * as Sentry from "@sentry/react";
// import { BrowserTracing } from "@sentry/tracing";

// // ✅ Sentry Initialization
// Sentry.init({
//    dsn: "https://c75c93e6ee40fe7903a884fd50b0f65a@o4509161799417856.ingest.us.sentry.io/4509610534109184",
//   sendDefaultPii: true,
//   integrations: (defaults) => {
//     const baseIntegrations = [...defaults];

//     if (import.meta.VITE_ENV === "production") {
//       baseIntegrations.push(
//         Sentry.browserTracingIntegration({ routingInstrumentation: Sentry.reactRouterV6Instrumentation(BrowserRouter) }),
//         Sentry.replayIntegration()
//       );
//     }

//     return baseIntegrations;
//   },
//   tracesSampleRate: import.meta.VITE_ENV === "production" ? 1.0 : 0.0,
//   replaysSessionSampleRate: import.meta.VITE_ENV === "production" ? 0.1 : 0.0,
//   replaysOnErrorSampleRate: import.meta.VITE_ENV === "production" ? 1.0 : 0.0,
// });

const RouteChangeTracker = () => {
  const location = useLocation();

  // useEffect(() => {
  //   trackPageView(location.pathname + location.search);
  // }, [location]);

  return null;
};

const persistStore = Store();

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  // <React.StrictMode> // Optional: Enable in dev for strict checks
  <Provider store={persistStore.store}>
    <PersistGate loading={null} persistor={persistStore.persistor}>
      <BrowserRouter>
        <HelmetProvider>
          <RouteChangeTracker />
          {/* <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}> */}
          <App />
          {/* </Sentry.ErrorBoundary> */}
        </HelmetProvider>
      </BrowserRouter>
    </PersistGate>
  </Provider>
  // </React.StrictMode>
);

// Optional: Web Vitals
reportWebVitals();

// Optional: Disable all logs in production
if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.error = () => {};
  console.debug = () => {};
}
