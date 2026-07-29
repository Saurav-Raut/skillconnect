import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../utils/api';

export const submitComplaint = createAsyncThunk('complaint/submit', async (formData, { rejectWithValue }) => {
  try {
    const res = await API.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to submit complaint');
  }
});

export const fetchComplaints = createAsyncThunk('complaint/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/complaints');
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch complaints');
  }
});

const complaintSlice = createSlice({
  name: 'complaint',
  initialState: {
    complaintsList: [],
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    resetComplaintStatus: (state) => {
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitComplaint.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitComplaint.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.complaintsList.unshift(action.payload.data);
      })
      .addCase(submitComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.complaintsList = action.payload.data;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetComplaintStatus } = complaintSlice.actions;
export default complaintSlice.reducer;
