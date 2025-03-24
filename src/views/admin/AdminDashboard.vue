<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getUserInfo } from '@/utils/auth.js';
import { getAdminInfoService } from '@/api/admin.js';

const router = useRouter();
const currentUser = ref(null);

onMounted(async () => {
  // 获取当前用户信息
  const userInfo = getUserInfo();
  if (!userInfo || !userInfo.id) {
    ElMessage.error('请先登录');
    router.push('/admin/login');
    return;
  }
  
  try {
    // 获取管理员详细信息
    const res = await getAdminInfoService(userInfo.id);
    if (res.code === 200) {
      currentUser.value = res.data;
    } else {
      ElMessage.error('获取管理员信息失败');
      router.push('/admin/login');
    }
  } catch (error) {
    console.error('获取管理员信息失败', error);
    ElMessage.error('获取管理员信息失败');
    router.push('/admin/login');
  }
});
</script>

<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1>管理后台</h1>
      <div class="user-info">
        欢迎，{{ currentUser?.nickname || currentUser?.username }}
      </div>
    </div>
    
    <div class="dashboard-content">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="dashboard-card">
            <template #header>
              <div class="card-header">
                <span>用户管理</span>
              </div>
            </template>
            <div class="card-content">
              <p>管理用户账号、权限等</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="dashboard-card">
            <template #header>
              <div class="card-header">
                <span>内容管理</span>
              </div>
            </template>
            <div class="card-content">
              <p>管理视频、评论等内容</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="dashboard-card">
            <template #header>
              <div class="card-header">
                <span>系统设置</span>
              </div>
            </template>
            <div class="card-content">
              <p>系统配置、日志等</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.dashboard-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
}

.user-info {
  color: #606266;
  font-size: 16px;
}

.dashboard-content {
  margin-top: 20px;
}

.dashboard-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.card-content {
  color: #606266;
  line-height: 1.6;
}

@media screen and (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .el-col {
    width: 100%;
  }
}
</style> 