const Worker = require('../models/Worker');
const { calculateDistanceKm } = require('./distance');

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

  const query = {};

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
    .limit(limit)
    .lean();
    
  // Attach distanceKm to each worker
  const workersWithDistance = workers.map(worker => {
    let distance = null;
    if (worker.currentLocation && worker.currentLocation.coordinates && worker.currentLocation.coordinates.length === 2) {
      distance = calculateDistanceKm([lng, lat], worker.currentLocation.coordinates);
    } else if (worker.location && worker.location.coordinates && worker.location.coordinates.length === 2) {
      distance = calculateDistanceKm([lng, lat], worker.location.coordinates);
    }
    return {
      ...worker,
      distanceKm: distance
    };
  });
  
  return workersWithDistance;
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
  findNearbyAvailableWorkers,
  selectNextRoundWorkers
};
