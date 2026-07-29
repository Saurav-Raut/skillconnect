import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/client';

export const submitAppeal = createAsyncThunk('appeal/submit', async (appealData, { rejectWithValue }) => {
  try {
    const res = await API.post('/appeals', appealData);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to submit appeal');
  }
});

export const fetchAppeals = createAsyncThunk('appeal/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/appeals');
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch appeals');
  }
});

const appealSlice = createSlice({
  name: 'appeal',
  initialState: {
    appealsList: [],
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    resetAppealStatus: (state) => {
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitAppeal.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitAppeal.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.appealsList.unshift(action.payload.data);
      })
      .addCase(submitAppeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(fetchAppeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppeals.fulfilled, (state, action) => {
        state.loading = false;
        state.appealsList = action.payload.data;
      })
      .addCase(fetchAppeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetAppealStatus } = appealSlice.actions;
export default appealSlice.reducer;
