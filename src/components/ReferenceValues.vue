<template>
  <div class="reference-values">
    <div class="reference-header">
      <h2>ML Predictions</h2>
      <div class="header-badges">
        <div class="view-badge">{{ viewLabels[selectedView] || selectedView }}</div>
        <div class="sex-indicator" :class="sex">
          {{ sex === 'male' ? 'MALE' : 'FEMALE' }}
        </div>
      </div>
    </div>

    <!-- ML Processing Status -->
    <div v-if="processingStatus === 'processing'" class="ml-processing">
      <div class="processing-spinner"></div>
      <p><strong>ML Analysis in Progress</strong></p>
      <p>Analyzing {{ viewLabels[selectedView] || 'view' }} to extract measurements...</p>
    </div>

    <!-- Show predictions when available -->
    <template v-else-if="hasPredictedValues">
      <div v-for="section in currentViewMeasurements" :key="section.title" class="values-section">
        <h3>{{ section.title }}</h3>
        <div v-for="measure in section.measurements" :key="measure.key" class="value-row">
          <div class="value-label">{{ measure.label }}</div>
          <div class="value-data">
            <span v-if="predictedValues[measure.key]" class="predicted-value">
              {{ predictedValues[measure.key] }}
            </span>
            <span v-else class="no-data">--</span>
            <span class="normal-range">(Normal: {{ referenceRanges[measure.key]?.[sex] || 'N/A' }})</span>
          </div>
        </div>
      </div>
    </template>

    <!-- No predictions yet -->
    <div v-else class="ml-placeholder">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
      </svg>
      <h3>No ML Predictions Available</h3>
      <p>ML analysis has not been completed for this video.</p>
      <p class="hint">Predictions will appear here once the model processes the {{ viewLabels[selectedView] || 'selected' }} view.</p>
    </div>

    <div v-if="hasPredictedValues" class="reference-footer">
      <p class="reference-note">
        <strong>Note:</strong> Values shown are ML-predicted measurements for {{ viewLabels[selectedView] || 'selected' }} view. Normal ranges based on ASE guidelines.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  sex: {
    type: String,
    required: true,
    validator: (value) => ['male', 'female'].includes(value)
  },
  predictedValues: {
    type: Object,
    default: () => ({})
  },
  processingStatus: {
    type: String,
    default: ''
  },
  selectedView: {
    type: String,
    default: 'A4C'
  }
})

// View labels
const viewLabels = {
  A4C: 'Apical 4-Chamber',
  A2C: 'Apical 2-Chamber',
  PLAX: 'Parasternal Long Axis',
  PSAX: 'Parasternal Short Axis'
}

// Measurements specific to each view
const viewMeasurements = {
  A4C: [
    {
      title: 'LV Volumes & Function',
      measurements: [
        { key: 'lvedv', label: 'LV End-Diastolic Volume (LVEDV)' },
        { key: 'lvesv', label: 'LV End-Systolic Volume (LVESV)' },
        { key: 'ef', label: 'Ejection Fraction (EF)' }
      ]
    },
    {
      title: 'Chamber Dimensions',
      measurements: [
        { key: 'lav', label: 'Left Atrial Volume (LAV)' },
        { key: 'rav', label: 'Right Atrial Area (RAA)' }
      ]
    },
    {
      title: 'Valve Assessment',
      measurements: [
        { key: 'mvE', label: 'Mitral Valve E Wave' },
        { key: 'mvA', label: 'Mitral Valve A Wave' },
        { key: 'tvRegurg', label: 'Tricuspid Regurgitation Velocity' }
      ]
    }
  ],
  A2C: [
    {
      title: 'LV Volumes (Biplane)',
      measurements: [
        { key: 'lvedv_a2c', label: 'LV End-Diastolic Volume (A2C)' },
        { key: 'lvesv_a2c', label: 'LV End-Systolic Volume (A2C)' },
        { key: 'ef_biplane', label: 'Biplane Ejection Fraction' }
      ]
    },
    {
      title: 'Wall Motion',
      measurements: [
        { key: 'inferiorWall', label: 'Inferior Wall Motion' },
        { key: 'anteriorWall', label: 'Anterior Wall Motion' }
      ]
    },
    {
      title: 'Left Atrium',
      measurements: [
        { key: 'lav_a2c', label: 'LA Volume (A2C View)' }
      ]
    }
  ],
  PLAX: [
    {
      title: 'LV Dimensions',
      measurements: [
        { key: 'lvedd', label: 'LV End-Diastolic Diameter (LVEDD)' },
        { key: 'lvesd', label: 'LV End-Systolic Diameter (LVESD)' },
        { key: 'fs', label: 'Fractional Shortening (FS)' }
      ]
    },
    {
      title: 'Wall Thickness',
      measurements: [
        { key: 'ivs', label: 'Interventricular Septum (IVS)' },
        { key: 'pwt', label: 'Posterior Wall Thickness (PWT)' }
      ]
    },
    {
      title: 'Aortic Root & LA',
      measurements: [
        { key: 'aorticRoot', label: 'Aortic Root Diameter' },
        { key: 'lad', label: 'Left Atrial Diameter (LAD)' }
      ]
    }
  ],
  PSAX: [
    {
      title: 'LV Assessment',
      measurements: [
        { key: 'lvArea', label: 'LV Cross-sectional Area' },
        { key: 'wallMotion', label: 'Regional Wall Motion' }
      ]
    },
    {
      title: 'RV Assessment',
      measurements: [
        { key: 'rvSize', label: 'RV Size' },
        { key: 'rvFunction', label: 'RV Function' }
      ]
    },
    {
      title: 'Valve Level',
      measurements: [
        { key: 'avArea', label: 'Aortic Valve Area' },
        { key: 'mvArea', label: 'Mitral Valve Area' }
      ]
    }
  ]
}

