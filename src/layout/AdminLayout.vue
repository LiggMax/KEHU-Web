<template>
  <el-container class="admin-layout">
    <el-aside width="200px">
      <el-menu
        :default-active="activeMenu"
        class="admin-menu"
        router
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/videos">
          <el-icon><VideoCamera /></el-icon>
          <span>视频管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/comments">
          <el-icon><ChatDotRound /></el-icon>
          <span>评论管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <div class="header-left">
          <h2>视频网站管理系统</h2>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="admin-info">
              {{ adminInfo.nickname || adminInfo.username }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { DataLine, User, VideoCamera, ChatDotRound, ArrowDown } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const adminInfo = ref({
  username: '',
  nickname: '',
  id: null
})

const activeMenu = computed(() => route.path)

onMounted(() => {
  // 从localStorage获取管理员信息
  const storedInfo = localStorage.getItem('adminInfo')
  if (storedInfo) {
    try {
      const parsedInfo = JSON.parse(storedInfo)
      adminInfo.value = parsedInfo
    } catch (e) {
      console.error('解析管理员信息失败:', e)
      // 如果解析失败，清除存储并重定向到登录页
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminInfo')
      router.push('/admin/login')
    }
  } else {
    // 如果没有管理员信息，重定向到登录页
    router.push('/admin/login')
  }
})

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      // 调用退出登录接口
      await adminLogoutService()
      
      // 清除本地存储
      localStorage.removeItem('isAdminLoggedIn')
      
      ElMessage.success('退出成功')
      router.push('/admin/login')
    } catch (error) {
      console.error('退出错误:', error)
      ElMessage.error('退出失败，请稍后重试')
    }
  } else if (command === 'profile') {
    router.push('/admin/profile')
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.admin-menu {
  height: 100%;
  border-right: none;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left h2 {
  margin: 0;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

.admin-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
}

.admin-info .el-icon {
  margin-left: 5px;
}

.el-aside {
  background-color: #304156;
}

.el-menu {
  background-color: #304156;
}

.el-menu-item {
  color: #bfcbd9;
}

.el-menu-item:hover {
  background-color: #263445;
}

.el-menu-item.is-active {
  background-color: #263445;
  color: #409eff;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style> 