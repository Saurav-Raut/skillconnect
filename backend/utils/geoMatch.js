const Worker = require('../models/Worker');

/**
 * Haversine formula to calculate distance in kilometers between two [lng, lat] coordinates
 */
const calculateDistanceKm = (coords1, coords2) => {
  if (!coords1 || !coords2 || coords1.length !== 2 || coords2.length !== 2) {
    return 0;
  }
  const [lng1, lat1] = coords1;
  const [lng2, lat2] = coords2;

  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in kilometers

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

/**
 * Geographically query MongoDB for available workers matching skill within radius
 */
const findNearbyAvailableWorkers = async ({
  skill,
  coordinates,
  maxDistanceKm = 5,
  excludedWorkerIds = [],
  limit = 50,
  requireOnline = false
}) => {
  if (!coordinates || coordinates.length !== 2) {
    throw new Error('Valid [longitude, latitude] coordinates are required for geoMatch');
  }

  const [lng, lat] = coordinates.map((c) => parseFloat(c));
  const maxDistanceMeters = parseFloat(maxDistanceKm) * 1000;

  const query = {
    isAvailable: true
  };

  if (requireOnline) {
    query.isOnline = true;
  }

  if (skill && skill !== 'All') {
    query.skill = skill;
  }

  if (excludedWorkerIds && excludedWorkerIds.length > 0) {
    query._id = { $nin: excludedWorkerIds };
  }

  query.currentLocation = {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      $maxDistance: maxDistanceMeters
    }
  };

  const workers = await Worker.find(query)
    .populate('user', '-password')
    .limit(limit);
  
  return workers;
};

/**
 * Select the next N nearest workers for a broadcast round
 */
const selectNextRoundWorkers = (allNearbyWorkers, excludedWorkerIds = [], count = 5) => {
  if (!Array.isArray(allNearbyWorkers)) return [];
  const excludedSet = new Set(excludedWorkerIds.map((id) => id.toString()));

  return allNearbyWorkers
    .filter((w) => w && w._id && !excludedSet.has(w._id.toString()))
    .slice(0, count);
};

module.exports = {
  calculateDistanceKm,
  findNearbyAvailableWorkers,
  selectNextRoundWorkers
};
