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
 * Sets a cookie with Max-Age
 */
const setCookie = (name, value, maxAgeSeconds) => {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(value);
  document.cookie = `${name}=${encoded}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`;
};

/**
 * Scans the current window URL for UTM parameters.
 * If found, saves them in both a first-party cookie and localStorage for 30 days.
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
  } catch (error) {
    console.warn("[UTM Tracker] Error capturing UTM parameters:", error);
  }

  return getStoredUtm();
};

/**
 * Retrieves the currently active UTM attribution data.
 * Checks first-party cookie first, then falls back to localStorage.
 */
export const getStoredUtm = () => {
  try {
    // 1. Check first-party cookie
    const cookieVal = getCookie(UTM_COOKIE_KEY);
    if (cookieVal) {
      return JSON.parse(cookieVal);
    }

    // 2. Fallback to localStorage
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
 * Clears stored UTM attribution (useful for debugging/reset)
 */
export const clearStoredUtm = () => {
  if (typeof document !== "undefined") {
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
};
