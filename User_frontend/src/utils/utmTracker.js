/**
 * WhatsApp UTM Attribution & Conversion Tracker
 * Captures UTM parameters, WhatsApp referrers, and In-App browser signatures.
 * Stores attribution with cross-subdomain cookie (.theconnplex.com), sessionStorage,
 * and localStorage fallbacks with a 24-hour window, cleared upon booking completion.
 */

const UTM_COOKIE_KEY = "connplex_utm";
const UTM_STORAGE_KEY = "connplex_utm_attribution";
const COOKIE_MAX_AGE_SECONDS = 24 * 60 * 60; // 24 hours attribution window

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
 * Checks if referrer or user-agent is definitely WhatsApp
 */
const detectWhatsAppSource = () => {
  try {
    if (typeof window === "undefined") return false;

    // 1. In-App browser User-Agent signature (WA4A = WhatsApp Android, WAiOS = WhatsApp iOS)
    if (navigator && navigator.userAgent && /WA4A|WAiOS|WhatsApp/i.test(navigator.userAgent)) {
      return true;
    }

    // 2. Document Referrer from WhatsApp
    if (document && document.referrer) {
      const ref = document.referrer.toLowerCase();
      if (
        ref.includes("whatsapp") ||
        ref.includes("com.whatsapp") ||
        ref.includes("l.wl.co")
      ) {
        return true;
      }
    }
  } catch (err) {
    console.warn("[UTM Tracker] Error detecting WhatsApp source:", err);
  }
  return false;
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
 * Checks live URL parameters first, then sessionStorage, then first-party cookie, then localStorage.
 */
export const getStoredUtm = () => {
  try {
    // 1. Check live URL parameters first
    if (typeof window !== "undefined" && window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const rawSource = params.get("utm_source") || params.get("source") || params.get("ref");
      const utmCampaign = params.get("utm_campaign") || params.get("campaign");
      const utmMedium = params.get("utm_medium");

      let resolvedSource = rawSource ? rawSource.trim().toLowerCase() : null;
      if (resolvedSource === "wa" || resolvedSource === "wp") {
        resolvedSource = "whatsapp";
      }
      if (!resolvedSource && utmMedium && utmMedium.trim().toLowerCase() === "whatsapp") {
        resolvedSource = "whatsapp";
      }

      if (resolvedSource || utmCampaign) {
        return {
          utm_source: resolvedSource || "direct",
          utm_campaign: utmCampaign ? utmCampaign.trim().toLowerCase() : null,
          utm_medium: utmMedium ? utmMedium.trim().toLowerCase() : null,
          utm_content: params.get("utm_content") ? params.get("utm_content").trim() : null,
          utm_term: params.get("utm_term") ? params.get("utm_term").trim() : null,
        };
      }
    }

    // 2. Check sessionStorage
    if (typeof window !== "undefined" && window.sessionStorage) {
      const sessionStored = window.sessionStorage.getItem(UTM_STORAGE_KEY);
      if (sessionStored) {
        const parsed = JSON.parse(sessionStored);
        if (parsed && parsed.utm_source) return parsed;
      }
    }

    // 3. Check first-party cookie
    const cookieVal = getCookie(UTM_COOKIE_KEY);
    if (cookieVal) {
      const parsed = JSON.parse(cookieVal);
      if (parsed && parsed.utm_source) return parsed;
    }

    // 4. Fallback to localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = window.localStorage.getItem(UTM_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.utm_source) return parsed;
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
 * Scans current URL, referrer, and user-agent for UTM parameters.
 * If found, saves them in cookie, sessionStorage, and localStorage for 24 hours.
 */
export const captureUtmFromUrl = () => {
  if (typeof window === "undefined" || !window.location) return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const rawSource = params.get("utm_source") || params.get("source") || params.get("ref");
    const utmCampaign = params.get("utm_campaign") || params.get("campaign");
    const utmMedium = params.get("utm_medium");
    const utmContent = params.get("utm_content");
    const utmTerm = params.get("utm_term");

    let resolvedSource = rawSource ? rawSource.trim().toLowerCase() : null;
    if (resolvedSource === "wa" || resolvedSource === "wp") {
      resolvedSource = "whatsapp";
    }
    if (!resolvedSource && utmMedium && utmMedium.trim().toLowerCase() === "whatsapp") {
      resolvedSource = "whatsapp";
    }

    // Auto-detect WhatsApp referrer or in-app browser if not specified
    if (!resolvedSource && detectWhatsAppSource()) {
      resolvedSource = "whatsapp";
    }

    // 1. If UTM params or WhatsApp referral are detected, persist them
    if (resolvedSource || utmCampaign) {
      const utmData = {
        utm_source: resolvedSource || "direct",
        utm_campaign: utmCampaign ? utmCampaign.trim().toLowerCase() : null,
        utm_medium: utmMedium ? utmMedium.trim().toLowerCase() : null,
        utm_content: utmContent ? utmContent.trim() : null,
        utm_term: utmTerm ? utmTerm.trim() : null,
        captured_at: new Date().toISOString(),
        landing_url: window.location.pathname,
      };

      const payload = JSON.stringify(utmData);
      setCookie(UTM_COOKIE_KEY, payload, COOKIE_MAX_AGE_SECONDS);

      if (window.sessionStorage) {
        window.sessionStorage.setItem(UTM_STORAGE_KEY, payload);
      }
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
 * Clears stored UTM attribution upon successful booking checkout
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
  if (typeof window !== "undefined") {
    if (window.sessionStorage) {
      window.sessionStorage.removeItem(UTM_STORAGE_KEY);
    }
    if (window.localStorage) {
      window.localStorage.removeItem(UTM_STORAGE_KEY);
    }
  }
};

export default {
  captureUtmFromUrl,
  getStoredUtm,
  normalizePhoneNumber,
  clearStoredUtm,
  appendUtmToParams,
};
