<template>
  <div class="edit-patient-container">
    <div class="form-card">
      <div class="form-header">
        <button @click="goBack" class="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Dashboard
        </button>
        <div class="header-content">
          <div class="header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
          <div>
            <h1>Edit Patient</h1>
            <p class="header-subtitle">Update patient information</p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Loading patient data...</p>
      </div>

      <div v-else-if="loadError" class="error-message">
        {{ loadError }}
      </div>

      <form v-else @submit.prevent="handleSubmit" class="patient-form">
        <div class="form-section">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Patient Information
          </h2>

          <div class="form-row full-width">
            <div class="form-group">
              <label for="name">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Full Name
              </label>
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
              <label for="age">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Age (years)
              </label>
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
              <label for="sex">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="5"></circle>
                  <path d="M12 13v9"></path>
                  <path d="M9 18h6"></path>
                </svg>
                Sex
              </label>
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
              <label for="height">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2v20"></path>
                  <path d="M2 12h4"></path>
                  <path d="M18 12h4"></path>
                </svg>
                Height (cm)
              </label>
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
              <label for="weight">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="5" r="3"></circle>
                  <line x1="12" y1="8" x2="12" y2="21"></line>
                  <path d="M6 21h12"></path>
                </svg>
                Weight (kg)
              </label>
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

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
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
            <svg v-if="!submitting" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            {{ submitting ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiService } from '../services/api'

const router = useRouter()
const route = useRoute()

const patientData = ref({
  name: '',
  age: '',
  sex: '',
  height: '',
  weight: ''
})

const loading = ref(true)
const loadError = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const isFormValid = computed(() => {
  return (
    patientData.value.name &&
    patientData.value.age &&
    patientData.value.sex &&
    patientData.value.height &&
    patientData.value.weight
  )
})

const fetchPatient = async () => {
  try {
    loading.value = true
    loadError.value = ''
    const patientId = route.params.id
    const data = await apiService.getPatient(patientId)
    patientData.value = {
      name: data.name,
      age: data.age,
      sex: data.sex,
      height: data.height,
      weight: data.weight
    }
  } catch (error) {
    console.error('Error fetching patient:', error)
    loadError.value = 'Failed to load patient data. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  submitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const patientId = route.params.id
    await apiService.updatePatient(patientId, patientData.value)
    successMessage.value = 'Patient updated successfully!'

    // Redirect after a short delay
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (error) {
    console.error('Error updating patient:', error)
    errorMessage.value = error.message || 'Failed to update patient. Please try again.'
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  fetchPatient()
})
</script>

<style scoped>
.edit-patient-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  padding: 30px;
}

.form-card {
  max-width: 700px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.form-header {
  margin-bottom: 30px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 20px;
  transition: color 0.2s;
}

.btn-back:hover {
  color: #764ba2;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px;
  border-radius: 14px;
  color: white;
}

.form-header h1 {
  color: #333;
  font-size: 28px;
  margin: 0 0 4px 0;
  font-weight: 700;
}

.header-subtitle {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.patient-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
  font-size: 18px;
  margin: 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #667eea;
}

.form-section h2 svg {
  color: #667eea;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-row.full-width {
  grid-template-columns: 1fr;
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
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  font-weight: 600;
  font-size: 14px;
}

.form-group label svg {
  color: #667eea;
}

.form-group input,
.form-group select {
  padding: 14px 18px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #fafafa;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
}

.error-message {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  color: white;
  padding: 16px 20px;
  border-radius: 10px;
  font-size: 14px;
  text-align: center;
}

.success-message {
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
  color: white;
  padding: 16px 20px;
  border-radius: 10px;
  font-size: 14px;
  text-align: center;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn-primary,
.btn-secondary {
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  border: 2px solid #e0e0e0;
}

.btn-secondary:hover:not(:disabled) {
  background: #e8e8e8;
  border-color: #ccc;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
