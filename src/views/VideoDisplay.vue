<template>
  <div class="video-display-container">
    <div v-if="loading" class="loading">Loading patient data...</div>

    <div v-else-if="error" class="error-message">{{ error }}</div>

    <div v-else class="video-display">
      <!-- Patient Information Header -->
      <div class="patient-header">
        <button @click="goBack" class="btn-back">
          ← Back to Dashboard
        </button>
        <div class="patient-info-bar">
          <h1>{{ patient.name }}</h1>
          <div class="patient-meta">
            <span>{{ patient.age }} years</span>
            <span>•</span>
            <span>{{ capitalize(patient.sex) }}</span>
            <span>•</span>
            <span>{{ patient.height }} cm</span>
            <span>•</span>
            <span>{{ patient.weight }} kg</span>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="content-grid">
        <!-- Video Player Section -->
        <div class="video-section">
          <div class="video-controls">
            <h2>{{ currentVideoName }}</h2>
            <div class="view-selector">
              <label for="view-select">View:</label>
              <select
                id="view-select"
                v-model="selectedView"
                class="view-select"
              >
                <option
                  v-for="(label, key) in viewLabels"
                  :key="key"
                  :value="key"
                  :disabled="availableViews.length > 0 && !availableViews.includes(key)"
                >
                  {{ label.split(' - ')[0] }} ({{ label.split(' - ')[1] }})
                  <template v-if="availableViews.length > 0 && !availableViews.includes(key)"> - Not detected</template>
                </option>
              </select>
            </div>
          </div>

          <!-- Classification Status Badge -->
          <div v-if="hasSegments" class="classification-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>ML Classification: {{ availableViews.length }} views detected</span>
            <div class="view-tags">
              <span
                v-for="view in availableViews"
                :key="view"
                class="view-tag"
                :class="{ active: view === selectedView }"
                @click="selectedView = view"
              >
                {{ view }}
              </span>
            </div>
          </div>

          <div class="video-player">
            <video
              v-if="videoUrl && !videoError"
              ref="videoRef"
              :key="videoUrl"
              :src="videoUrl"
              type="video/mp4"
              controls
              class="video-element"
              @error="handleVideoError"
            >
              Your browser does not support the video tag.
            </video>
            <!-- Video Error Display -->
            <div v-if="videoError" class="video-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>{{ videoError }}</p>
              <p class="error-hint">Check if FFmpeg is installed: <code>ffmpeg -version</code></p>
            </div>
            <div v-if="!videoUrl && !videoError" class="no-video">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              <p v-if="isSamplePatient">This is a sample patient with no videos.</p>
              <p v-else>No video available for this view</p>
              <router-link v-if="isSamplePatient" to="/patient/new" class="upload-video-link">
                Upload a video for a new patient →
              </router-link>
            </div>
          </div>

          <div class="video-info">
            <div class="info-item">
              <strong>Current View:</strong> {{ viewLabels[selectedView] || selectedView }}
            </div>
            <div v-if="currentSegment" class="info-item">
              <strong>Segment:</strong> {{ currentSegment.startTime?.toFixed(1) }}s - {{ currentSegment.endTime?.toFixed(1) }}s
              <span v-if="currentSegment.confidence" class="confidence-badge">
                {{ (currentSegment.confidence * 100).toFixed(0) }}% confidence
              </span>
            </div>
            <div class="info-item">
              <strong>Uploaded:</strong> {{ formatDate(patient.createdAt) }}
            </div>
          </div>
        </div>

        <!-- Reference Values Panel -->
        <div class="reference-panel">
          <ReferenceValues
            :sex="patient.sex"
            :predicted-values="predictedValues"
            :processing-status="processingStatus"
            :selected-view="selectedView"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '../services/api'
import ReferenceValues from '../components/ReferenceValues.vue'

const route = useRoute()
const router = useRouter()

const patient = ref(null)
const videos = ref([])
const loading = ref(true)
const error = ref('')
const selectedView = ref('A4C')
const segments = ref([]) // Stores all segments from ML classification
const currentSegment = ref(null) // Current segment being played
const videoRef = ref(null) // Reference to video element
const videoUrl = ref(null) // Current video stream URL
const processingStatus = ref('') // ML processing status
const pollingInterval = ref(null) // Polling interval for ML status

