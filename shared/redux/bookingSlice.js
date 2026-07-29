import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/client';

export const fetchBookings = createAsyncThunk('booking/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/bookings');
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch bookings');
  }
});

export const createBooking = createAsyncThunk('booking/create', async (bookingData, { rejectWithValue }) => {
  try {
    const res = await API.post('/bookings', bookingData);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to create booking');
  }
});

export const acceptBooking = createAsyncThunk('booking/accept', async (bookingId, { rejectWithValue }) => {
  try {
    const res = await API.put(`/bookings/${bookingId}/accept`);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to accept booking');
  }
});

export const fundEscrow = createAsyncThunk('booking/fundEscrow', async (bookingId, { rejectWithValue }) => {
  try {
    const res = await API.put(`/bookings/${bookingId}/fund`);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fund escrow');
  }
});

export const verifyCheckIn = createAsyncThunk('booking/checkin', async ({ bookingId, faceData }, { rejectWithValue }) => {
  try {
    const res = await API.put(`/bookings/${bookingId}/checkin`, { faceData });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Check-in verification failed');
  }
});

export const verifyCheckOut = createAsyncThunk('booking/checkout', async ({ bookingId, faceData }, { rejectWithValue }) => {
  try {
    const res = await API.put(`/bookings/${bookingId}/checkout`, { faceData });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Check-out verification failed');
  }
});

export const disputeBooking = createAsyncThunk('booking/dispute', async (bookingId, { rejectWithValue }) => {
  try {
    const res = await API.put(`/bookings/${bookingId}/dispute`);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to raise dispute');
  }
});

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    bookingsList: [],
    loading: false,
    error: null,
    bookingSuccess: false
  },
  reducers: {
    clearBookingStatus: (state) => {
      state.bookingSuccess = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch bookings list
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingsList = action.payload.data;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.bookingSuccess = false;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingSuccess = true;
        state.bookingsList.unshift(action.payload.data);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.bookingSuccess = false;
      })
      // Accept / Fund / Checkin / Checkout / Dispute
      .addMatcher(
        (action) =>
          [
            acceptBooking.fulfilled,
            fundEscrow.fulfilled,
            verifyCheckIn.fulfilled,
            verifyCheckOut.fulfilled,
            disputeBooking.fulfilled
          ].map((a) => a.type).includes(action.type),
        (state, action) => {
          state.loading = false;
          const idx = state.bookingsList.findIndex((b) => b._id === action.payload.data._id);
          if (idx !== -1) {
            state.bookingsList[idx] = action.payload.data;
          }
        }
      )
      .addMatcher(
        (action) =>
          [
            acceptBooking.pending,
            fundEscrow.pending,
            verifyCheckIn.pending,
            verifyCheckOut.pending,
            disputeBooking.pending
          ].map((a) => a.type).includes(action.type),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          [
            acceptBooking.rejected,
            fundEscrow.rejected,
            verifyCheckIn.rejected,
            verifyCheckOut.rejected,
            disputeBooking.rejected
          ].map((a) => a.type).includes(action.type),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  }
});

export const { clearBookingStatus } = bookingSlice.actions;
export default bookingSlice.reducer;
