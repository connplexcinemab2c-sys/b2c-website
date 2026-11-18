/**
 * Utility functions for user geolocation, nearest-city calculation,
 * and location persistence.
 */

// Comprehensive dictionary of known coordinates for cities/regions in Connplex & major Indian cities
export const KNOWN_CITY_COORDINATES = {
  // Connplex Active Regions
  AHILYANAGAR: { lat: 19.0948, long: 74.7480 },
  AHMEDNAGAR: { lat: 19.0948, long: 74.7480 },
  AHMEDABAD: { lat: 23.0225, long: 72.5714 },
  ANAND: { lat: 22.5645, long: 72.9289 },
  ASSAM: { lat: 26.1445, long: 91.7362 },
  BALOTRA: { lat: 25.8344, long: 72.2405 },
  BETTIAH: { lat: 26.8021, long: 84.5028 },
  BHAGALPUR: { lat: 25.2425, long: 86.9842 },
  BHARUCH: { lat: 21.7051, long: 72.9959 },
  BILASPUR: { lat: 22.0797, long: 82.1409 },
  DARBHANGA: { lat: 26.1542, long: 85.8918 },
  DHRANGADHRA: { lat: 22.9934, long: 71.4632 },
  GANDHINAGAR: { lat: 23.2156, long: 72.6369 },
  GURUGRAM: { lat: 28.4595, long: 77.0266 },
  GURGAON: { lat: 28.4595, long: 77.0266 },
  HYDERABAD: { lat: 17.3850, long: 78.4867 },
  JAGDALPUR: { lat: 19.0748, long: 82.0090 },
  JAJPUR: { lat: 20.8492, long: 86.3364 },
  JAMMU: { lat: 32.7266, long: 74.8570 },
  JAMSHEDPUR: { lat: 22.8046, long: 86.2029 },
  JUNAGADH: { lat: 21.5222, long: 70.4579 },
  KATIHAR: { lat: 25.5398, long: 87.5714 },
  KORBA: { lat: 22.3595, long: 82.7501 },
  MADHUBANI: { lat: 26.3541, long: 86.0718 },
  MEHSANA: { lat: 23.5880, long: 72.3693 },
  MUNDRA: { lat: 22.8404, long: 69.7259 },
  MUZAFFARPUR: { lat: 26.1209, long: 85.3647 },
  NAWADA: { lat: 24.8872, long: 85.5428 },
  PATNA: { lat: 25.5941, long: 85.1376 },
  PHULBANI: { lat: 20.4744, long: 84.2330 },
  PUNE: { lat: 18.5204, long: 73.8567 },
  RAJKOT: { lat: 22.3039, long: 70.8022 },
  SANGAMNER: { lat: 19.5760, long: 74.2070 },
  SHEIKHPURA: { lat: 25.1408, long: 85.8580 },
  SIWAN: { lat: 26.2204, long: 84.3567 },
  SOLAPUR: { lat: 17.6599, long: 75.9064 },
  TADEPALLIGUDEM: { lat: 16.8143, long: 81.5268 },
  UMERKOTE: { lat: 19.6644, long: 82.2081 },
  VADODARA: { lat: 22.3072, long: 73.1812 },

  // Surrounding Indian Cities & Metros
  SURAT: { lat: 21.1702, long: 72.8311 },
  MUMBAI: { lat: 19.0760, long: 72.8777 },
  DELHI: { lat: 28.7041, long: 77.1025 },
  NOIDA: { lat: 28.5355, long: 77.3910 },
  FARIDABAD: { lat: 28.4089, long: 77.3178 },
  GHAZIABAD: { lat: 28.6692, long: 77.4538 },
  BHAVNAGAR: { lat: 21.7645, long: 72.1519 },
  JAMNAGAR: { lat: 22.4707, long: 70.0577 },
  NADIAD: { lat: 22.6916, long: 72.8634 },
  ANKLESHWAR: { lat: 21.6264, long: 73.0033 },
  VAPI: { lat: 20.3893, long: 72.9106 },
  VALSAD: { lat: 20.5992, long: 72.9342 },
  NAVSARI: { lat: 20.9500, long: 72.9300 },
  MORBI: { lat: 22.8120, long: 70.8384 },
  GAYA: { lat: 24.7914, long: 85.0002 },
  RANCHI: { lat: 23.3441, long: 85.3096 },
  RAIPUR: { lat: 21.2514, long: 81.6296 },
  JAIPUR: { lat: 26.9124, long: 75.7873 },
  INDORE: { lat: 22.7196, long: 75.8577 },
  BHOPAL: { lat: 23.2599, long: 77.4126 },
  LUCKNOW: { lat: 26.8467, long: 80.9462 },
  KANPUR: { lat: 26.4499, long: 80.3319 },
  KOLKATA: { lat: 22.5726, long: 88.3639 },
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
 */
export const getCurrentUserCoordinates = (
  options = { enableHighAccuracy: false, timeout: 3500, maximumAge: 300000 }
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
 * Fast, silent IP-based geolocation.
 * Directly fetches live city and coordinates with ZERO permission prompts.
 * Uses Promise.any to race multiple fast, CORS-enabled endpoints concurrently.
 */
export const getIpBasedCoordinates = async () => {
  const fetchers = [
    // 1. ipwho.is (fastest, free, CORS)
    async () => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);
      try {
        const res = await fetch("https://ipwho.is/", { signal: controller.signal });
        clearTimeout(id);
        if (res.ok) {
          const d = await res.json();
          if (d && d.success && d.latitude && d.longitude) {
            return {
              latitude: parseFloat(d.latitude),
              longitude: parseFloat(d.longitude),
              city: d.city,
              source: "ip",
            };
          }
        }
      } catch (e) {
        clearTimeout(id);
      }
      throw new Error("ipwho failed");
    },
    // 2. freeipapi.com (fast fallback)
    async () => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);
      try {
        const res = await fetch("https://freeipapi.com/api/json", { signal: controller.signal });
        clearTimeout(id);
        if (res.ok) {
          const d = await res.json();
          if (d && d.latitude && d.longitude) {
            return {
              latitude: parseFloat(d.latitude),
              longitude: parseFloat(d.longitude),
              city: d.cityName,
              source: "ip",
            };
          }
        }
      } catch (e) {
        clearTimeout(id);
      }
      throw new Error("freeipapi failed");
    },
    // 3. ipquery.io (reliable tertiary fallback)
    async () => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);
      try {
        const res = await fetch("https://api.ipquery.io/?format=json", { signal: controller.signal });
        clearTimeout(id);
        if (res.ok) {
          const d = await res.json();
          if (d && d.location && d.location.latitude && d.location.longitude) {
            return {
              latitude: parseFloat(d.location.latitude),
              longitude: parseFloat(d.location.longitude),
              city: d.location.city,
              source: "ip",
            };
          }
        }
      } catch (e) {
        clearTimeout(id);
      }
      throw new Error("ipquery failed");
    },
  ];

  try {
    const coords = await Promise.any(fetchers.map((fn) => fn()));
    if (coords && coords.latitude && coords.longitude) {
      return coords;
    }
  } catch (err) {
    // All IP providers failed
  }

  return null;
};

