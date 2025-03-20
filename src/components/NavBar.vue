<script setup>
import { ref } from 'vue';
import LoginModal from './LoginModal.vue';

const showLoginModal = ref(false);

const toggleLoginModal = () => {
  showLoginModal.value = !showLoginModal.value;
};

const handleCloseModal = () => {
  showLoginModal.value = false;
};
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-logo">
        <img src="../assets/logo.svg" alt="Logo" class="logo-img">
        <span class="logo-text">Vue Demo</span>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/about" class="nav-link">关于</router-link>
        <router-link to="/services" class="nav-link">服务</router-link>
        <router-link to="/contact" class="nav-link">联系我们</router-link>
        <button class="user-icon" @click="toggleLoginModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
      </div>
    </div>
    <LoginModal v-model:visible="showLoginModal" @close="handleCloseModal" />
  </nav>
</template>

<style scoped>
.navbar {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-img {
  height: 2rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2c3e50;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #2c3e50;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #42b883;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    gap: 1rem;
  }
}

.user-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #2c3e50;
  transition: color 0.3s ease;
}

.user-icon:hover {
  color: #42b883;
}
</style>