import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import workerReducer from './workerSlice';
import bookingReducer from './bookingSlice';
import complaintReducer from './complaintSlice';
import appealReducer from './appealSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    worker: workerReducer,
    booking: bookingReducer,
    complaint: complaintReducer,
    appeal: appealReducer
  }
});
