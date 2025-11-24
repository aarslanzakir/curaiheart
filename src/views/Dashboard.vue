<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Patient Dashboard</h1>
      <router-link to="/patient/new" class="btn-primary">
        + New Patient
      </router-link>
    </div>

    <!-- Info Banner -->
    <div v-if="!loading && patients.length > 0" class="info-banner">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <div class="info-content">
        <strong>Demo Mode:</strong> Showing sample patient data. Click "+ New Patient" to add your own, or click any patient card to explore features.
        <span class="info-note">(Note: Sample patients have no videos. Add new patients to upload videos.)</span>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading patients...</div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="patients.length === 0" class="empty-state">
      <p>No patients found. Add your first patient to get started.</p>
    </div>

    <div v-else class="patients-grid">
      <div
        v-for="patient in patients"
        :key="patient._id || patient.id"
        class="patient-card"
        @click="viewPatient(patient._id || patient.id)"
      >
        <div class="patient-info">
          <div class="patient-header-row">
            <h3>{{ patient.name }}</h3>
            <span v-if="(patient._id || patient.id).startsWith('sample-')" class="sample-badge">Sample</span>
          </div>
          <div class="patient-details">
            <span><strong>Age:</strong> {{ patient.age }} years</span>
            <span><strong>Sex:</strong> {{ capitalize(patient.sex) }}</span>
            <span><strong>Height:</strong> {{ patient.height }} cm</span>
            <span><strong>Weight:</strong> {{ patient.weight }} kg</span>
          </div>
        </div>
        <div class="patient-actions">
          <span class="view-link">View Details →</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '../services/api'

const router = useRouter()

const patients = ref([])
const loading = ref(true)
const error = ref('')

const fetchPatients = async () => {
  try {
    loading.value = true
    const data = await apiService.getPatients()
    patients.value = data
  } catch (err) {
    error.value = 'Failed to load patients. Please try again.'
    console.error('Error fetching patients:', err)
  } finally {
    loading.value = false
  }
}

const viewPatient = (patientId) => {
  router.push(`/patient/${patientId}/video`)
}

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

onMounted(() => {
  fetchPatients()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.dashboard-header h1 {
  color: #333;
  font-size: 28px;
  margin: 0;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.loading,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 16px;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 16px;
  border-radius: 6px;
  text-align: center;
}

.patients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.patient-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.patient-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.patient-info h3 {
  color: #333;
  margin: 0 0 15px 0;
  font-size: 20px;
}

.patient-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.patient-actions {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
  text-align: right;
}

.view-link {
  color: #667eea;
  font-weight: 600;
  font-size: 14px;
}

.info-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border: 1px solid #667eea;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: #333;
}

.info-banner svg {
  color: #667eea;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  line-height: 1.5;
}

.info-content strong {
  color: #667eea;
}

.info-note {
  font-size: 13px;
  color: #666;
  font-style: italic;
}

.patient-header-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.patient-header-row h3 {
  margin: 0;
}

.sample-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