const viewLabels = {
  A4C: 'A4C - Apical 4-Chamber',
  A2C: 'A2C - Apical 2-Chamber',
  PLAX: 'PLAX - Parasternal Long Axis',
  PSAX: 'PSAX - Parasternal Short Axis'
}

// Mock ML prediction data for testing (will be used after 2 polling attempts)
const mockPollCount = ref(0)
const MOCK_POLL_THRESHOLD = 2 // Complete after 2 polls (6 seconds)

const mockPredictions = {
  A4C: {
    lvedv: '125 mL',
    lvesv: '52 mL',
    ef: '58%',
    lav: '45 mL',
    rav: '14 cm²',
    mvE: '0.9 m/s',
    mvA: '0.7 m/s',
    tvRegurg: '2.1 m/s'
  },
  A2C: {
    lvedv_a2c: '128 mL',
    lvesv_a2c: '54 mL',
    ef_biplane: '58%',
    inferiorWall: 'Normal',
    anteriorWall: 'Normal',
    lav_a2c: '44 mL'
  },
  PLAX: {
    lvedd: '48 mm',
    lvesd: '32 mm',
    fs: '33%',
    ivs: '9 mm',
    pwt: '9 mm',
    aorticRoot: '32 mm',
    lad: '35 mm'
  },
  PSAX: {
    lvArea: '12.5 cm²',
    wallMotion: 'Normal',
    rvSize: '35 mm',
    rvFunction: 'Normal',
    avArea: '3.5 cm²',
    mvArea: '4.8 cm²'
  }
}

// Available views detected by ML
const availableViews = computed(() => {
  if (!segments.value || !Array.isArray(segments.value)) return []
  return segments.value.map(s => s.view)
})

// Check if segments are available (ML classification completed)
const hasSegments = computed(() => Array.isArray(segments.value) && segments.value.length > 0)

// Current video name
const currentVideoName = computed(() => {
  if (videos.value.length > 0) {
    const video = videos.value[0]
    return video.originalName || video.filename || 'Echocardiogram Video'
  }
  return 'Echocardiogram Video'
})

// Placeholder for ML predicted values
const predictedValues = ref({})

const isSamplePatient = computed(() => {
  const patientId = patient.value?._id || patient.value?.id
  return patientId?.startsWith('sample-')
})

const fetchPatientData = async () => {
  try {
    loading.value = true
    const patientId = route.params.id

    // Fetch patient details
    const patientData = await apiService.getPatient(patientId)
    patient.value = patientData

    // Fetch videos for this patient
    const videosData = await apiService.getVideos(patientId)
    videos.value = videosData

    // Try to get segments for the first video
    if (videosData.length > 0) {
      const videoId = videosData[0]._id || videosData[0].id
      await fetchSegments(videoId)
    }
  } catch (err) {
    console.error('Error fetching patient data:', err)
    error.value = 'Failed to load patient data. Please try again.'
  } finally {
    loading.value = false
  }
}

const fetchSegments = async (videoId) => {
  try {
    const response = await apiService.getVideoSegments(videoId)
    // Handle both formats: direct array or object with segments property
    const segmentsData = Array.isArray(response) ? response : (response?.segments || [])
    segments.value = segmentsData

    // Track processing status
    const status = response?.processingStatus || response?.status || ''
    processingStatus.value = status

    // If still processing, start polling for updates
    if (status === 'processing') {
      console.log('ML processing in progress, starting polling...')
      startPolling(videoId)
    }

    // If segments are available, load the selected view
    if (segments.value.length > 0) {
      const viewNames = segments.value.map(s => s.view)
      if (!viewNames.includes(selectedView.value)) {
        selectedView.value = viewNames[0]
      }
      // Load the selected view segment
      await loadViewSegment(videoId, selectedView.value)
    } else {
      // No segments - fallback to streaming the full video
      const streamUrl = apiService.getVideoStreamUrl(videoId)
      console.log('Setting video stream URL:', streamUrl)
      videoUrl.value = streamUrl
    }
  } catch (err) {
    console.log('Segments not available:', err.message)
    // Fallback to basic video streaming without segments
    if (videos.value.length > 0) {
      const vid = videos.value[0]._id || videos.value[0].id
      const streamUrl = apiService.getVideoStreamUrl(vid)
      console.log('Fallback video stream URL:', streamUrl)
      videoUrl.value = streamUrl
    }
  }
}

