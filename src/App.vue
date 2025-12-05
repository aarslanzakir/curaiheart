<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from './composables/useAuth'

const router = useRouter()
const route = useRoute()
const { isAuthenticated, user, logout } = useAuth()

const showNavbar = computed(() => {
  return isAuthenticated.value && route.name !== 'Login'
})

const handleLogout = () => {
  logout()
  router.push('/login')
}

const goToDashboard = () => {
  router.push('/')
}

const getUserInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <div id="app">
    <nav v-if="showNavbar" class="navbar">
      <div class="navbar-content">
        <div class="navbar-brand" @click="goToDashboard">
          <div class="brand-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-name">CuraiHeart</span>
            <span class="brand-tagline">Cardiac Care Platform</span>
          </div>
        </div>

        <div class="navbar-center">
          <router-link to="/" class="nav-link" :class="{ active: route.path === '/' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Dashboard
          </router-link>
          <router-link to="/patient/new" class="nav-link" :class="{ active: route.path === '/patient/new' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            New Patient
          </router-link>
        </div>

        <div class="navbar-actions">
          <div class="user-section">
            <div class="user-avatar">
              {{ getUserInitials(user?.name || user?.email) }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ user?.name || 'User' }}</span>
              <span class="user-role">{{ user?.role || 'Clinician' }}</span>
            </div>
          </div>
          <div class="divider"></div>
          <button @click="handleLogout" class="btn-logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>

    <main class="main-content" :class="{ 'with-navbar': showNavbar }">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #f8f9fa;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.navbar-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 30px;
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.navbar-brand:hover {
  opacity: 0.9;
}

.brand-logo {
  background: rgba(255, 255, 255, 0.2);
  padding: 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  color: white;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.brand-tagline {
  color: rgba(255, 255, 255, 0.8);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.navbar-center {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.user-role {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  text-transform: capitalize;
}

.divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.2);
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.3);
}

.main-content {
  flex: 1;
}

.main-content.with-navbar {
  padding-top: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .navbar-center {
    display: none;
  }

  .brand-tagline {
    display: none;
  }
}

@media (max-width: 768px) {
  .navbar-content {
    padding: 0 16px;
    height: 60px;
  }

  .user-details {
    display: none;
  }

  .divider {
    display: none;
  }

  .btn-logout span {
    display: none;
  }

  .btn-logout {
    padding: 10px;
  }
}
</style>
