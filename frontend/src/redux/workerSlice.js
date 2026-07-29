import workerReducer, {
  fetchWorkers,
  fetchWorkerById,
  updateWorkerProfile,
  registerFaceVerification,
  clearWorkerError,
  resetFaceStatus
} from '@skillconnect/shared/redux/workerSlice';

export {
  fetchWorkers,
  fetchWorkerById,
  updateWorkerProfile,
  registerFaceVerification,
  clearWorkerError,
  resetFaceStatus
};

export default workerReducer;
