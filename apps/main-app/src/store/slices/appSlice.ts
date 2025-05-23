import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  theme: 'light' | 'dark';
  language: string;
  collapsed: boolean;
  loading: boolean;
  breadcrumb: Array<{ title: string; path?: string }>;
  selectedKeys: string[];
  openKeys: string[];
}

const initialState: AppState = {
  theme: 'light',
  language: 'zh-CN',
  collapsed: false,
  loading: false,
  breadcrumb: [],
  selectedKeys: [],
  openKeys: [],
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setCollapsed: (state, action: PayloadAction<boolean>) => {
      state.collapsed = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setBreadcrumb: (state, action: PayloadAction<Array<{ title: string; path?: string }>>) => {
      state.breadcrumb = action.payload;
    },
    setSelectedKeys: (state, action: PayloadAction<string[]>) => {
      state.selectedKeys = action.payload;
    },
    setOpenKeys: (state, action: PayloadAction<string[]>) => {
      state.openKeys = action.payload;
    },
  },
});

export const {
  setTheme,
  setLanguage,
  setCollapsed,
  setLoading,
  setBreadcrumb,
  setSelectedKeys,
  setOpenKeys,
} = appSlice.actions;

export default appSlice.reducer;
