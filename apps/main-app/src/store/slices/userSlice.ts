import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { UserInfo } from '@enterprise/shared-types';
import { httpClient } from '@enterprise/shared-utils';

interface UserState {
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  userInfo: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// 异步actions
export const loginAsync = createAsyncThunk(
  'user/login',
  async (credentials: { username: string; password: string }) => {
    const response = await httpClient.post<{
      user: UserInfo;
      token: string;
    }>('/auth/login', credentials);
    
    // 保存token
    localStorage.setItem('auth_token', response.token);
    
    return response.user;
  }
);

export const logoutAsync = createAsyncThunk(
  'user/logout',
  async () => {
    await httpClient.post('/auth/logout');
    localStorage.removeItem('auth_token');
  }
);

export const getUserInfoAsync = createAsyncThunk(
  'user/getUserInfo',
  async () => {
    const response = await httpClient.get<UserInfo>('/auth/me');
    return response;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUserInfo: (state, action: PayloadAction<Partial<UserInfo>>) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '登录失败';
      })
      // 登出
      .addCase(logoutAsync.fulfilled, (state) => {
        state.userInfo = null;
        state.isAuthenticated = false;
      })
      // 获取用户信息
      .addCase(getUserInfoAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserInfoAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getUserInfoAsync.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, updateUserInfo } = userSlice.actions;
export default userSlice.reducer;
