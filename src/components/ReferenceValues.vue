<template>
  <div class="reference-values">
    <div class="reference-header">
      <h2>Reference Values</h2>
      <div class="sex-indicator" :class="sex">
        {{ sex === 'male' ? 'Male' : 'Female' }}
      </div>
    </div>

    <div class="values-section">
      <h3>Left Ventricular Dimensions</h3>
      <div class="value-row">
        <div class="value-label">LV End-Diastolic Diameter (LVEDD)</div>
        <div class="value-data">
          <span class="reference-range">{{ referenceRanges.lvedd[sex] }}</span>
          <span v-if="predictedValues.lvedd" class="predicted">
            Predicted: {{ predictedValues.lvedd }}
          </span>
        </div>
      </div>

      <div class="value-row">
        <div class="value-label">LV End-Systolic Diameter (LVESD)</div>
        <div class="value-data">
          <span class="reference-range">{{ referenceRanges.lvesd[sex] }}</span>
          <span v-if="predictedValues.lvesd" class="predicted">
            Predicted: {{ predictedValues.lvesd }}
          </span>
        </div>
      </div>

      <div class="value-row">
        <div class="value-label">Interventricular Septum (IVS)</div>
        <div class="value-data">
          <span class="reference-range">{{ referenceRanges.ivs[sex] }}</span>
          <span v-if="predictedValues.ivs" class="predicted">
            Predicted: {{ predictedValues.ivs }}
          </span>
        </div>
      </div>

      <div class="value-row">
        <div class="value-label">Posterior Wall Thickness (PWT)</div>
        <div class="value-data">
          <span class="reference-range">{{ referenceRanges.pwt[sex] }}</span>
          <span v-if="predictedValues.pwt" class="predicted">
            Predicted: {{ predictedValues.pwt }}
          </span>
        </div>
      </div>
    </div>

    <div class="values-section">
      <h3>Left Ventricular Volume</h3>
      <div class="value-row">
        <div class="value-label">LV End-Diastolic Volume (LVEDV)</div>
        <div class="value-data">
          <span class="reference-range">{{ referenceRanges.lvedv[sex] }}</span>
          <span v-if="predictedValues.lvedv" class="predicted">
            Predicted: {{ predictedValues.lvedv }}
          </span>
        </div>
      </div>

      <div class="value-row">
        <div class="value-label">LV End-Systolic Volume (LVESV)</div>
        <div class="value-data">
          <span class="reference-range">{{ referenceRanges.lvesv[sex] }}</span>
          <span v-if="predictedValues.lvesv" class="predicted">
            Predicted: {{ predictedValues.lvesv }}
          </span>
        </div>
      </div>
    </div>

    <div class="values-section">
      <h3>Left Ventricular Function</h3>
      <div class="value-row">
        <div class="value-label">Ejection Fraction (EF)</div>
        <div class="value-data">
          <span class="reference-range">{{ referenceRanges.ef[sex] }}</span>
          <span v-if="predictedValues.ef" class="predicted">
            Predicted: {{ predictedValues.ef }}
          </span>
        </div>
      </div>

      <div class="value-row">
        <div class="value-label">Fractional Shortening (FS)</div>
        <div class="value-data">
          <span class="reference-range">{{ referenceRanges.fs[sex] }}</span>
          <span v-if="predictedValues.fs" class="predicted">
            Predicted: {{ predictedValues.fs }}
          </span>
        </div>
      </div>
    </div>

    <div class="values-section">
      <h3>Left Atrial Dimensions</h3>
      <div class="value-row">
        <div class="value-label">Left Atrial Diameter (LAD)</div>
        <div class="value-data">
          <span class="reference-range">{{ referenceRanges.lad[sex] }}</span>
          <span v-if="predictedValues.lad" class="predicted">
            Predicted: {{ predictedValues.lad }}
          </span>
        </div>
      </div>

      <div class="value-row">
        <div class="value-label">Left Atrial Volume (LAV)</div>
        <div class="value-data">
          <span class="reference-range">{{ referenceRanges.lav[sex] }}</span>
          <span v-if="predictedValues.lav" class="predicted">
            Predicted: {{ predictedValues.lav }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="!hasPredictedValues" class="ml-placeholder">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>Predicted values will be displayed here once ML model analysis is integrated.</p>
    </div>

    <div class="reference-footer">
      <p class="reference-note">
        <strong>Note:</strong> Reference ranges are based on American Society of Echocardiography (ASE) guidelines and may vary based on individual patient characteristics.
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
  }
})

// Reference ranges based on sex (ASE guidelines)
const referenceRanges = {
  lvedd: {
    male: '42-58 mm',
    female: '38-52 mm'
  },
  lvesd: {
    male: '25-40 mm',
    female: '22-35 mm'
  },
  ivs: {
    male: '6-10 mm',
    female: '6-9 mm'
  },
  pwt: {
    male: '6-10 mm',
    female: '6-9 mm'
  },
  lvedv: {
    male: '67-155 mL',
    female: '56-104 mL'
  },
  lvesv: {
    male: '22-58 mL',
    female: '19-49 mL'
  },
  ef: {
    male: '52-72%',
    female: '54-74%'
  },
  fs: {
    male: '25-45%',
    female: '27-45%'
  },
  lad: {
    male: '27-38 mm',
    female: '27-38 mm'
  },
  lav: {
    male: '22-58 mL',
    female: '22-52 mL'
  }
}

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
}

.reference-header h2 {
  color: #333;
  font-size: 20px;
  margin: 0;
}

.sex-indicator {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
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
</style>
