<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getVideoById, incrementViewCountService } from '../api/video.js'
import { getUserInfo, isLoggedIn } from '../utils/auth.js'

const route = useRoute()
const router = useRouter()
const videoId = ref(parseInt(route.params.id))
const video = ref(null)
const loading = ref(true)
const currentUser = ref(null)
const videoElement = ref(null)
const videoError = ref(false)
const viewCountUpdated = ref(false)

onMounted(() => {
  // 检查是否登录
  if (isLoggedIn()) {
    currentUser.value = getUserInfo()
  }
  
  // 加载视频信息
  if (videoId.value) {
    loadVideoDetails()
  } else {
    ElMessage.error('无效的视频ID')
    router.push('/')
  }
})

// 加载视频详情
const loadVideoDetails = async () => {
  loading.value = true
  try {
    const res = await getVideoById(videoId.value)
    if (res.code === 200 && res.data) {
      video.value = res.data
    } else {
      ElMessage.error(res.message || '视频不存在')
      router.push('/')
    }
  } catch (error) {
    console.error('获取视频信息失败', error)
    ElMessage.error('获取视频信息失败')
    router.push('/')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}

// 返回首页
const goBack = () => {
  router.push('/')
}

// 返回用户中心
const goToUserCenter = () => {
  router.push('/user')
}

// 监听视频播放错误
const handleVideoError = (e) => {
  console.error('视频播放错误:', e)
  videoError.value = true
  ElMessage.error('视频播放失败，可能是格式不支持或文件不存在')
}

// 监听视频播放开始
const handleVideoPlay = () => {
  // 仅在第一次播放时增加观看次数
  if (!viewCountUpdated.value) {
    incrementViewCount()
    viewCountUpdated.value = true
  }
}

// 增加视频观看次数
const incrementViewCount = async () => {
  try {
    await incrementViewCountService(videoId.value)
    // 更新本地视频数据的观看次数
    if (video.value) {
      video.value.viewCount += 1
    }
  } catch (error) {
    console.error('更新观看次数失败', error)
  }
}

// 在组件卸载时停止视频播放
onUnmounted(() => {
  if (videoElement.value) {
    videoElement.value.pause()
    videoElement.value.src = ''
  }
})
</script>

<template>
  <div class="video-detail-container">
    <div v-if="loading" class="loading-container">
      <el-skeleton animated :rows="10" />
    </div>
    
    <template v-else-if="video">
      <div class="video-navigation">
        <el-button @click="goBack" plain>返回首页</el-button>
        <el-button @click="goToUserCenter" type="primary" v-if="isLoggedIn()">我的视频</el-button>
      </div>
    
      <div class="video-player-container">
        <video 
          ref="videoElement"
          class="video-player" 
          controls 
          autoplay
          :src="video.filePath"
          :poster="video.videoImg || video.coverUrl"
          @error="handleVideoError"
          @play="handleVideoPlay"
        ></video>
        
        <div v-if="videoError" class="video-error-overlay">
          <div class="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <p>视频加载失败</p>
          <p class="error-path">{{ video.filePath }}</p>
        </div>
      </div>
      
      <div class="video-info-container">
        <h1 class="video-title">{{ video.title }}</h1>
        
        <div class="video-meta">
          <span class="views">{{ video.viewCount }} 次观看</span>
          <span class="date">发布于: {{ formatDate(video.createTime) }}</span>
          <span class="category" v-if="video.category">分类: {{ video.category }}</span>
        </div>
        
        <div class="video-description">
          <h3>视频描述</h3>
          <p>{{ video.description || '暂无描述' }}</p>
        </div>
        
        <div class="video-uploader">
          <h3>上传者信息</h3>
          <div class="uploader-info">
            <div class="uploader-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#42b883" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="uploader-details">
              <span class="uploader-name">用户 ID: {{ video.userId }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <div v-else class="no-video">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#bfbfbf" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <p>视频不存在或已被删除</p>
      <el-button type="primary" @click="goBack">返回首页</el-button>
    </div>
  </div>
</template>

<style scoped>
.video-detail-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.loading-container {
  margin: 3rem auto;
  max-width: 800px;
}

.video-navigation {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.video-player-container {
  background-color: #000;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
}

.video-player {
  width: 100%;
  max-height: 70vh;
  display: block;
}

.video-info-container {
  background-color: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.video-title {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 600;
  line-height: 1.4;
}

.video-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  color: #666;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.views {
  font-weight: 500;
}

.category {
  background-color: #f0f9f4;
  color: #42b883;
  padding: 2px 10px;
  border-radius: 15px;
  font-weight: 500;
}

.video-description {
  margin-bottom: 2rem;
}

.video-description h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #333;
}

.video-description p {
  color: #666;
  line-height: 1.6;
  white-space: pre-line;
}

.video-uploader {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.video-uploader h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #333;
}

.uploader-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.uploader-avatar {
  background-color: #f0f9f4;
  border-radius: 50%;
  padding: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.uploader-name {
  font-weight: 500;
  color: #333;
}

.no-video {
  text-align: center;
  padding: 4rem 2rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin: 3rem auto;
  max-width: 500px;
}

.empty-icon {
  margin-bottom: 1.5rem;
}

.video-error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  padding: 2rem;
}

.error-icon {
  margin-bottom: 1rem;
}

.error-path {
  font-size: 0.85rem;
  opacity: 0.7;
  margin-top: 0.5rem;
  word-break: break-all;
  max-width: 80%;
}

@media (max-width: 768px) {
  .video-detail-container {
    margin: 1rem auto;
  }
  
  .video-player {
    max-height: 50vh;
  }
  
  .video-info-container {
    padding: 1.5rem;
  }
  
  .video-title {
    font-size: 1.5rem;
  }
}
</style> 