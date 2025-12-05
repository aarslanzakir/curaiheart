<template>
  <div class="dashboard">
    <!-- Enhanced Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="header-text">
          <h1>Patient Dashboard</h1>
          <p class="header-subtitle">Manage and monitor your patients</p>
        </div>
      </div>
      <router-link to="/patient/new" class="btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        New Patient
      </router-link>
    </div>

    <!-- Stats Bar -->
    <div v-if="!loading && patients.length > 0" class="stats-bar">
      <div class="stat-item">
        <span class="stat-number">{{ patients.length }}</span>
        <span class="stat-label">Total Patients</span>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading patients...</p>
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="patients.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <line x1="19" y1="8" x2="19" y2="14"></line>
        <line x1="22" y1="11" x2="16" y2="11"></line>
      </svg>
      <h3>No patients yet</h3>
      <p>Add your first patient to get started.</p>
      <router-link to="/patient/new" class="btn-primary">
        + Add Patient
      </router-link>
    </div>

    <div v-else class="patients-grid">
      <div
        v-for="patient in patients"
        :key="patient._id || patient.id"
        class="patient-card"
      >
        <div class="card-header">
          <div class="patient-avatar">
            {{ getInitials(patient.name) }}
          </div>
          <div class="patient-name-section">
            <h3>{{ patient.name }}</h3>
            <span class="patient-id">ID: {{ (patient._id || patient.id).slice(-6) }}</span>
          </div>
        </div>

        <div class="patient-details">
          <div class="detail-row">
            <div class="detail-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span><strong>Age:</strong> {{ patient.age }} years</span>
            </div>
            <div class="detail-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span><strong>Sex:</strong> {{ capitalize(patient.sex) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="2" x2="12" y2="22"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <span><strong>Height:</strong> {{ patient.height }} cm</span>
            </div>
            <div class="detail-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
              </svg>
              <span><strong>Weight:</strong> {{ patient.weight }} kg</span>
            </div>
          </div>
        </div>

        <div class="patient-actions">
          <button class="btn-edit" @click.stop="editPatient(patient._id || patient.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
          <button class="btn-view" @click="viewPatient(patient._id || patient.id)">
            View Details
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
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

const editPatient = (patientId) => {
  router.push(`/patient/${patientId}/edit`)
}

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

onMounted(() => {
  fetchPatients()
})
</script>

<style scoped>
.dashboard {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
  background: #f8f9fa;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
  border-radius: 16px;
  color: white;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  background: rgba(255, 255, 255, 0.2);
  padding: 16px;
  border-radius: 12px;
}

.header-text h1 {
  font-size: 32px;
  margin: 0;
  font-weight: 700;
}

.header-subtitle {
  margin: 5px 0 0;
  opacity: 0.9;
  font-size: 16px;
}

.btn-primary {
  background: white;
  color: #667eea;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.stats-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  background: white;
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #667eea;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: 80px 20px;
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

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.empty-state svg {
  color: #667eea;
  opacity: 0.5;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #333;
  margin: 0 0 10px;
  font-size: 24px;
}

.empty-state p {
  color: #666;
  margin: 0 0 25px;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.patients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

.patient-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #eee;
}

.patient-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.patient-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 20px;
}

.patient-name-section h3 {
  color: #333;
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 600;
}

.patient-id {
  color: #999;
  font-size: 12px;
  font-family: monospace;
}

.patient-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #555;
  font-size: 14px;
  background: #f8f9fa;
  padding: 10px 14px;
  border-radius: 8px;
}

.detail-item svg {
  color: #667eea;
  flex-shrink: 0;
}

.detail-item strong {
  color: #333;
}

.patient-actions {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.btn-edit {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit:hover {
  background: #667eea;
  color: white;
}

.btn-view {
  flex: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-view:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .dashboard {
    padding: 20px;
  }

  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .header-content {
    flex-direction: column;
  }

  .patients-grid {
    grid-template-columns: 1fr;
  }

  .detail-row {
    grid-template-columns: 1fr;
  }

  .patient-actions {
    flex-direction: column;
  }

  .btn-edit, .btn-view {
    flex: 1;
  }
}
</style>
