<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getUserInfo } from '@/utils/auth.js';

const router = useRouter();
const isCollapse = ref(false);
const currentUser = ref(getUserInfo());

// 菜单项配置
const menuItems = [
  {
    title: '控制台',
    icon: 'Monitor',
    path: '/admin/dashboard'
  },
  {
    title: '用户管理',
    icon: 'User',
    path: '/admin/users'
  },
  {
    title: '视频管理',
    icon: 'VideoPlay',
    path: '/admin/videos'
  },
  {
    title: '评论管理',
    icon: 'ChatDotRound',
    path: '/admin/comments'
  },
  {
    title: '系统设置',
    icon: 'Setting',
    path: '/admin/settings'
  }
];

// 处理菜单点击
const handleMenuClick = (path) => {
  router.push(path);
};

// 退出登录
const handleLogout = () => {
  // 清除用户信息
  localStorage.removeItem('login_user');
  ElMessage.success('已退出登录');
  router.push('/admin/login');
};
</script>

<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="admin-aside">
      <div class="logo-container">
        <img src="@/assets/logo.svg" alt="Logo" class="logo-img">
        <span v-show="!isCollapse" class="logo-text">管理后台</span>
      </div>
      
      <el-menu
        :default-active="$route.path"
        class="admin-menu"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item 
          v-for="item in menuItems" 
          :key="item.path"
          :index="item.path"
          @click="handleMenuClick(item.path)"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主要内容区 -->
    <el-container class="admin-container">
      <!-- 顶部导航栏 -->
      <el-header class="admin-header">
        <div class="header-left">
          <el-icon 
            class="collapse-btn"
            @click="isCollapse = !isCollapse"
          >
            <Fold v-if="!isCollapse"/>
            <Expand v-else/>
          </el-icon>
        </div>
        
        <div class="header-right">
          <el-dropdown trigger="click">
            <span class="user-info">
              <el-avatar :size="32" :src="currentUser?.avatar">
                {{ currentUser?.nickname?.[0] || currentUser?.username?.[0] }}
              </el-avatar>
              <span class="username">{{ currentUser?.nickname || currentUser?.username }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="admin-main">
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
}

.admin-aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #2b2f3a;
}

.logo-img {
  height: 32px;
  margin-right: 12px;
}

.logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.admin-menu {
  border-right: none;
}

.admin-menu:not(.el-menu--collapse) {
  width: 200px;
}

.admin-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.admin-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
}

.collapse-btn:hover {
  color: #409EFF;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  color: #606266;
}

.admin-main {
  background-color: #f0f2f5;
  padding: 20px;
  flex: 1;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .admin-aside {
    position: fixed;
    z-index: 1000;
    height: 100vh;
    transform: translateX(-100%);
  }
  
  .admin-aside:not(.el-menu--collapse) {
    transform: translateX(0);
  }
  
  .admin-container {
    margin-left: 0;
  }
}
</style> 