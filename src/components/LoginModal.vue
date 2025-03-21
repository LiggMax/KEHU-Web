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
  } catch (error) {
    console.error('登录失败', error);
    ElMessage.error('登录失败，请检查用户名和密码');
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
    width="30%"
    :show-close="false"
    @close="handleClose"
  >
    <el-form @submit.prevent="isLogin ? handleLogin : handleRegister">
      <el-form-item label="用户名">
        <el-input
          v-model="username"
          placeholder="请输入用户名"
          :prefix-icon="'User'"
        />
      </el-form-item>
      <el-form-item label="密码">
        <el-input
          type="password"
          v-model="password"
          placeholder="请输入密码"
          :prefix-icon="'Lock'"
          show-password
        />
      </el-form-item>
      <el-form-item label="确认密码" v-if="!isLogin">
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
:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

:deep(.el-dialog__body) {
  padding: 30px 20px;
}

:deep(.el-form) {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item__label) {
  width: 70px;
  text-align: right;
  margin-right: 8px;
  font-weight: 500;
  color: #2c3e50;
}

:deep(.el-form-item__content) {
  margin-left: 78px;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409eff inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.button-group .el-button {
  min-width: 100px;
  transition: all 0.3s ease;
}

.toggle-form {
  text-align: center;
  margin-top: 16px;
}

:deep(.el-link) {
  font-size: 14px;
  transition: all 0.3s ease;
}

:deep(.el-link:hover) {
  text-decoration: underline;
}
</style>