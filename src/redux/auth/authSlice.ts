import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import environment from '../../environments/environment';

interface AuthState {
  userData: any;
  currentUserId: string | null;
  currentUserRole: string | null;
  dronaaimId: string | null;
  userInfo: {
    orgRoleAndScoreMapping: any[];
    profilePicUrl: string | null;
    fullName: string | null;
    emailId: string | null;
    primaryPhone: string | null;
    primaryPhoneCtryCd: string | null;
  } | null;
  fetchingUserInfo: boolean;
  userInfoError: string | null;
}

const initialState: AuthState = {
  userData: null,
  currentUserId: null,
  currentUserRole: null,
  dronaaimId: null,
  userInfo: null,
  fetchingUserInfo: false,
  userInfoError: null,
};

// Async thunk for fetching user info - dummy implementation
export const fetchUserInfo = createAsyncThunk('auth/fetchUserInfo', async (_, { rejectWithValue }) => {
  try {
    // Dummy user info fetch
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      orgRoleAndScoreMapping: [
        {
          name: 'Demo Organization',
          role: 'fleetManager',
          lonestarId: 'lonestar-123',
          insurerId: 'insurer-456',
          policyDetails: [{ isActive: true, message: 'Policy active' }]
        }
      ],
      profilePicUrl: null,
      fullName: 'Demo User',
      emailId: 'demo@example.com',
      primaryPhone: '+1234567890',
      primaryPhoneCtryCd: '+1',
      rawData: {},
    };
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch user info');
  }
});

// Async thunk for refreshing user info (force refresh) - dummy implementation
export const refreshUserInfo = createAsyncThunk('auth/refreshUserInfo', async (_, { rejectWithValue }) => {
  try {
    // Dummy user info refresh
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      orgRoleAndScoreMapping: [
        {
          name: 'Demo Organization',
          role: 'fleetManager',
          lonestarId: 'lonestar-123',
          insurerId: 'insurer-456',
          policyDetails: [{ isActive: true, message: 'Policy active' }]
        }
      ],
      profilePicUrl: null,
      fullName: 'Demo User',
      emailId: 'demo@example.com',
      primaryPhone: '+1234567890',
      primaryPhoneCtryCd: '+1',
      rawData: {},
    };
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to refresh user info');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<any>) {
      state.userData = action.payload;
      state.currentUserId = action.payload.userId;
      state.currentUserRole = action.payload.currentUserRole;
      state.dronaaimId = action.payload.dronaaimId;
    },
    clearAuthState(state) {
      state.userData = null;
      state.currentUserId = null;
      state.currentUserRole = null;
      state.dronaaimId = null;
      state.userInfo = null;
      state.fetchingUserInfo = false;
      state.userInfoError = null;
    },
    updateProfilePicUrl(state, action: PayloadAction<string | null>) {
      if (state.userInfo) {
        state.userInfo.profilePicUrl = action.payload;
      }
    },
    clearUserInfoError(state) {
      state.userInfoError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserInfo cases
      .addCase(fetchUserInfo.pending, (state) => {
        state.fetchingUserInfo = true;
        state.userInfoError = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.fetchingUserInfo = false;
        state.userInfo = {
          orgRoleAndScoreMapping: action.payload.orgRoleAndScoreMapping,
          profilePicUrl: action.payload.profilePicUrl,
          fullName: action.payload.fullName,
          emailId: action.payload.emailId,
          primaryPhone: action.payload.primaryPhone,
          primaryPhoneCtryCd: action.payload.primaryPhoneCtryCd,
        };
        state.userInfoError = null;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.fetchingUserInfo = false;
        state.userInfoError = action.payload as string;
      })
      // refreshUserInfo cases
      .addCase(refreshUserInfo.pending, (state) => {
        state.fetchingUserInfo = true;
        state.userInfoError = null;
      })
      .addCase(refreshUserInfo.fulfilled, (state, action) => {
        state.fetchingUserInfo = false;
        state.userInfo = {
          orgRoleAndScoreMapping: action.payload.orgRoleAndScoreMapping,
          profilePicUrl: action.payload.profilePicUrl,
          fullName: action.payload.fullName,
          emailId: action.payload.emailId,
          primaryPhone: action.payload.primaryPhone,
          primaryPhoneCtryCd: action.payload.primaryPhoneCtryCd,
        };
        state.userInfoError = null;
      })
      .addCase(refreshUserInfo.rejected, (state, action) => {
        state.fetchingUserInfo = false;
        state.userInfoError = action.payload as string;
      });
  },
});

export const { loginSuccess, clearAuthState, updateProfilePicUrl, clearUserInfoError } = authSlice.actions;

export default authSlice.reducer;
