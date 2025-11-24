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
            <h2>Echocardiogram Video</h2>
            <div class="view-selector">
              <label for="view-select">View:</label>
              <select
                id="view-select"
                v-model="selectedView"
                class="view-select"
              >
                <option value="a4c">A4C (Apical 4-Chamber)</option>
                <option value="a2c">A2C (Apical 2-Chamber)</option>
                <option value="plax">PLAX (Parasternal Long Axis)</option>
                <option value="psax">PSAX (Parasternal Short Axis)</option>
              </select>
            </div>
          </div>

          <div class="video-player">
            <video
              v-if="videoUrl"
              :key="videoUrl"
              controls
              class="video-element"
            >
              <source :src="videoUrl" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div v-else class="no-video">
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
              <strong>Current View:</strong> {{ viewLabels[selectedView] }}
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
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '../services/api'
import ReferenceValues from '../components/ReferenceValues.vue'

const route = useRoute()
const router = useRouter()

const patient = ref(null)
const videos = ref([])
const loading = ref(true)
const error = ref('')
const selectedView = ref('a4c')

const viewLabels = {
  a4c: 'A4C - Apical 4-Chamber',
  a2c: 'A2C - Apical 2-Chamber',
  plax: 'PLAX - Parasternal Long Axis',
  psax: 'PSAX - Parasternal Short Axis'
}

// Placeholder for ML predicted values (to be integrated later)
const predictedValues = ref({})

const videoUrl = computed(() => {
  // Match view (case-insensitive and handle different formats)
  const video = videos.value.find((v) => {
    const videoView = v.view?.toLowerCase()
    const selected = selectedView.value.toLowerCase()
    return videoView === selected
  })
  // Use the video stream URL from API service
  return video ? apiService.getVideoStreamUrl(video._id) : null
})

const isSamplePatient = computed(() => {
  // Check both id and _id for backward compatibility
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
  } catch (err) {
    console.error('Error fetching patient data:', err)
    error.value = 'Failed to load patient data. Please try again.'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/')
}

const capitalize = (str) => {
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

onMounted(() => {
  fetchPatientData()
})

// Watch for view changes (could trigger ML analysis in the future)
watch(selectedView, (newView) => {
  console.log('View changed to:', newView)
  // Future: Trigger ML analysis for the new view
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
</style>
