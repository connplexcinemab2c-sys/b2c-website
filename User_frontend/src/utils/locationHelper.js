/**
 * Utility functions for user geolocation, nearest-city calculation,
 * and location persistence.
 */

// Fallback dictionary of known coordinates for cities/regions in Connplex
export const KNOWN_CITY_COORDINATES = {
  PATNA: { lat: 25.5941, long: 85.1376 },
  VADODARA: { lat: 22.3072, long: 73.1812 },
  SURAT: { lat: 21.1702, long: 72.8311 },
  JAMMU: { lat: 32.7266, long: 74.8570 },
  DARBHANGA: { lat: 26.1542, long: 85.8918 },
  SOLAPUR: { lat: 17.6599, long: 75.9064 },
  JAGDALPUR: { lat: 19.0748, long: 82.0090 },
  JAMSHEDPUR: { lat: 22.8046, long: 86.2029 },
  SHEIKHPURA: { lat: 25.1408, long: 85.8580 },
  AHMEDABAD: { lat: 23.0225, long: 72.5714 },
  RAJKOT: { lat: 22.3039, long: 70.8022 },
  MUMBAI: { lat: 19.0760, long: 72.8777 },
  PUNE: { lat: 18.5204, long: 73.8567 },
  DELHI: { lat: 28.7041, long: 77.1025 },
  GANDHINAGAR: { lat: 23.2156, long: 72.6369 },
  BHAVNAGAR: { lat: 21.7645, long: 72.1519 },
  JAMNAGAR: { lat: 22.4707, long: 70.0577 },
  JUNAGADH: { lat: 21.5222, long: 70.4579 },
  ANAND: { lat: 22.5645, long: 72.9289 },
  NADIAD: { lat: 22.6916, long: 72.8634 },
  MEHSANA: { lat: 23.5880, long: 72.3693 },
  BHARUCH: { lat: 21.7051, long: 72.9959 },
  ANKLESHWAR: { lat: 21.6264, long: 73.0033 },
  VAPI: { lat: 20.3893, long: 72.9106 },
  VALSAD: { lat: 20.5992, long: 72.9342 },
  NAVSARI: { lat: 20.9500, long: 72.9300 },
  MORBI: { lat: 22.8120, long: 70.8384 },
  GAYA: { lat: 24.7914, long: 85.0002 },
  MUZAFFARPUR: { lat: 26.1209, long: 85.3647 },
  BHAGALPUR: { lat: 25.2425, long: 86.9842 },
  RANCHI: { lat: 23.3441, long: 85.3096 },
  RAIPUR: { lat: 21.2514, long: 81.6296 },
  JAIPUR: { lat: 26.9124, long: 75.7873 },
  INDORE: { lat: 22.7196, long: 75.8577 },
  BHOPAL: { lat: 23.2599, long: 77.4126 },
  LUCKNOW: { lat: 26.8467, long: 80.9462 },
  KANPUR: { lat: 26.4499, long: 80.3319 },
  KOLKATA: { lat: 22.5726, long: 88.3639 },
  HYDERABAD: { lat: 17.3850, long: 78.4867 },
  BENGALURU: { lat: 12.9716, long: 77.5946 },
  BANGALORE: { lat: 12.9716, long: 77.5946 },
  CHENNAI: { lat: 13.0827, long: 80.2707 },
  CHANDIGARH: { lat: 30.7333, long: 76.7794 },
  AMRITSAR: { lat: 31.6340, long: 74.8723 },
  NAGPUR: { lat: 21.1458, long: 79.0882 },
  NASHIK: { lat: 19.9975, long: 73.7898 },
  AURANGABAD: { lat: 19.8762, long: 75.3433 },
};

/**
 * Great-circle distance between two latitude/longitude points in kilometers.
 */
export const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Resolve coordinates for a given region object.
 */
export const getCoordinatesForRegion = (regionObj) => {
  if (!regionObj) return null;

  const lat = parseFloat(regionObj.lat);
  const long = parseFloat(regionObj.long);
  if (!isNaN(lat) && !isNaN(long)) {
    return { lat, long };
  }

  const name = (regionObj.region || "").trim().toUpperCase();
  if (KNOWN_CITY_COORDINATES[name]) {
    return KNOWN_CITY_COORDINATES[name];
  }

  return null;
};

/**
 * Find the nearest region from a list of regions given user's lat & long.
 */
