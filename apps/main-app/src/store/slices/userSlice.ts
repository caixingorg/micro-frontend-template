import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface UserInfo {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  roles?: string[];
}

interface UserState {
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  userInfo: {
    id: '1',
    username: 'Admin',
    email: 'admin@example.com',
    avatar: '',
    roles: ['admin'],
  },
  isAuthenticated: true,
  loading: false,
  error: null,
};

// 异步登录操作
export const loginAsync = createAsyncThunk(
  'user/login',
  async (credentials: { username: string; password: string }) => {
    // 模拟API调用
    return new Promise<UserInfo>((resolve) => {
      setTimeout(() => {
        resolve({
          id: '1',
          username: credentials.username,
          email: 'admin@example.com',
          avatar: '',
          roles: ['admin'],
        });
      }, 1000);
    });
  }
);

// 异步登出操作
export const logoutAsync = createAsyncThunk('user/logout', async () => {
  // 模拟API调用
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
      state.isAuthenticated = true;
    },
    clearUserInfo: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
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
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loading = false;
        state.userInfo = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '登出失败';
      });
  },
});

export const { setUserInfo, clearUserInfo, setError } = userSlice.actions;

export default userSlice.reducer;
