<script setup>
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { loginService, registerService } from "@/api/login.js";
import { getCurrentUserService } from "@/api/user.js"
import { setUserInfo } from '@/utils/auth.js';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  }
});

const isLogin = ref(true);
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const emit = defineEmits(['close', 'update:visible', 'login-success']);

const dialogVisible = ref(props.visible);

watch(() => props.visible, (newValue) => {
  dialogVisible.value = newValue;
});

const handleLogin = async () => {
  if (!username.value || !password.value) {
    ElMessage.warning('用户名和密码不能为空');
    return;
  }
  loading.value = true;
  try {
    const res = await loginService(username.value, password.value);
    if (res.code === 200) {
      // 登录成功后获取用户信息
      const userRes = await getCurrentUserService();
      if (userRes.code === 200 && userRes.data) {
        setUserInfo(userRes.data);
        ElMessage.success('登录成功');
        resetForm();
        handleClose();
        // 通知父组件登录成功
        emit('login-success');
      }
    }
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  if (!username.value || !password.value) {
    ElMessage.warning('用户名和密码不能为空');
    return;
  }
  
  if (password.value !== confirmPassword.value) {
    ElMessage.error('两次输入的密码不一致');
    return;
  }
  
  loading.value = true;
  try {
    const res = await registerService(username.value, password.value);
    if (res.code === 200) {
      ElMessage.success('注册成功，请登录');
      isLogin.value = true;
      resetForm();
    }
  } catch (error) {
    console.error('注册失败', error);
    ElMessage.error('注册失败，请稍后再试');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  username.value = '';
  password.value = '';
  confirmPassword.value = '';
};

const toggleForm = () => {
  isLogin.value = !isLogin.value;
  resetForm();
};

const handleClose = () => {
  emit('close');
  emit('update:visible', false);
};
</script>

<template>
  <el-dialog
    :title="isLogin ? '用户登录' : '用户注册'"
    v-model="dialogVisible"
    width="90%"
    :show-close="false"
    @close="handleClose"
    center
    class="login-dialog"
  >
    <el-form @submit.prevent="isLogin ? handleLogin : handleRegister" class="login-form">
      <el-form-item>
        <div class="form-label">用户名</div>
        <el-input
          v-model="username"
          placeholder="请输入用户名"
          :prefix-icon="'User'"
        />
      </el-form-item>
      <el-form-item>
        <div class="form-label">密码</div>
        <el-input
          type="password"
          v-model="password"
          placeholder="请输入密码"
          :prefix-icon="'Lock'"
          show-password
        />
      </el-form-item>
      <el-form-item v-if="!isLogin">
        <div class="form-label">确认密码</div>
        <el-input
          type="password"
          v-model="confirmPassword"
          placeholder="请再次输入密码"
          :prefix-icon="'Lock'"
          show-password
        />
      </el-form-item>
      <div class="button-group">
        <el-button 
          type="primary" 
          @click="isLogin ? handleLogin() : handleRegister()"
          :loading="loading"
        >
          {{ isLogin ? '登录' : '注册' }}
        </el-button>
        <el-button @click="handleClose">取消</el-button>
      </div>
      <div class="toggle-form">
        <el-link type="primary" @click="toggleForm">
          {{ isLogin ? '没有账号？点击注册' : '已有账号？点击登录' }}
        </el-link>
      </div>
    </el-form>
  </el-dialog>
</template>

<style scoped>
.login-dialog {
  max-width: 420px;
  margin: 0 auto;
}

:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  width: 90% !important;
  max-width: 360px;
  margin: 0 auto !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 20px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  text-align: center;
}

:deep(.el-dialog__title) {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

:deep(.el-dialog__body) {
  padding: 30px 24px;
}

.login-form {
  width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

.form-label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
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

.button-group {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
}

.button-group .el-button {
  flex: 1;
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

.toggle-form {
  text-align: center;
  margin-top: 20px;
}

:deep(.el-link) {
  font-size: 14px;
  transition: all 0.3s ease;
}

:deep(.el-link:hover) {
  text-decoration: underline;
}

@media screen and (max-width: 480px) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin-top: 10vh !important;
  }
  
  :deep(.el-dialog__body) {
    padding: 20px;
  }
  
  .button-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .button-group .el-button {
    width: 100%;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>