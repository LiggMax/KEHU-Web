<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getUserInfo } from '@/utils/auth.js';
import { getAdminInfoService } from '@/api/admin.js';

const router = useRouter();
const currentUser = ref(null);

// 统计数据
const statistics = ref({
  userCount: 0,
  videoCount: 0,
  commentCount: 0,
  todayVisits: 0
});

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
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :span="6">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span>用户总数</span>
              <el-icon><User /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ statistics.userCount }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span>视频总数</span>
              <el-icon><VideoPlay /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ statistics.videoCount }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span>评论总数</span>
              <el-icon><ChatDotRound /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ statistics.commentCount }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span>今日访问</span>
              <el-icon><View /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ statistics.todayVisits }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>访问趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <!-- 这里可以添加图表组件 -->
            <div class="chart-placeholder">访问趋势图表</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>内容分布</span>
            </div>
          </template>
          <div class="chart-container">
            <!-- 这里可以添加图表组件 -->
            <div class="chart-placeholder">内容分布图表</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近活动 -->
    <el-card shadow="hover" class="activity-card">
      <template #header>
        <div class="card-header">
          <span>最近活动</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in 4"
          :key="index"
          :timestamp="'2024-03-' + (index + 1)"
          placement="top"
        >
          <el-card>
            <h4>系统更新</h4>
            <p>系统进行了例行维护和更新</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.statistics-row {
  margin-bottom: 20px;
}

.statistics-card {
  height: 120px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  text-align: center;
  margin-top: 10px;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.chart-container {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-placeholder {
  color: #909399;
  font-size: 14px;
}

.activity-card {
  margin-bottom: 20px;
}

:deep(.el-timeline-item__content) {
  h4 {
    margin: 0;
    color: #303133;
  }
  
  p {
    margin: 5px 0 0;
    color: #606266;
  }
}

@media screen and (max-width: 768px) {
  .el-col {
    width: 100%;
  }
  
  .statistics-card,
  .chart-card {
    margin-bottom: 20px;
  }
}
</style> 