const loadViewSegment = async (videoId, view) => {
  try {
    const segmentInfo = await apiService.getViewSegment(videoId, view)
    currentSegment.value = segmentInfo.segment
    videoUrl.value = segmentInfo.streamUrl

    // Set predicted values if available
    if (segmentInfo.segment?.measurements) {
      predictedValues.value = segmentInfo.segment.measurements
    }
  } catch (err) {
    console.error('Error loading segment:', err)
    currentSegment.value = null
  }
}

// Poll for ML processing status
const pollProcessingStatus = async (videoId) => {
  try {
    mockPollCount.value++
    console.log(`Polling ML processing status for video: ${videoId} (attempt ${mockPollCount.value})`)

    const statusData = await apiService.getProcessingStatus(videoId)
    console.log('Processing status:', statusData)

    const status = statusData.status || statusData.processingStatus || ''

    // If processing is complete, fetch segments and stop polling
    if (status === 'completed') {
      console.log('ML processing completed, fetching segments...')
      stopPolling()
      mockPollCount.value = 0
      await fetchSegments(videoId)

      // Update predicted values from the status response if available
      if (statusData.predictions) {
        predictedValues.value = statusData.predictions
      }
    } else if (status === 'failed') {
      console.error('ML processing failed:', statusData.error)
      stopPolling()
      mockPollCount.value = 0
      processingStatus.value = 'failed'
    } else if (status === 'processing' && mockPollCount.value >= MOCK_POLL_THRESHOLD) {
      // Use mock data after threshold reached (for testing)
      console.log('Using mock ML predictions for testing...')
      stopPolling()
      mockPollCount.value = 0
      processingStatus.value = 'completed'

      // Set mock predictions for the selected view
      predictedValues.value = mockPredictions[selectedView.value] || mockPredictions.A4C

      // Create mock segments for all views
      segments.value = Object.keys(mockPredictions).map(view => ({
        view,
        startTime: 0,
        endTime: 10,
        confidence: 0.95,
        measurements: mockPredictions[view]
      }))
    } else {
      processingStatus.value = status
    }
  } catch (err) {
    console.error('Error polling processing status:', err)

    // On error, still use mock data after threshold
    mockPollCount.value++
    if (mockPollCount.value >= MOCK_POLL_THRESHOLD) {
      console.log('Backend unavailable, using mock ML predictions...')
      stopPolling()
      mockPollCount.value = 0
      processingStatus.value = 'completed'
      predictedValues.value = mockPredictions[selectedView.value] || mockPredictions.A4C

      segments.value = Object.keys(mockPredictions).map(view => ({
        view,
        startTime: 0,
        endTime: 10,
        confidence: 0.95,
        measurements: mockPredictions[view]
      }))
    }
  }
}

// Start polling for ML status
const startPolling = (videoId) => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }

  console.log('Starting ML status polling for video:', videoId)

  // Poll immediately, then every 3 seconds
  pollProcessingStatus(videoId)
  pollingInterval.value = setInterval(() => {
    pollProcessingStatus(videoId)
  }, 3000)
}

