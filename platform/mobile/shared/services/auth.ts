/**
 * Auth Service
 * 
 * Handles authentication operations including login, register, social auth,
 * and session management. Enhanced for passwordless-first flow.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './api';
import { secureStorage } from './secure-storage';
import logger from '../utils/logger';

// Auth state change listeners
type AuthStateListener = (authenticated: boolean) => void;
const authStateListeners: AuthStateListener[] = [];

export const authService = {
  /**
   * Traditional email/password login
   */
  async login(email: string, password: string) {
    const data = await ApiService.login(email, password);
    await this.storeAuthData(data);
    this.notifyAuthStateChange(true);
    return data;
  },

  /**
   * User registration with email/password
   */
  async register(email: string, password: string, full_name: string) {
    const data = await ApiService.register({ email, password, full_name });
    await this.storeAuthData(data);
    this.notifyAuthStateChange(true);
    return data;
  },

  /**
   * Social login (Apple/Google)
   */
  async socialLogin(provider: 'apple' | 'google', idToken: string, deviceInfo?: Record<string, string>) {
    try {
      const response = await ApiService.post('/auth/social', {
        provider,
        id_token: idToken,
        device_info: deviceInfo,
      });

      const data = response.data;

      if (data.status === 'authenticated') {
        await this.storeAuthData(data);
        this.notifyAuthStateChange(true);
        return { success: true, authenticated: true, user: data.user };
      }

      if (data.status === 'pending_phone_verification') {
        return {
          success: true,
          authenticated: false,
          status: 'pending_phone_verification',
          tempToken: data.temp_token,
          userPreview: data.user_preview,
        };
      }

      if (data.status === 'phone_verification_required') {
        return {
          success: true,
          authenticated: false,
          status: 'phone_verification_required',
          tempToken: data.temp_token,
          user: data.user,
        };
      }

      return { success: false, error: 'Unknown auth status' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Social login failed:', error);
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Phone-based login/registration (after OTP verification)
   */
  async phoneLogin(phoneNumber: string, otpCode: string, deviceInfo?: Record<string, string>) {
    try {
      const response = await ApiService.post('/auth/phone/verify-otp', {
        phone_number: phoneNumber,
        otp_code: otpCode,
        device_info: deviceInfo,
      });

      const data = response.data;

      if (data.success && data.status === 'authenticated') {
        await this.storeAuthData(data);
        this.notifyAuthStateChange(true);
        return { success: true, authenticated: true, user: data.user };
      }

      if (data.status === 'registration_required') {
        return {
          success: true,
          authenticated: false,
          status: 'registration_required',
          tempToken: data.temp_token,
        };
      }

      return { success: false, error: data.message || 'Verification failed' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Phone login failed:', error);
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Complete phone registration with profile data
   */
  async completePhoneRegistration(tempToken: string, profileData: {
    fullName: string;
    email?: string;
    birthDate?: string;
  }) {
    try {
      const response = await ApiService.post('/auth/phone/complete-registration', {
        temp_token: tempToken,
        full_name: profileData.fullName,
        email: profileData.email,
        birth_date: profileData.birthDate,
      });

      const data = response.data;

      if (data.success) {
        await this.storeAuthData(data);
        this.notifyAuthStateChange(true);
        return {
          success: true,
          user: data.user,
          biometricEnrollmentToken: data.biometric_enrollment_token,
        };
      }

      return { success: false, error: data.message };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Complete registration failed:', error);
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Biometric quick login
   */
  async biometricLogin(biometricToken: string, deviceInfo?: Record<string, string>) {
    try {
      const response = await ApiService.post('/auth/biometric/authenticate', {
        biometric_token: biometricToken,
        device_info: deviceInfo,
      });

      const data = response.data;

      await this.storeAuthData({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user,
      });

      this.notifyAuthStateChange(true);

      return {
        success: true,
        user: data.user,
        trustLevel: data.trust_level,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Biometric login failed:', error);
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Logout and clear all auth data
   */
  async logout() {
    try {
      await ApiService.logout();
    } catch (error) {
      logger.warn('Logout API call failed:', error);
    } finally {
      await this.clearAuthData();
      this.notifyAuthStateChange(false);
    }
  },

  /**
   * Get current user from API
   */
  async getCurrentUser() {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) return null;

    try {
      return await ApiService.getCurrentUser();
    } catch (error) {
      await this.logout();
      return null;
    }
  },

  /**
   * Get stored user from local storage
   */
  async getStoredUser() {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Store authentication data
   */
  async storeAuthData(data: {
    access_token?: string;
    refresh_token?: string;
    user?: Record<string, unknown>;
    biometric_enrollment_token?: string;
  }) {
    const promises: Promise<void>[] = [];

    if (data.access_token) {
      promises.push(secureStorage.setAccessToken(data.access_token));
      promises.push(AsyncStorage.setItem('access_token', data.access_token));
    }

    if (data.refresh_token) {
      promises.push(secureStorage.setRefreshToken(data.refresh_token));
      promises.push(AsyncStorage.setItem('refresh_token', data.refresh_token));
    }

    if (data.user) {
      promises.push(AsyncStorage.setItem('user', JSON.stringify(data.user)));
      promises.push(secureStorage.setUser(data.user));
    }

    await Promise.all(promises);
  },

  /**
   * Clear all authentication data
   */
  async clearAuthData() {
    await Promise.all([
      AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']),
      secureStorage.clearAuth(),
    ]);
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(listener: AuthStateListener): () => void {
    authStateListeners.push(listener);
    return () => {
      const index = authStateListeners.indexOf(listener);
      if (index > -1) {
        authStateListeners.splice(index, 1);
      }
    };
  },

  /**
   * Notify all listeners of auth state change
   */
  notifyAuthStateChange(authenticated: boolean) {
    authStateListeners.forEach(listener => listener(authenticated));
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await ApiService.post('/auth/refresh', {
        refresh_token: refreshToken,
      });

      await this.storeAuthData(response.data);
      return true;
    } catch (error) {
      logger.error('Token refresh failed:', error);
      await this.clearAuthData();
      this.notifyAuthStateChange(false);
      return false;
    }
  },
};

export default authService;
