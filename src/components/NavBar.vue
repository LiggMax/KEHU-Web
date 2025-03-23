<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import LoginModal from './LoginModal.vue';
import { ElMessage, ElDropdown, ElDropdownMenu, ElDropdownItem, ElAutocomplete } from 'element-plus';
import { isLoggedIn, removeUserInfo } from '../utils/auth.js';
import { getCurrentUserService } from '../api/user.js';
import { logoutService } from '@/api/user.js';
import { getSearchSuggestionsService } from '@/api/search.js';

const router = useRouter();
const showLoginModal = ref(false);
const loggedIn = ref(false);
const currentUser = ref(null);
const searchKeyword = ref('');
const searchSuggestions = ref([]);
const suggestionsLoading = ref(false);

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

// 处理搜索
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchKeyword.value }
    });
    searchKeyword.value = '';
  }
};

// 获取搜索建议
const querySearchSuggestions = async (query, cb) => {
  if (!query || query.trim() === '') {
    cb([]);
    return;
  }
  
  suggestionsLoading.value = true;
  try {
    const res = await getSearchSuggestionsService(query);
    // request.js已处理错误情况，只需处理成功响应
    const suggestions = res.data.map(item => ({
      value: item
    }));
    cb(suggestions);
  } catch {
    // 错误已由request.js处理，这里保持静默
    cb([]);
  } finally {
    suggestionsLoading.value = false;
  }
};

// 选择搜索建议
const handleSelect = (item) => {
  searchKeyword.value = item.value;
  handleSearch();
};
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-logo">
        <img src="../assets/logo.svg" alt="Logo" class="logo-img">
        <span class="logo-text">Vue Demo</span>
      </div>

      <!-- 搜索框部分 -->
      <div class="search-container">
        <div class="search-box">
          <el-autocomplete
            v-model="searchKeyword"
            :fetch-suggestions="querySearchSuggestions"
            placeholder="搜索视频..."
            class="search-input"
            @select="handleSelect"
            @keyup.enter="handleSearch"
            :trigger-on-focus="false"
            :loading="suggestionsLoading"
            popper-class="search-suggestions"
          >
            <template #suffix>
              <button class="search-button" @click="handleSearch">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </template>
          </el-autocomplete>
        </div>
      </div>

      <div class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
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
  flex: 1;
}

.logo-img {
  height: 2rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2c3e50;
}

/* 搜索框样式 */
.search-container {
  flex: 2;
  display: flex;
  justify-content: center;
  padding: 0 1rem;
  max-width: 500px;
}

.search-box {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
}

.search-input {
  width: 100%;
}

:deep(.el-input__wrapper) {
  border-radius: 20px;
  background-color: #f5f7fa;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.3s ease;
  padding-right: 0;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
  background-color: #ffffff;
}

:deep(.el-input__inner) {
  height: 40px;
  padding-left: 15px;
  font-size: 14px;
  color: #2c3e50;
}

.search-button {
  height: 40px;
  width: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #606266;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.search-button:hover {
  color: #409eff;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
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

/* 搜索建议下拉菜单样式 */
:deep(.search-suggestions) {
  width: 100%;
}

:deep(.search-suggestions .el-autocomplete-suggestion__list) {
  padding: 8px 0;
}

:deep(.search-suggestions .el-autocomplete-suggestion__list li) {
  padding: 8px 16px;
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
}

:deep(.search-suggestions .el-autocomplete-suggestion__list li:hover) {
  background-color: #f5f7fa;
}

@media (max-width: 992px) {
  .nav-container {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .nav-logo {
    order: 1;
    flex: 1;
  }
  
  .search-container {
    order: 3;
    flex: 100%;
    max-width: 100%;
    padding: 0;
  }
  
  .nav-links {
    order: 2;
    flex: 1;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-logo {
    justify-content: center;
  }
  
  .search-container {
    width: 100%;
    order: 2;
  }

  .nav-links {
    width: 100%;
    order: 3;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .nav-links {
    gap: 0.5rem;
  }
  
  .nav-link {
    font-size: 14px;
    padding: 0.5rem;
  }
}
</style>