<template>
  <div class="signup-container">
    <div class="signup-card">
      <div class="signup-header">
        <h1>CuraiHeart</h1>
        <p>Create Your Account</p>
      </div>

      <form @submit.prevent="handleSignup" class="signup-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input
            id="name"
            v-model="userData.name"
            type="text"
            required
            placeholder="Enter your full name"
            :disabled="loading"
            minlength="2"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="userData.email"
            type="email"
            required
            placeholder="Enter your email"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="userData.password"
            type="password"
            required
            placeholder="Enter your password (min 6 characters)"
            :disabled="loading"
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Confirm your password"
            :disabled="loading"
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="role">Role</label>
          <select
            id="role"
            v-model="userData.role"
            required
            :disabled="loading"
          >
            <option value="clinician">Clinician</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Creating Account...' : 'Sign Up' }}
        </button>

        <div class="login-link">
          Already have an account?
          <router-link to="/login">Login here</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { signup } = useAuth()

const userData = ref({
  name: '',
  email: '',
  password: '',
  role: 'clinician'
})

const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleSignup = async () => {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  // Validate password confirmation
  if (userData.value.password !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    loading.value = false
    return
  }

  // Validate password length
  if (userData.value.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long'
    loading.value = false
    return
  }

  // Validate name length
  if (userData.value.name.length < 2) {
    errorMessage.value = 'Name must be at least 2 characters long'
    loading.value = false
    return
  }

  const result = await signup(userData.value)

  loading.value = false

  if (result.success) {
    successMessage.value = 'Account created successfully! Please login to continue.'
    // Clear the form and localStorage to require explicit login
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    // Redirect to login page after 2 seconds
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } else {
    errorMessage.value = result.error
  }
}
</script>

<style scoped>
.signup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.signup-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
}

.signup-header {
  text-align: center;
  margin-bottom: 30px;
}

.signup-header h1 {
  color: #667eea;
  font-size: 32px;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.signup-header p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  font-family: inherit;
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

.form-group select {
  cursor: pointer;
  background-color: white;
}

.form-group select:disabled {
  cursor: not-allowed;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

.success-message {
  background-color: #efe;
  color: #2a7;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-top: 10px;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.login-link a:hover {
  color: #764ba2;
  text-decoration: underline;
}
</style>
