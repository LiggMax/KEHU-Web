<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import LoginModal from './LoginModal.vue';
import { ElMessage, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import { isLoggedIn, removeUserInfo } from '../utils/auth.js';
import { getCurrentUserService } from '../api/user.js';
import { logoutService } from '@/api/user.js'

const router = useRouter();
const showLoginModal = ref(false);
const loggedIn = ref(false);
const currentUser = ref(null);

// 页面加载时检查登录状态
onMounted(async () => {
  checkLoginStatus();
});

// 检查登录状态
const checkLoginStatus = async () => {
  // 从本地存储中获取用户信息
  if (isLoggedIn()) {
    try {
      // 向后端验证会话是否有效
      const res = await getCurrentUserService();
      if (res.code === 200 && res.data) {
        currentUser.value = res.data;
        loggedIn.value = true;
      }
    } catch (error) {
      // 会话无效，清除本地存储
      removeUserInfo();
    }
  }
};

const toggleLoginModal = () => {
  // 如果用户已登录，点击时进入用户中心
  if (loggedIn.value) {
    router.push('/user-center');
  } else {
    showLoginModal.value = !showLoginModal.value;
  }
};

const handleCloseModal = () => {
  showLoginModal.value = false;
  // 关闭模态框后检查登录状态
  checkLoginStatus();
};

// 退出登录
const handleLogout = async () => {
  try {
    await logoutService();
    // 清除用户信息
    removeUserInfo();
    currentUser.value = null;
    loggedIn.value = false;
    ElMessage.success('已退出登录');
    // 退出后跳转到首页
    router.push('/');
  } catch (error) {
    console.error('退出失败', error);
  }
};

// 前往用户中心
const goToUserCenter = () => {
  router.push('/user-center');
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
        
        <!-- 用户图标 - 未登录点击显示登录框，已登录点击进入用户中心 -->
        <div class="user-container">
          <button class="user-icon" @click="toggleLoginModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
          
          <!-- 已登录显示用户名 -->
          <el-dropdown v-if="loggedIn" trigger="click">
            <span class="username">{{ currentUser.username }}</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToUserCenter">个人中心</el-dropdown-item>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
    <LoginModal v-model:visible="showLoginModal" @close="handleCloseModal" @login-success="checkLoginStatus" />
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
  align-items: center;
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

.user-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.username {
  font-weight: 500;
  color: #2c3e50;
  cursor: pointer;
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
</style>