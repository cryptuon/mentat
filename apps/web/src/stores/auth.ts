/**
 * Authentication store with Pinia
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type { User, TokenResponse, RegisterRequest, LoginRequest } from '@/types/api';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => !!user.value && !!token.value);
  const isCurator = computed(() => user.value?.is_curator || false);
  const isAdmin = computed(() => user.value?.is_admin || false);

  // Actions
  async function register(data: RegisterRequest): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiClient.post<TokenResponse>(API_ENDPOINTS.AUTH_REGISTER, data);
      setAuth(response.data);
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Registration failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function login(data: LoginRequest): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiClient.post<TokenResponse>(API_ENDPOINTS.AUTH_LOGIN, data);
      setAuth(response.data);
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Login failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCurrentUser(): Promise<void> {
    if (!token.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiClient.get<User>(API_ENDPOINTS.AUTH_ME);
      user.value = response.data;
      saveUserToStorage(response.data);
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch user';
      // If token is invalid, logout
      if (err.response?.status === 401) {
        logout();
      }
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateProfile(data: Partial<User>): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiClient.patch<User>(API_ENDPOINTS.AUTH_ME, data);
      user.value = response.data;
      saveUserToStorage(response.data);
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to update profile';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function logout(): void {
    user.value = null;
    token.value = null;
    error.value = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  function setAuth(authData: TokenResponse): void {
    token.value = authData.access_token;
    user.value = authData.user;
    saveTokenToStorage(authData.access_token);
    saveUserToStorage(authData.user);
  }

  function saveTokenToStorage(tokenValue: string): void {
    localStorage.setItem('auth_token', tokenValue);
  }

  function saveUserToStorage(userData: User): void {
    localStorage.setItem('user', JSON.stringify(userData));
  }

  function loadFromStorage(): void {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      token.value = storedToken;
      try {
        user.value = JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse stored user data');
        logout();
      }
    }
  }

  // Initialize from storage on store creation
  loadFromStorage();

  return {
    // State
    user,
    token,
    isLoading,
    error,

    // Computed
    isAuthenticated,
    isCurator,
    isAdmin,

    // Actions
    register,
    login,
    logout,
    fetchCurrentUser,
    updateProfile,
    loadFromStorage,
  };
});
