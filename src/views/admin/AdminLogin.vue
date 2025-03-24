<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { adminLoginService } from "@/api/admin.js";
import { setUserInfo } from '@/utils/auth.js';

const router = useRouter();
const username = ref('');
const password = ref('');
const loading = ref(false);

const handleLogin = async () => {
  if (!username.value || !password.value) {
    ElMessage.warning('用户名和密码不能为空');
    return;
  }
  
  loading.value = true;
  try {
    const res = await adminLoginService(username.value, password.value);
    if (res.code === 200) {
      // 保存用户信息到本地存储
      setUserInfo(res.data);
      ElMessage.success('登录成功');
      // 登录成功后跳转到管理后台
      router.push('/admin/dashboard');
    }
  } catch (error) {
    console.error('登录失败', error);
    ElMessage.error('登录失败，请检查用户名和密码');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="admin-login-container">
    <div class="login-box">
      <h2>管理员登录</h2>
      <el-form @submit.prevent="handleLogin" class="login-form">
        <el-form-item>
          <el-input
            v-model="username"
            placeholder="请输入管理员用户名"
            :prefix-icon="'User'"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            type="password"
            v-model="password"
            placeholder="请输入密码"
            :prefix-icon="'Lock'"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleLogin"
            :loading="loading"
            class="login-button"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 24px;
}

.login-form {
  width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 25px;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.3s ease;
  border-radius: 6px;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409eff inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

:deep(.el-input__inner) {
  height: 40px;
}

.login-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.el-button--primary) {
  background-color: #409eff;
}

:deep(.el-button--primary:hover) {
  background-color: #66b1ff;
}

@media screen and (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }
  
  h2 {
    font-size: 20px;
    margin-bottom: 25px;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
}
</style> 