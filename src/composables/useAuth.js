import { ref, computed } from 'vue'
import { apiService } from '../services/api'

const token = ref(localStorage.getItem('authToken') || null)
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value)

  /**
   * Sign up new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @param {string} [userData.role='clinician'] - User role
   * @returns {Promise<Object>} Result with success status and user data or error
   */
  const signup = async (userData) => {
    try {
      const response = await apiService.signup(userData)

      if (response.success && response.token) {
        token.value = response.token
        user.value = response.user

        localStorage.setItem('authToken', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))

        return { success: true, user: response.user }
      } else {
        return {
          success: false,
          error: 'Signup failed. Please try again.'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Signup failed. Please try again.'
      }
    }
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} Result with success status and user data or error
   */
  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials)

      if (response.success && response.token) {
        token.value = response.token
        user.value = response.user

        localStorage.setItem('authToken', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))

        return { success: true, user: response.user }
      } else {
        return {
          success: false,
          error: 'Login failed. Please check your credentials.'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Invalid email or password'
      }
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      // Call logout endpoint (optional, mainly for server-side cleanup)
      await apiService.logout()
    } catch (error) {
      // Even if logout API fails, clear local state
      console.error('Logout API error:', error)
    } finally {
      // Always clear local state
      token.value = null
      user.value = null
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
  }

  /**
   * Get current authentication token
   * @returns {string|null} Auth token
   */
  const getToken = () => token.value

  /**
   * Check if user has a specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has the role
   */
  const hasRole = (role) => {
    return user.value?.role === role
  }

  /**
   * Get current user from API (refresh user data)
   * @returns {Promise<Object|null>} User data or null
   */
  const refreshUser = async () => {
    try {
      const response = await apiService.getCurrentUser()
      if (response.success && response.user) {
        user.value = response.user
        localStorage.setItem('user', JSON.stringify(response.user))
        return response.user
      }
      return null
    } catch (error) {
      console.error('Failed to refresh user:', error)
      return null
    }
  }

  return {
    isAuthenticated,
    user,
    signup,
    login,
    logout,
    getToken,
    hasRole,
    refreshUser
  }
}
