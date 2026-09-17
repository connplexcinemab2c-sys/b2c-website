/**
 * WhatsApp UTM Attribution & Conversion Tracker
 * Captures UTM parameters from landing pages and stores them in a 30-day first-party cookie
 * and localStorage fallback so attribution survives normal customer browsing.
 */

const UTM_COOKIE_KEY = "connplex_utm";
const UTM_STORAGE_KEY = "connplex_utm_attribution";
const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

/**
 * Normalizes phone numbers to standard 91XXXXXXXXXX format
 */
export const normalizePhoneNumber = (phone) => {
  if (!phone) return null;
  const cleaned = String(phone).replace(/\D/g, "");
  if (!cleaned) return null;

  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `91${cleaned.slice(1)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return cleaned;
  }
  return cleaned;
};

/**
 * Reads a cookie by name
 */
const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
};

/**
 * Sets a cookie with Max-Age and cross-subdomain support
 */
const setCookie = (name, value, maxAgeSeconds) => {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(value);
  let cookieStr = `${name}=${encoded}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`;
  if (typeof window !== "undefined" && window.location) {
    if (window.location.protocol === "https:") {
      cookieStr += "; Secure";
    }
    const host = window.location.hostname;
    if (host.includes("theconnplex.com")) {
      cookieStr += "; domain=.theconnplex.com";
    }
  }
  document.cookie = cookieStr;
};

/**
 * Retrieves the currently active UTM attribution data.
 * Checks live URL parameters first, then first-party cookie, then localStorage.
 */
export const getStoredUtm = () => {
  try {
    // 1. Check live URL parameters first
    if (typeof window !== "undefined" && window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get("utm_source");
      const utmCampaign = params.get("utm_campaign");
      if (utmSource || utmCampaign) {
        return {
          utm_source: utmSource ? utmSource.trim().toLowerCase() : "direct",
          utm_campaign: utmCampaign ? utmCampaign.trim().toLowerCase() : null,
          utm_medium: params.get("utm_medium") ? params.get("utm_medium").trim().toLowerCase() : null,
          utm_content: params.get("utm_content") ? params.get("utm_content").trim() : null,
          utm_term: params.get("utm_term") ? params.get("utm_term").trim() : null,
        };
      }
    }

    // 2. Check first-party cookie
    const cookieVal = getCookie(UTM_COOKIE_KEY);
    if (cookieVal) {
      return JSON.parse(cookieVal);
    }

    // 3. Fallback to localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = window.localStorage.getItem(UTM_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (error) {
    console.warn("[UTM Tracker] Error reading stored UTM attribution:", error);
  }

  return null;
};

/**
 * Helper to append active UTM parameters to any params object for navigation
 */
export const appendUtmToParams = (params = {}) => {
  const active = getStoredUtm();
  if (active && active.utm_source && active.utm_source !== "direct") {
    return {
      ...params,
      utm_source: active.utm_source,
      ...(active.utm_campaign ? { utm_campaign: active.utm_campaign } : {}),
    };
  }
  return params;
};

/**
 * Scans current URL for UTM parameters.
 * If found, saves them in both cookie and localStorage for 30 days.
 * If not in URL, but active campaign UTM is stored (e.g. WhatsApp),
 * automatically preserves it in the browser's address bar.
 */
export const captureUtmFromUrl = () => {
  if (typeof window === "undefined" || !window.location) return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source");
    const utmCampaign = params.get("utm_campaign");
    const utmMedium = params.get("utm_medium");
    const utmContent = params.get("utm_content");
    const utmTerm = params.get("utm_term");

    // 1. If UTM params are present in current URL, persist them
    if (utmSource || utmCampaign) {
      const utmData = {
        utm_source: utmSource ? utmSource.trim().toLowerCase() : "direct",
        utm_campaign: utmCampaign ? utmCampaign.trim().toLowerCase() : null,
        utm_medium: utmMedium ? utmMedium.trim().toLowerCase() : null,
        utm_content: utmContent ? utmContent.trim() : null,
        utm_term: utmTerm ? utmTerm.trim() : null,
        captured_at: new Date().toISOString(),
        landing_url: window.location.pathname,
      };

      const payload = JSON.stringify(utmData);
      setCookie(UTM_COOKIE_KEY, payload, COOKIE_MAX_AGE_SECONDS);

      if (window.localStorage) {
        window.localStorage.setItem(UTM_STORAGE_KEY, payload);
      }

      console.log("[UTM Tracker] Stored campaign attribution:", utmData);
      return utmData;
    }

    // 2. If UTM params are missing from current URL, but an active campaign exists,
    // preserve them in the address bar so they aren't lost across page navigation.
    const stored = getStoredUtm();
    if (stored && stored.utm_source && stored.utm_source !== "direct") {
      const url = new URL(window.location.href);
      let updated = false;
      if (!url.searchParams.has("utm_source")) {
        url.searchParams.set("utm_source", stored.utm_source);
        updated = true;
      }
      if (stored.utm_campaign && !url.searchParams.has("utm_campaign")) {
        url.searchParams.set("utm_campaign", stored.utm_campaign);
        updated = true;
      }
      if (stored.utm_medium && !url.searchParams.has("utm_medium")) {
        url.searchParams.set("utm_medium", stored.utm_medium);
        updated = true;
      }
      if (updated) {
        window.history.replaceState(window.history.state, "", url.toString());
      }
      return stored;
    }
  } catch (error) {
    console.warn("[UTM Tracker] Error capturing UTM parameters:", error);
  }

  return getStoredUtm();
};

/**
 * Clears stored UTM attribution (useful for debugging/reset)
 */
export const clearStoredUtm = () => {
  if (typeof document !== "undefined") {
    let cookieStr = `${UTM_COOKIE_KEY}=; max-age=0; path=/; SameSite=Lax`;
    if (typeof window !== "undefined" && window.location) {
      if (window.location.protocol === "https:") {
        cookieStr += "; Secure";
      }
      const host = window.location.hostname;
      if (host.includes("theconnplex.com")) {
        cookieStr += "; domain=.theconnplex.com";
      }
    }
    document.cookie = cookieStr;
    document.cookie = `${UTM_COOKIE_KEY}=; max-age=0; path=/; SameSite=Lax`;
  }
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.removeItem(UTM_STORAGE_KEY);
  }
};

export default {
  captureUtmFromUrl,
  getStoredUtm,
  normalizePhoneNumber,
  clearStoredUtm,
  appendUtmToParams,
};
