<template>
  <div class="patient-form-container">
    <div class="form-card">
      <div class="form-header">
        <h1>New Patient Entry</h1>
        <p>Enter patient details and upload video file</p>
      </div>

      <form @submit.prevent="handleSubmit" class="patient-form">
        <div class="form-section">
          <h2>Patient Information</h2>

          <div class="form-row">
            <div class="form-group">
              <label for="name">Full Name *</label>
              <input
                id="name"
                v-model="patientData.name"
                type="text"
                required
                placeholder="Enter patient name"
                :disabled="submitting"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="age">Age *</label>
              <input
                id="age"
                v-model.number="patientData.age"
                type="number"
                min="0"
                max="150"
                required
                placeholder="Age in years"
                :disabled="submitting"
              />
            </div>

            <div class="form-group">
              <label for="sex">Sex *</label>
              <select
                id="sex"
                v-model="patientData.sex"
                required
                :disabled="submitting"
              >
                <option value="">Select sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="height">Height (cm) *</label>
              <input
                id="height"
                v-model.number="patientData.height"
                type="number"
                min="0"
                max="300"
                step="0.1"
                required
                placeholder="Height in cm"
                :disabled="submitting"
              />
            </div>

            <div class="form-group">
              <label for="weight">Weight (kg) *</label>
              <input
                id="weight"
                v-model.number="patientData.weight"
                type="number"
                min="0"
                max="500"
                step="0.1"
                required
                placeholder="Weight in kg"
                :disabled="submitting"
              />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h2>Video Upload</h2>

          <div class="form-group">
            <label for="video">Video File (.mp4, .avi) *</label>
            <div class="file-upload-area">
              <input
                id="video"
                ref="fileInput"
                type="file"
                accept=".mp4,.avi,video/mp4,video/x-msvideo"
                required
                @change="handleFileChange"
                :disabled="submitting"
                class="file-input"
              />
              <div class="file-upload-label">
                <div v-if="!selectedFile" class="upload-prompt">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p>Click to upload or drag and drop</p>
                  <span>.mp4 or .avi files</span>
                </div>
                <div v-else class="file-selected">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                  <p>{{ selectedFile.name }}</p>
                  <span>{{ formatFileSize(selectedFile.size) }}</span>
                </div>
              </div>
            </div>
            <div v-if="fileError" class="error-text">{{ fileError }}</div>
          </div>

          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            <span class="progress-text">{{ uploadProgress }}% uploaded</span>
          </div>

          <div v-if="classificationStatus" class="classification-progress">
            <div class="classification-header">
              <svg v-if="classificationStatus === 'processing'" class="spinner" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
                <path d="M12 2a10 10 0 0 1 10 10"></path>
              </svg>
              <svg v-else-if="classificationStatus === 'completed'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>{{ classificationMessage }}</span>
            </div>
            <div v-if="classifiedViews.length > 0" class="classified-views">
              <span class="view-tag" v-for="view in classifiedViews" :key="view">{{ view.toUpperCase() }}</span>
            </div>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="btn-secondary"
            @click="goBack"
            :disabled="submitting"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="submitting || !isFormValid"
          >
            {{ submitting ? 'Saving...' : 'Save Patient' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '../services/api'

const router = useRouter()

const patientData = ref({
  name: '',
  age: '',
  sex: '',
  height: '',
  weight: ''
})

const selectedFile = ref(null)
const fileError = ref('')
const fileInput = ref(null)
const submitting = ref(false)
const errorMessage = ref('')
const uploadProgress = ref(0)
const classificationStatus = ref(null) // null, 'processing', 'completed', 'failed'
const classificationMessage = ref('')
const classifiedViews = ref([])

const isFormValid = computed(() => {
  return (
    patientData.value.name &&
    patientData.value.age &&
    patientData.value.sex &&
    patientData.value.height &&
    patientData.value.weight &&
    selectedFile.value
  )
})

const handleFileChange = (event) => {
  const file = event.target.files[0]
  fileError.value = ''

  if (!file) {
    selectedFile.value = null
    return
  }

  // Validate file extension
  const fileName = file.name.toLowerCase()
  if (!fileName.endsWith('.mp4') && !fileName.endsWith('.avi')) {
    fileError.value = 'Only .mp4 and .avi files are allowed'
    selectedFile.value = null
    fileInput.value.value = ''
    return
  }

  // Validate file size (max 500MB)
  const maxSize = 500 * 1024 * 1024
  if (file.size > maxSize) {
    fileError.value = 'File size must be less than 500MB'
    selectedFile.value = null
    fileInput.value.value = ''
    return
  }

  selectedFile.value = file
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  submitting.value = true
  errorMessage.value = ''
  uploadProgress.value = 0
  classificationStatus.value = null
  classificationMessage.value = ''
  classifiedViews.value = []

  try {
    // Step 1: Create patient record
    const patientResponse = await apiService.createPatient(patientData.value)
    const patientId = patientResponse._id || patientResponse.id

    // Step 2: Upload video file
    const uploadedVideo = await apiService.uploadVideo(
      patientId,
      selectedFile.value,
      (progressEvent) => {
        uploadProgress.value = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
      }
    )

    // Step 3: Trigger ML analysis
    uploadProgress.value = 100
    classificationStatus.value = 'processing'
    classificationMessage.value = 'Analyzing video and classifying echo views...'

    const videoId = uploadedVideo._id || uploadedVideo.id
    await apiService.analyzeVideo(videoId)

    // Step 4: Poll for processing results
    await pollProcessingStatus(videoId, patientId)
  } catch (error) {
    console.error('Error saving patient:', error)
    errorMessage.value =
      error.message ||
      'Failed to save patient. Please try again.'
    classificationStatus.value = null
  } finally {
    submitting.value = false
  }
}

const pollProcessingStatus = async (videoId, patientId) => {
  const maxAttempts = 5 // Poll for up to 15 seconds (5 * 3 seconds)
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      const status = await apiService.getProcessingStatus(videoId)

      if (status.status === 'completed') {
        classificationStatus.value = 'completed'
        classificationMessage.value = 'Classification complete! Views detected:'
        // Extract view names from segments array
        classifiedViews.value = (status.segments || []).map(s => s.view)

        // Wait a moment to show success, then redirect
        setTimeout(() => {
          router.push(`/patient/${patientId}/video`)
        }, 1500)
        return
      } else if (status.status === 'failed') {
        throw new Error(status.error || 'Classification failed')
      }

      // Update progress message
      classificationMessage.value = `Analyzing video... (attempt ${attempts + 1}/${maxAttempts})`

      // Wait 3 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 3000))
      attempts++
    } catch (error) {
      // If polling fails, still redirect to video page (processing may complete in background)
      console.warn('Processing polling error:', error)
      break
    }
  }

  // Timeout or error - redirect anyway (ML processing continues in background)
  classificationStatus.value = 'completed'
  classificationMessage.value = 'Video uploaded! ML processing continues in background...'
  setTimeout(() => {
    router.push(`/patient/${patientId}/video`)
  }, 1500)
}

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.patient-form-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.form-card {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.form-header {
  margin-bottom: 30px;
}

.form-header h1 {
  color: #333;
  font-size: 28px;
  margin: 0 0 8px 0;
}

.form-header p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.patient-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section h2 {
  color: #333;
  font-size: 20px;
  margin: 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled,
.form-group select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.file-upload-area {
  position: relative;
}

.file-input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-input:disabled {
  cursor: not-allowed;
}

.file-upload-label {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  transition: border-color 0.3s;
  background-color: #fafafa;
}

.file-input:hover:not(:disabled) + .file-upload-label {
  border-color: #667eea;
}

.upload-prompt,
.file-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-prompt svg {
  color: #667eea;
}

.file-selected svg {
  color: #4caf50;
}

.upload-prompt p,
.file-selected p {
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.upload-prompt span,
.file-selected span {
  font-size: 14px;
  color: #666;
}

.error-text {
  color: #c33;
  font-size: 14px;
  margin-top: -4px;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.progress-text {
  font-size: 14px;
  color: #666;
  text-align: center;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn-primary,
.btn-secondary {
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.classification-progress {
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%);
  border: 1px solid #c8e6c9;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.classification-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.classification-header .spinner {
  animation: spin 1s linear infinite;
  color: #667eea;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.classified-views {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.view-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}
</style>
