import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, companyApi } from '../../services/api.js';
import type { User, Company, ThemeSettings } from '../../types/index.js';

interface AuthState {
  user: User | null;
  company: Company | null;
  themeSettings: ThemeSettings | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AUTH_STORAGE_KEY = 'optops_auth';

const loadAuthFromStorage = (): Partial<AuthState> => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user || null,
        company: parsed.company || null,
        themeSettings: parsed.themeSettings || null,
        isAuthenticated: !!(parsed.user && parsed.company),
      };
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  return {
    user: null,
    company: null,
    themeSettings: null,
    isAuthenticated: false,
  };
};

const saveAuthToStorage = (state: Partial<AuthState>) => {
  try {
    const toStore = {
      user: state.user,
      company: state.company,
      themeSettings: state.themeSettings,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

const clearAuthFromStorage = () => {
  localStorage.clear();
};

const storedAuth = loadAuthFromStorage();
const initialState: AuthState = {
  user: storedAuth.user || null,
  company: storedAuth.company || null,
  themeSettings: storedAuth.themeSettings || null,
  isAuthenticated: storedAuth.isAuthenticated || false,
  isLoading: false,
  error: null,
};

export const signup = createAsyncThunk('auth/signup', async (data: { name: string; email: string; password: string; userEmail: string; userName: string }) => {
  return authApi.signup(data);
});

export const login = createAsyncThunk('auth/login', async (data: { email: string; password: string }) => {
  return authApi.login(data);
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authApi.logout();
    clearAuthFromStorage();
  } catch (error: any) {
    // Even if API call fails, clear storage
    clearAuthFromStorage();
    return rejectWithValue(error?.message || 'Logout failed');
  }
});

export const initializeAuth = createAsyncThunk('auth/initialize', async (_, { getState, rejectWithValue }) => {
  const stored = loadAuthFromStorage();
  if (!stored.isAuthenticated || !stored.user || !stored.company) {
    return rejectWithValue('No stored session');
  }
  
  try {
    const company = await companyApi.getCompany();
    const themeSettings = company.themeSettings || stored.themeSettings || null;
    return {
      user: stored.user!,
      company,
      themeSettings,
    };
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearAuthFromStorage();
      return rejectWithValue('Session expired');
    }
    throw error;
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User; company: Company; themeSettings?: ThemeSettings }>) => {
      state.user = action.payload.user;
      state.company = action.payload.company;
      state.themeSettings = action.payload.themeSettings || null;
      state.isAuthenticated = true;
      state.error = null;
      saveAuthToStorage({
        user: action.payload.user,
        company: action.payload.company,
        themeSettings: action.payload.themeSettings || null,
      });
    },
    clearAuth: (state) => {
      state.user = null;
      state.company = null;
      state.themeSettings = null;
      state.isAuthenticated = false;
      state.error = null;
      clearAuthFromStorage();
    },
    updateThemeSettings: (state, action: PayloadAction<ThemeSettings>) => {
      state.themeSettings = action.payload;
      if (state.company) {
        state.company.themeSettings = action.payload;
      }
      saveAuthToStorage({
        user: state.user,
        company: state.company,
        themeSettings: action.payload,
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.company = action.payload.company;
        state.themeSettings = action.payload.themeSettings || null;
        state.isAuthenticated = true;
        saveAuthToStorage({
          user: action.payload.user,
          company: action.payload.company,
          themeSettings: action.payload.themeSettings || null,
        });
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Signup failed';
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.company = action.payload.company;
        state.themeSettings = action.payload.themeSettings || null;
        state.isAuthenticated = true;
        saveAuthToStorage({
          user: action.payload.user,
          company: action.payload.company,
          themeSettings: action.payload.themeSettings || null,
        });
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.company = null;
        state.themeSettings = null;
        state.isAuthenticated = false;
        state.error = null;
        clearAuthFromStorage();
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.company = null;
        state.themeSettings = null;
        state.isAuthenticated = false;
        state.error = null;
        clearAuthFromStorage();
      })
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.company = action.payload.company;
        state.themeSettings = action.payload.themeSettings;
        state.isAuthenticated = true;
        saveAuthToStorage({
          user: action.payload.user,
          company: action.payload.company,
          themeSettings: action.payload.themeSettings,
        });
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        const errorMessage = action.payload as string;
        if (errorMessage === 'Session expired' || errorMessage === 'No stored session') {
          state.user = null;
          state.company = null;
          state.themeSettings = null;
          state.isAuthenticated = false;
          clearAuthFromStorage();
        } else {
          state.error = errorMessage || 'Failed to initialize auth';
        }
      });
  },
});

export const { setAuth, clearAuth, updateThemeSettings } = authSlice.actions;
export default authSlice.reducer;