/**
 * Auto-detect user's current live location and select nearest cinema region.
 *
 * When `isAutoInitial` is true (website open):
 * - It directly fetches live location WITHOUT asking the user for permission.
 * - If browser GPS permission was already granted previously, it uses GPS silently.
 * - Otherwise, it uses silent live IP geolocation (zero prompts).
 * - Matches the closest cinema region and selects it automatically.
 * - Never shows "Select City" modal on open.
 *
 * When `isAutoInitial` is false (manual button click):
 * - Prompts GPS coordinates to give highest precision.
 */
export const autoDetectNearestRegion = async (
  regionList = [],
  apiGetHandler,
  Api,
  options = { isAutoInitial: false }
) => {
  const isAutoInitial = Boolean(options?.isAutoInitial);
  let coords = null;

  if (isAutoInitial) {
    // 1. Check if browser GPS permission was already granted beforehand
    if (
      typeof navigator !== "undefined" &&
      navigator.permissions &&
      navigator.permissions.query
    ) {
      try {
        const permStatus = await navigator.permissions.query({
          name: "geolocation",
        });
        if (permStatus && permStatus.state === "granted") {
          coords = await getCurrentUserCoordinates({
            enableHighAccuracy: false,
            timeout: 2000,
            maximumAge: 300000,
          }).catch(() => null);
        }
      } catch (e) {
        // Query not supported or failed, proceed silently
      }
    }

    // 2. If no granted GPS coords, directly fetch live location via IP (never prompts!)
    if (!coords) {
      coords = await getIpBasedCoordinates();
    }
  } else {
    // Customer explicitly clicked "Auto-detect My Location" in the modal:
    // Prompt for GPS first, then fallback to IP
    try {
      coords = await getCurrentUserCoordinates();
    } catch (gpsError) {
      coords = await getIpBasedCoordinates();
    }
  }

  // If no coordinates could be determined, fallback safely to first region
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
          source: coords.source || "ip",
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
      source: coords.source || "ip",
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
