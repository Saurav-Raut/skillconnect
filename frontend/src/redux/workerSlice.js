import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../utils/api';

export const fetchWorkers = createAsyncThunk('worker/fetchAll', async (filters, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const res = await API.get(`/workers?${params}`);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch workers');
  }
});

export const fetchWorkerById = createAsyncThunk('worker/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await API.get(`/workers/${id}`);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch worker details');
  }
});

export const updateWorkerProfile = createAsyncThunk('worker/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const res = await API.put('/workers/profile', profileData);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Profile update failed');
  }
});

export const registerFaceVerification = createAsyncThunk('worker/registerFace', async (faceData, { rejectWithValue }) => {
  try {
    const res = await API.post('/workers/face-register', { faceData });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Face registration failed');
  }
});

const workerSlice = createSlice({
  name: 'worker',
  initialState: {
    workersList: [],
    currentWorker: null,
    loading: false,
    error: null,
    faceRegistrationSuccess: false
  },
  reducers: {
    clearWorkerError: (state) => {
      state.error = null;
    },
    resetFaceStatus: (state) => {
      state.faceRegistrationSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch workers list
      .addCase(fetchWorkers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkers.fulfilled, (state, action) => {
        state.loading = false;
        state.workersList = action.payload.data;
      })
      .addCase(fetchWorkers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single worker
      .addCase(fetchWorkerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorker = action.payload.data;
      })
      .addCase(fetchWorkerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update profile
      .addCase(updateWorkerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWorkerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorker = action.payload.data;
      })
      .addCase(updateWorkerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register face
      .addCase(registerFaceVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.faceRegistrationSuccess = false;
      })
      .addCase(registerFaceVerification.fulfilled, (state) => {
        state.loading = false;
        state.faceRegistrationSuccess = true;
      })
      .addCase(registerFaceVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.faceRegistrationSuccess = false;
      });
  }
});

export const { clearWorkerError, resetFaceStatus } = workerSlice.actions;
export default workerSlice.reducer;
