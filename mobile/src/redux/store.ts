import { configureStore } from '@reduxjs/toolkit';
import {
  userReducer,
  workerReducer,
  bookingReducer,
  complaintReducer,
  appealReducer
} from '@skillconnect/shared';

export interface UserState {
  userInfo: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface BookingState {
  bookings: any[];
  currentBooking: any | null;
  loading: boolean;
  error: string | null;
}

export interface WorkerState {
  workersList: any[];
  currentWorker: any | null;
  loading: boolean;
  error: string | null;
  faceRegistrationSuccess: boolean;
}

export interface ComplaintState {
  complaintsList: any[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface AppealState {
  appealsList: any[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface RootState {
  user: UserState;
  worker: WorkerState;
  booking: BookingState;
  complaint: ComplaintState;
  appeal: AppealState;
}

export const store = configureStore({
  reducer: {
    user: userReducer,
    worker: workerReducer,
    booking: bookingReducer,
    complaint: complaintReducer,
    appeal: appealReducer
  }
});

export type AppDispatch = typeof store.dispatch;