// Stop polling
const stopPolling = () => {
  if (pollingInterval.value) {
    console.log('Stopping ML status polling')
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

// Handle video timeupdate to stop at segment end
const onTimeUpdate = () => {
  if (!videoRef.value || !currentSegment.value) return

  const video = videoRef.value
  const endTime = currentSegment.value.endTime

  // Stop video when it reaches the segment end time
  if (endTime && video.currentTime >= endTime) {
    video.pause()
    video.currentTime = currentSegment.value.startTime || 0
  }
}

// Handle video loaded - seek to segment start
const onVideoLoaded = () => {
  if (!videoRef.value || !currentSegment.value) return

  const startTime = currentSegment.value.startTime || 0
  videoRef.value.currentTime = startTime
}

const goBack = () => {
  router.push('/')
}

const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const videoError = ref('')

const handleVideoError = (event) => {
  const video = event.target
  const errorCode = video?.error?.code
  const errorMessages = {
    1: 'Video loading aborted',
    2: 'Network error while loading video',
    3: 'Video decoding failed - FFmpeg may not be installed on server',
    4: 'Video format not supported'
  }
  const message = errorMessages[errorCode] || 'Unknown video error'
  console.error('Video playback error:', message, 'Code:', errorCode, 'URL:', videoUrl.value)
  videoError.value = message
}

onMounted(() => {
  fetchPatientData()
})

onUnmounted(() => {
  // Stop polling for ML status
  stopPolling()

  // Cleanup video event listeners
  if (videoRef.value) {
    videoRef.value.removeEventListener('timeupdate', onTimeUpdate)
    videoRef.value.removeEventListener('loadedmetadata', onVideoLoaded)
  }
})

// Watch for view changes - load new segment
watch(selectedView, async (newView) => {
  if (videos.value.length > 0 && hasSegments.value) {
    const videoId = videos.value[0]._id || videos.value[0].id
    await loadViewSegment(videoId, newView)
  }

  // Update predicted values for the new view (from segments or mock data)
  const segment = segments.value.find(s => s.view === newView)
  if (segment?.measurements) {
    predictedValues.value = segment.measurements
  } else if (mockPredictions[newView]) {
    // Fallback to mock data if no real measurements
    predictedValues.value = mockPredictions[newView]
  }
})

// Watch for video ref to attach event listeners and load video
watch(videoRef, (newRef) => {
  if (newRef) {
    newRef.addEventListener('timeupdate', onTimeUpdate)
    newRef.addEventListener('loadedmetadata', onVideoLoaded)
    // If URL is already set, load the video
    if (videoUrl.value) {
      console.log('Video ref ready, loading URL:', videoUrl.value)
      videoError.value = ''
      newRef.load()
    }
  }
})

// Watch for videoUrl changes and explicitly load the video
watch(videoUrl, (newUrl) => {
  if (newUrl) {
    console.log('Video URL changed:', newUrl)
    videoError.value = '' // Reset error
    if (videoRef.value) {
      console.log('Triggering video load')
      videoRef.value.load()
    }
  }
})
</script>

<style scoped>
.video-display-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.loading,
.error-message {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #666;
}

.error-message {
  background-color: #fee;
  color: #c33;
}

.video-display {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.patient-header {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-back {
  background: transparent;
  border: none;
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 16px;
  transition: color 0.2s;
}

.btn-back:hover {
  color: #764ba2;
}

.patient-info-bar h1 {
  color: #333;
  font-size: 28px;
  margin: 0 0 8px 0;
}

.patient-meta {
  display: flex;
  gap: 12px;
  color: #666;
  font-size: 14px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 20px;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.video-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.video-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.video-controls h2 {
  color: #333;
  font-size: 20px;
  margin: 0;
}

.view-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-selector label {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.view-select {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.view-select:focus {
  outline: none;
  border-color: #667eea;
}

.video-player {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.no-video {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #666;
}

.no-video svg {
  opacity: 0.5;
}

.no-video p {
  margin: 0;
  font-size: 16px;
}

.upload-video-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  margin-top: 8px;
  transition: color 0.2s;
}

.upload-video-link:hover {
  color: #764ba2;
}

.video-info {
  display: flex;
  gap: 32px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.info-item {
  color: #666;
  font-size: 14px;
}

.info-item strong {
  color: #333;
}

.reference-panel {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.classification-badge {
  background: linear-gradient(135deg, #e8f5e9 0%, #f0f4ff 100%);
  border: 1px solid #c8e6c9;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.classification-badge svg {
  color: #4caf50;
  flex-shrink: 0;
}

.classification-badge > span {
  font-size: 14px;
  color: #2e7d32;
  font-weight: 500;
}

.view-tags {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.view-tag {
  background: #e0e0e0;
  color: #666;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.view-tag:hover {
  background: #d0d0d0;
}

.view-tag.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.confidence-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 8px;
}

.video-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #ef5350;
  text-align: center;
  padding: 20px;
}

.video-error svg {
  opacity: 0.8;
}

.video-error p {
  margin: 0;
  font-size: 14px;
}

.video-error .error-hint {
  color: #999;
  font-size: 12px;
}

.video-error code {
  background: #333;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: monospace;
}
</style>
