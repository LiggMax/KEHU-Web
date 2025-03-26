<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <h1>管理员仪表板</h1>
      <button @click="handleLogout" class="logout-btn">退出登录</button>
    </header>
    <div class="dashboard-content">
      <div class="welcome-message">
        欢迎回来，管理员
      </div>
      <!-- 这里可以添加更多的管理功能组件 -->
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  // 清除管理员token
  localStorage.removeItem('admin_token')
  // 跳转到管理员登录页
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.dashboard-header {
  background-color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  margin: 0;
  color: #333;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #d32f2f;
}

.dashboard-content {
  padding: 2rem;
}

.welcome-message {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-size: 1.2rem;
  color: #666;
}
</style> 