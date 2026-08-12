const express = require('express');
const { getWorkers, getWorkerById, getNearbyWorkers, updateWorkerProfile, registerFace, deleteFaceData, deleteWorkerProfile } = require('../controllers/workerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getWorkers);
router.get('/nearby', getNearbyWorkers);
router.get('/:id', getWorkerById);
router.put('/profile', protect, authorize('worker'), updateWorkerProfile);
router.post('/face-register', protect, authorize('worker'), registerFace);
router.delete('/face-data', protect, authorize('worker'), deleteFaceData);
router.delete('/me', protect, authorize('worker'), deleteWorkerProfile);

module.exports = router;
