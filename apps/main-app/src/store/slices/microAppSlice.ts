import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MicroAppState {
  activeApp: string | null;
  loadingApps: string[];
  loadedApps: string[];
  errorApps: Record<string, string>;
}

const initialState: MicroAppState = {
  activeApp: null,
  loadingApps: [],
  loadedApps: [],
  errorApps: {},
};

const microAppSlice = createSlice({
  name: 'microApp',
  initialState,
  reducers: {
    setActiveApp: (state, action: PayloadAction<string | null>) => {
      state.activeApp = action.payload;
    },
    addLoadingApp: (state, action: PayloadAction<string>) => {
      if (!state.loadingApps.includes(action.payload)) {
        state.loadingApps.push(action.payload);
      }
    },
    removeLoadingApp: (state, action: PayloadAction<string>) => {
      state.loadingApps = state.loadingApps.filter(app => app !== action.payload);
    },
    addLoadedApp: (state, action: PayloadAction<string>) => {
      if (!state.loadedApps.includes(action.payload)) {
        state.loadedApps.push(action.payload);
      }
      // 从加载中移除
      state.loadingApps = state.loadingApps.filter(app => app !== action.payload);
      // 清除错误
      delete state.errorApps[action.payload];
    },
    removeLoadedApp: (state, action: PayloadAction<string>) => {
      state.loadedApps = state.loadedApps.filter(app => app !== action.payload);
    },
    setAppError: (state, action: PayloadAction<{ app: string; error: string }>) => {
      state.errorApps[action.payload.app] = action.payload.error;
      // 从加载中移除
      state.loadingApps = state.loadingApps.filter(app => app !== action.payload.app);
    },
    clearAppError: (state, action: PayloadAction<string>) => {
      delete state.errorApps[action.payload];
    },
    clearAllErrors: (state) => {
      state.errorApps = {};
    },
  },
});

export const {
  setActiveApp,
  addLoadingApp,
  removeLoadingApp,
  addLoadedApp,
  removeLoadedApp,
  setAppError,
  clearAppError,
  clearAllErrors,
} = microAppSlice.actions;

export default microAppSlice.reducer;
