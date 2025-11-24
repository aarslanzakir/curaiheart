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
</script>

<template>
  <div id="app">
    <nav v-if="showNavbar" class="navbar">
      <div class="navbar-content">
        <div class="navbar-brand">
          <h1>CuraiHeart</h1>
        </div>
        <div class="navbar-actions">
          <span class="user-info">{{ user?.name || user?.email }}</span>
          <button @click="handleLogout" class="btn-logout">Logout</button>
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
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand h1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 24px;
  font-weight: 700;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.btn-logout {
  background: #f5f5f5;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-logout:hover {
  background: #e0e0e0;
}

.main-content {
  flex: 1;
}

.main-content.with-navbar {
  padding-top: 0;
}
</style>
