import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_FAIL':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['x-auth-token'] = state.token;
      localStorage.setItem('token', state.token);
      loadUser();
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
      dispatch({ type: 'AUTH_FAIL', payload: null });
    }

    async function loadUser() {
      try {
        dispatch({ type: 'AUTH_START' });
        const res = await axios.get('/api/auth/me');
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: res.data, token: state.token },
        });
      } catch (err) {
        dispatch({ type: 'AUTH_FAIL', payload: 'Token is invalid' });
      }
    }
  }, [state.token]);

  const login = async (username, password) => {
    try {
      dispatch({ type: 'AUTH_START' });
      // Send identifier, not username, to match backend login endpoint
      const res = await axios.post('/api/auth/login', {
        identifier: username,
        password
      });
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: res.data.user, token: res.data.token }
      });
      toast.success('Login successful!');
      return true;
    } catch (err) {
      const error = err.response?.data?.msg || 'Login failed';
      dispatch({ type: 'AUTH_FAIL', payload: error });
      toast.error(error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const res = await axios.post('/api/auth/register', userData);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: res.data.user, token: res.data.token }
      });
      toast.success('Registration successful!');
      return true;
    } catch (err) {
      const error = err.response?.data?.msg || 'Registration failed';
      dispatch({ type: 'AUTH_FAIL', payload: error });
      toast.error(error);
      return false;
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  // Important update here: call your new profile update backend route and update context user
  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put('/api/profile', profileData);
      dispatch({ type: 'UPDATE_USER', payload: res.data.user || res.data });
      toast.success('Profile updated successfully!');
      return true;
    } catch (err) {
      const error = err.response?.data?.msg || 'Profile update failed';
      toast.error(error);
      return false;
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await axios.put('/api/auth/change-password', passwordData);
      toast.success('Password changed successfully!');
      return true;
    } catch (err) {
      const error = err.response?.data?.msg || 'Password change failed';
      toast.error(error);
      return false;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
