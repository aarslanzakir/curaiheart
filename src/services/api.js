import axios from 'axios'

// Get API URL from environment variable or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    // Extract error message from response
    const errorMessage = error.response?.data?.message ||
                        error.response?.data?.errors?.[0]?.message ||
                        error.message ||
                        'An error occurred'

    return Promise.reject(new Error(errorMessage))
  }
)

export const apiService = {
  // ==================== Authentication APIs ====================

  /**
   * Sign up new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @param {string} [userData.role='clinician'] - User role (admin or clinician)
   * @returns {Promise<Object>} Response with token and user data
   */
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData)
    return response.data
  },

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} Response with token and user data
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  /**
   * Get current logged-in user
   * @returns {Promise<Object>} Current user data
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  /**
   * Logout user
   * @returns {Promise<Object>} Logout confirmation
   */
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // ==================== Patient APIs ====================

  /**
   * Create new patient
   * @param {Object} patientData - Patient information
   * @param {string} patientData.name - Patient's full name
   * @param {number} patientData.age - Patient's age
   * @param {string} patientData.sex - Patient's sex (male or female)
   * @param {number} patientData.height - Height in cm
   * @param {number} patientData.weight - Weight in kg
   * @returns {Promise<Object>} Created patient data
   */
  createPatient: async (patientData) => {
    const response = await api.post('/patients', patientData)
    // Return the data field from response which contains the patient
    return response.data.data
  },

  /**
   * Get all patients for logged-in clinician
   * @returns {Promise<Array>} Array of patients
   */
  getPatients: async () => {
    const response = await api.get('/patients')
    // Return the data field which contains the array of patients
    return response.data.data
  },

  /**
   * Get single patient by ID
   * @param {string} id - Patient ID
   * @returns {Promise<Object>} Patient data
   */
  getPatient: async (id) => {
    const response = await api.get(`/patients/${id}`)
    return response.data.data
  },

  /**
   * Update patient information
   * @param {string} id - Patient ID
   * @param {Object} patientData - Updated patient data
   * @returns {Promise<Object>} Updated patient data
   */
  updatePatient: async (id, patientData) => {
    const response = await api.put(`/patients/${id}`, patientData)
    return response.data.data
  },

  /**
   * Delete patient and all associated videos
   * @param {string} id - Patient ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deletePatient: async (id) => {
    const response = await api.delete(`/patients/${id}`)
    return response.data
  },

  // ==================== Video APIs ====================

  /**
   * Upload video for a patient
   * @param {string} patientId - Patient ID
   * @param {File} videoFile - Video file to upload
   * @param {Function} onUploadProgress - Progress callback
   * @param {string} [view] - Echo view (A4C, A2C, PLAX, PSAX)
   * @returns {Promise<Object>} Uploaded video data
   */
  uploadVideo: async (patientId, videoFile, onUploadProgress, view = null) => {
    const formData = new FormData()
    formData.append('video', videoFile)
    formData.append('patientId', patientId)
    if (view) {
      formData.append('view', view)
    }

    const response = await api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onUploadProgress({ loaded: percentCompleted, total: 100 })
        }
      }
    })

    return response.data.data
  },

  /**
   * Get all videos for a patient
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} Array of videos
   */
  getVideos: async (patientId) => {
    const response = await api.get(`/videos/patient/${patientId}`)
    return response.data.data
  },

  /**
   * Get video metadata by ID
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} Video metadata with patient info
   */
  getVideo: async (videoId) => {
    const response = await api.get(`/videos/${videoId}`)
    return response.data.data
  },

  /**
   * Get video stream URL
   * @param {string} videoId - Video ID
   * @returns {string} Video stream URL with auth token
   */
  getVideoStreamUrl: (videoId) => {
    const token = localStorage.getItem('authToken')
    const baseUrl = `${API_URL}/videos/${videoId}/stream`
    return token ? `${baseUrl}?token=${token}` : baseUrl
  },

  /**
   * Delete video
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteVideo: async (videoId) => {
    const response = await api.delete(`/videos/${videoId}`)
    return response.data
  },

  // ==================== Video Processing/Classification APIs ====================

  /**
   * Trigger ML video analysis to classify echo views
   * @param {string} videoId - Video ID to analyze
   * @param {boolean} mock - Use mock data for testing (default: false)
   * @returns {Promise<Object>} Processing job info
   */
  analyzeVideo: async (videoId, mock = false) => {
    const url = mock ? `/processing/${videoId}/analyze?mock=true` : `/processing/${videoId}/analyze`
    const response = await api.post(url)
    return response.data.data
  },

  /**
   * Get processing status for a video
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} Processing status and results
   */
  getProcessingStatus: async (videoId) => {
    const response = await api.get(`/processing/${videoId}/status`)
    return response.data.data
  },

  /**
   * Get all segments for a video
   * @param {string} videoId - Video ID
   * @returns {Promise<Array>} Array of segment objects
   */
  getVideoSegments: async (videoId) => {
    const response = await api.get(`/videos/${videoId}/segments`)
    return response.data.data
  },

  /**
   * Get specific view segment info
   * @param {string} videoId - Video ID
   * @param {string} view - View type (A4C, A2C, PLAX, PSAX)
   * @returns {Promise<Object>} Segment info with streamUrl, startTime, endTime
   */
  getViewSegment: async (videoId, view) => {
    const response = await api.get(`/videos/${videoId}/segment/${view}`)
    return response.data.data
  },

  // ==================== Health Check ====================

  /**
   * Check API health status
   * @returns {Promise<Object>} Health status
   */
  healthCheck: async () => {
    const response = await api.get('/health')
    return response.data
  }
}

// Export the axios instance for advanced use cases
export { api }
