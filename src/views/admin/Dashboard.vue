<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>总用户数</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="statistics.userCount">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>总视频数</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="statistics.videoCount">
              <template #prefix>
                <el-icon><VideoCamera /></el-icon>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>总评论数</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="statistics.commentCount">
              <template #prefix>
                <el-icon><ChatDotRound /></el-icon>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>今日访问量</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="statistics.todayVisits">
              <template #prefix>
                <el-icon><View /></el-icon>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近上传的视频</span>
            </div>
          </template>
          <el-table :data="recentVideos" style="width: 100%">
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="uploadTime" label="上传时间" width="180" />
            <el-table-column prop="views" label="播放量" width="100" />
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近注册的用户</span>
            </div>
          </template>
          <el-table :data="recentUsers" style="width: 100%">
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="registerTime" label="注册时间" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                  {{ scope.row.status === 1 ? '正常' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User, VideoCamera, ChatDotRound, View } from '@element-plus/icons-vue'
import axios from 'axios'

const statistics = ref({
  userCount: 0,
  videoCount: 0,
  commentCount: 0,
  todayVisits: 0
})

const recentVideos = ref([])
const recentUsers = ref([])

const fetchDashboardData = async () => {
  try {
    const response = await axios.get('/api/admin/dashboard/statistics')
    if (response.data.code === 200) {
      statistics.value = response.data.data.statistics
      recentVideos.value = response.data.data.recentVideos
      recentUsers.value = response.data.data.recentUsers
    }
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-card {
  height: 120px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
}

.mt-20 {
  margin-top: 20px;
}

.el-statistic {
  text-align: center;
}

.el-icon {
  font-size: 24px;
  margin-right: 8px;
}
</style> 