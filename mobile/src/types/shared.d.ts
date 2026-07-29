declare module '@skillconnect/shared' {
  export const API: any;
  export const setStorageAdapter: (adapter: any) => void;
  export const setUnauthorizedCallback: (cb: () => void) => void;
  export const getStorageItem: (key: string) => Promise<string | null>;
  export const setStorageItem: (key: string, value: string) => Promise<void>;
  export const removeStorageItem: (key: string) => Promise<void>;

  export const userReducer: any;
  export const bookingReducer: any;
  export const workerReducer: any;
  export const complaintReducer: any;
  export const appealReducer: any;

  export const loginUser: any;
  export const registerUser: any;
  export const logout: any;
  export const fetchMe: any;
  export const updateProfile: any;
  export const verifyPhoneOtp: any;
  export const resendPhoneOtp: any;

  export const fetchBookings: any;
  export const createBooking: any;
  export const acceptBooking: any;
  export const fundEscrow: any;
  export const verifyCheckIn: any;
  export const verifyCheckOut: any;
  export const disputeBooking: any;

  export const fetchWorkers: any;
  export const fetchWorkerById: any;
  export const updateWorkerProfile: any;
  export const registerFaceVerification: any;

  export const submitComplaint: any;
  export const fetchComplaints: any;
  export const submitAppeal: any;
  export const fetchAppeals: any;

  export const SKILL_CATEGORIES: string[];
  export const FAQ_DATA: any;
  export const MOCK_BOT_RESPONSES: any;
  export const calculateDistanceKm: (coords1: number[], coords2: number[]) => number | null;
  export const calculateEtaMinutes: (distanceKm: number) => number;
  export const formatDistanceDisplay: (distanceKm: number) => string;
}