export const findNearestRegion = (userLat, userLong, regionList = []) => {
  if (!regionList || regionList.length === 0) return null;

  let nearestRegion = null;
  let minDistance = Number.MAX_SAFE_INTEGER;

  for (const reg of regionList) {
    const coords = getCoordinatesForRegion(reg);
    if (coords) {
      const distance = haversineDistanceKm(
        userLat,
        userLong,
        coords.lat,
        coords.long
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestRegion = reg;
      }
    }
  }

  // Fallback to first region if none matched coordinates
  if (!nearestRegion && regionList.length > 0) {
    nearestRegion = regionList[0];
    minDistance = 0;
  }

  return nearestRegion
    ? {
        region: nearestRegion,
        distanceKm: Math.round(minDistance * 10) / 10,
      }
    : null;
};

/**
 * Request user's current GPS coordinates using the browser Geolocation API.
 * Uses high accuracy = false and a 4s timeout for fast, non-blocking response.
 */
export const getCurrentUserCoordinates = (
  options = { enableHighAccuracy: false, timeout: 4000, maximumAge: 300000 }
) => {
  return new Promise((resolve, reject) => {
    if (!navigator || !navigator.geolocation) {
      reject({
        code: "NOT_SUPPORTED",
        message: "Geolocation is not supported by your browser.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: "gps",
        });
      },
      (error) => {
        let code = "UNKNOWN";
        let message = "Unable to retrieve GPS location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            code = "PERMISSION_DENIED";
            message = "Location permission was denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            code = "POSITION_UNAVAILABLE";
            message = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            code = "TIMEOUT";
            message = "Location request timed out.";
            break;
          default:
            break;
        }

        reject({ code, message, originalError: error });
      },
      options
    );
  });
};

/**
 * Fallback to IP-based geolocation when GPS is denied, timed out, or unavailable.
 * Calls free, CORS-enabled IP geolocation APIs.
 */
export const getIpBasedCoordinates = async () => {
  // 1. Try ipwho.is (fast, free, CORS-enabled)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch("https://ipwho.is/", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.latitude && data.longitude) {
        return {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          city: data.city,
          source: "ip",
        };
      }
    }
  } catch (e) {
    // Continue to next fallback
  }

  // 2. Try freeipapi.com
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch("https://freeipapi.com/api/json", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        return {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          city: data.cityName,
          source: "ip",
        };
      }
    }
  } catch (e) {
    // Both failed
  }

  return null;
};

/**
 * Auto-detect user's current location and find the nearest cinema / region.
 * 1. Tries GPS coordinates first.
 * 2. If GPS fails or is denied, falls back to IP-based geolocation.
 * 3. Matches nearest region using backend API and client-side Haversine formula.
 */
export const autoDetectNearestRegion = async (
  regionList = [],
  apiGetHandler,
  Api
) => {
  let coords = null;

  // Step 1: Try browser GPS
  try {
    coords = await getCurrentUserCoordinates();
  } catch (gpsError) {
    // GPS unavailable or denied - try IP geolocation
    coords = await getIpBasedCoordinates();
  }

  // If GPS didn't throw but returned null, try IP
  if (!coords) {
    coords = await getIpBasedCoordinates();
  }

  // If no coordinates could be determined, fallback to first region
  if (!coords) {
    if (regionList && regionList.length > 0) {
      return {
        success: true,
        region: regionList[0],
        distanceKm: 0,
        source: "fallback",
      };
    }
    return {
      success: false,
      message: "Could not detect location.",
      code: "NO_COORDS",
    };
  }

  // Step 2: Try backend near-by-region endpoint
  if (apiGetHandler && Api && Api.GET_GEO_LOCATION) {
    try {
      const res = await apiGetHandler(
        Api.GET_GEO_LOCATION,
        `${coords.latitude}/${coords.longitude}`
      );

      if (res?.status === 200 && res?.data && res.data._id) {
        const fullRegion =
          regionList.find((r) => r._id === res.data._id) || res.data;
        return {
          success: true,
          region: fullRegion,
          distanceKm: res.data.distance,
          coords,
          source: coords.source || "gps",
        };
      }
    } catch (apiErr) {
      console.warn("Backend near-by-region failed, using client-side calculation:", apiErr);
    }
  }

  // Step 3: Client-side Haversine distance matching
  const match = findNearestRegion(
    coords.latitude,
    coords.longitude,
    regionList
  );

  if (match && match.region) {
    return {
      success: true,
      region: match.region,
      distanceKm: match.distanceKm,
      coords,
      source: coords.source || "gps",
    };
  }

  // Final fallback to first region in list
  if (regionList && regionList.length > 0) {
    return {
      success: true,
      region: regionList[0],
      distanceKm: 0,
      source: "fallback",
    };
  }

  return {
    success: false,
    message: "No cinemas found near your location.",
    code: "NO_CINEMA_FOUND",
  };
};
