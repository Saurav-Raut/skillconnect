// Shared Geospatial & Distance Math Utilities for SkillConnect Web & Mobile

/**
 * Haversine formula to calculate distance in km between two coordinate pairs [lon, lat]
 */
export const calculateDistanceKm = (coords1, coords2) => {
  if (!coords1 || !coords2 || coords1.length < 2 || coords2.length < 2) return null;
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;

  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

/**
 * Calculate approximate ETA in minutes assuming average city speed of 25 km/h
 */
export const calculateEtaMinutes = (distanceKm) => {
  if (distanceKm == null || distanceKm < 0) return 10;
  const avgSpeedKmh = 25;
  const hours = distanceKm / avgSpeedKmh;
  const mins = Math.ceil(hours * 60) + 2; // +2 mins base buffer
  return Math.max(3, mins);
};

/**
 * Format distance for display (e.g., "1.2 km" or "800 m")
 */
export const formatDistanceDisplay = (distanceKm) => {
  if (distanceKm == null) return 'Unknown distance';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};
