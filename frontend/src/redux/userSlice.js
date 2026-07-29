import userReducer, {
  loginUser,
  registerUser,
  fetchMe,
  verifyOTPCode,
  logout,
  clearError
} from '@skillconnect/shared/redux/userSlice';

export {
  loginUser,
  registerUser,
  fetchMe,
  verifyOTPCode,
  logout,
  clearError
};

export default userReducer;