// Reference ranges based on sex (ASE guidelines)
const referenceRanges = {
  lvedd: { male: '42-58 mm', female: '38-52 mm' },
  lvesd: { male: '25-40 mm', female: '22-35 mm' },
  ivs: { male: '6-10 mm', female: '6-9 mm' },
  pwt: { male: '6-10 mm', female: '6-9 mm' },
  lvedv: { male: '67-155 mL', female: '56-104 mL' },
  lvesv: { male: '22-58 mL', female: '19-49 mL' },
  lvedv_a2c: { male: '67-155 mL', female: '56-104 mL' },
  lvesv_a2c: { male: '22-58 mL', female: '19-49 mL' },
  ef: { male: '52-72%', female: '54-74%' },
  ef_biplane: { male: '52-72%', female: '54-74%' },
  fs: { male: '25-45%', female: '27-45%' },
  lad: { male: '27-38 mm', female: '27-38 mm' },
  lav: { male: '22-58 mL', female: '22-52 mL' },
  lav_a2c: { male: '22-58 mL', female: '22-52 mL' },
  rav: { male: '< 18 cm²', female: '< 18 cm²' },
  aorticRoot: { male: '20-37 mm', female: '20-35 mm' },
  mvE: { male: '0.6-1.3 m/s', female: '0.6-1.3 m/s' },
  mvA: { male: '0.4-0.9 m/s', female: '0.4-0.9 m/s' },
  tvRegurg: { male: '< 2.8 m/s', female: '< 2.8 m/s' },
  inferiorWall: { male: 'Normal', female: 'Normal' },
  anteriorWall: { male: 'Normal', female: 'Normal' },
  lvArea: { male: 'Variable', female: 'Variable' },
  wallMotion: { male: 'Normal', female: 'Normal' },
  rvSize: { male: '< 42 mm', female: '< 42 mm' },
  rvFunction: { male: 'Normal', female: 'Normal' },
  avArea: { male: '3.0-4.0 cm²', female: '3.0-4.0 cm²' },
  mvArea: { male: '4.0-6.0 cm²', female: '4.0-6.0 cm²' }
}

// Get measurements for current view
const currentViewMeasurements = computed(() => {
  return viewMeasurements[props.selectedView] || viewMeasurements.A4C
})

const hasPredictedValues = computed(() => {
  return Object.keys(props.predictedValues).length > 0
})
</script>

<style scoped>
.reference-values {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.reference-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 2px solid #667eea;
  flex-wrap: wrap;
  gap: 12px;
}

.reference-header h2 {
  color: #333;
  font-size: 20px;
  margin: 0;
}

.header-badges {
  display: flex;
  gap: 8px;
  align-items: center;
}

.view-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.sex-indicator {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.sex-indicator.male {
  background-color: #e3f2fd;
  color: #1976d2;
}

.sex-indicator.female {
  background-color: #fce4ec;
  color: #c2185b;
}

.values-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.values-section h3 {
  color: #333;
  font-size: 16px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.value-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 6px;
  border-left: 3px solid #667eea;
}

.value-label {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.value-data {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reference-range {
  color: #666;
  font-size: 13px;
}

.reference-range::before {
  content: 'Normal: ';
  font-weight: 600;
  color: #333;
}

.predicted {
  color: #667eea;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 8px;
  background-color: #f0f3ff;
  border-radius: 4px;
  width: fit-content;
}

.ml-placeholder {
  background-color: #fffacd;
  border: 1px solid #ffd700;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.ml-placeholder svg {
  color: #ffa500;
}

.ml-placeholder p {
  margin: 0;
  color: #666;
  font-size: 13px;
  line-height: 1.5;
}

.reference-footer {
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.reference-note {
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.6;
}

.reference-note strong {
  color: #333;
}

.predicted-value {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
}

.no-data {
  font-size: 18px;
  font-weight: 700;
  color: #999;
}

.normal-range {
  font-size: 12px;
  color: #888;
  margin-left: 8px;
}

.ml-placeholder h3 {
  margin: 0;
  color: #555;
  font-size: 16px;
}

.ml-placeholder .hint {
  font-size: 12px;
  color: #999;
}

.ml-processing {
  background: linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 100%);
  border: 1px solid #81c784;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.ml-processing p {
  margin: 0;
  color: #2e7d32;
  font-size: 13px;
}

.processing-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
