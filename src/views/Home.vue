<script setup>
import { ref, onMounted } from 'vue'
import { isLoggedIn, getUserInfo } from '../utils/auth.js'
import { getAllVideosService } from '../api/video.js'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

// 路由器
const router = useRouter()
// 登录状态
const loggedIn = ref(false)
// 当前用户信息
const currentUser = ref(null)
// 视频列表
const videoList = ref([])
// 加载状态
const loading = ref(false)

// 页面加载时检查登录状态并加载视频
onMounted(() => {
  if (isLoggedIn()) {
    loggedIn.value = true
    currentUser.value = getUserInfo()
  }
  
  // 加载所有视频
  loadAllVideos()
})

// 加载所有视频
const loadAllVideos = async () => {
  loading.value = true
  try {
    const res = await getAllVideosService()
    if (res.code === 200 && res.data) {
      videoList.value = res.data
    } else {
      videoList.value = []
    }
  } catch (error) {
    console.error('获取视频列表失败', error)
    ElMessage.error('获取视频列表失败，请稍后再试')
    videoList.value = []
  } finally {
    loading.value = false
  }
}

// 查看视频详情
const viewVideo = (videoId) => {
  router.push(`/video/${videoId}`)
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}

// 跳转到用户中心
const goToUserCenter = () => {
  router.push('/user')
}
</script>

<template>
  <div class="home">

    <!-- 视频展示区域 -->
    <section class="videos">
      <h2>精彩视频</h2>
      
      <el-skeleton :loading="loading" animated :count="4" style="width: 100%;">
        <template #template>
          <div class="video-skeleton-grid">
            <div class="video-skeleton" v-for="i in 8" :key="i">
              <div class="skeleton-cover"></div>
              <div class="skeleton-info">
                <div class="skeleton-title"></div>
                <div class="skeleton-desc"></div>
                <div class="skeleton-meta"></div>
              </div>
            </div>
          </div>
        </template>
        
        <template #default>
          <div v-if="videoList.length > 0" class="video-grid">
            <div 
              class="video-card" 
              v-for="video in videoList" 
              :key="video.id"
              @click="viewVideo(video.id)"
            >
              <div class="video-cover">
                <img :src="video.coverUrl" alt="视频封面">
              </div>
              <div class="video-info">
                <h3>{{ video.title }}</h3>
                <p class="video-desc">{{ video.description || '暂无描述' }}</p>
                <div class="video-meta">
                  <span class="views"><i class="el-icon-view"></i> {{ video.viewCount }} 次观看</span>
                  <span class="date">{{ formatDate(video.createTime) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-videos">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#bfbfbf" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                <line x1="7" y1="2" x2="7" y2="22"></line>
                <line x1="17" y1="2" x2="17" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <line x1="2" y1="7" x2="7" y2="7"></line>
                <line x1="2" y1="17" x2="7" y2="17"></line>
                <line x1="17" y1="17" x2="22" y2="17"></line>
                <line x1="17" y1="7" x2="22" y2="7"></line>
              </svg>
            </div>
            <p>暂无视频内容</p>
            <el-button v-if="loggedIn" type="primary" @click="goToUserCenter">上传视频</el-button>
          </div>
        </template>
      </el-skeleton>
    </section>

    <section class="features">
      <h2>平台特性</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <h3>高清视频</h3>
          <p>支持多种格式高清视频上传和播放</p>
        </div>
        <div class="feature-card">
          <h3>便捷分享</h3>
          <p>简单几步即可分享您的精彩瞬间</p>
        </div>
        <div class="feature-card">
          <h3>互动社区</h3>
          <p>交流互动，发现更多精彩内容</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  padding-top: 2rem;
}

.hero {
  text-align: center;
  padding: 4rem 2rem;
  background-color: #f8f9fa;
}

.hero h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.user-welcome, .guest-welcome {
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 600px;
}

.user-welcome h2, .guest-welcome h2 {
  color: #42b883;
  margin-bottom: 1rem;
}

/* 视频展示区域样式 */
.videos {
  padding: 4rem 2rem;
  background-color: white;
}

.videos h2 {
  text-align: center;
  margin-bottom: 3rem;
  color: #333;
  font-size: 2rem;
  font-weight: 600;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.video-card {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background-color: #fff;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.video-cover {
  height: 160px;
  overflow: hidden;
  position: relative;
  background-color: #f5f5f5;
}

.video-cover::before {
  content: '►';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #42b883;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 2;
}

.video-card:hover .video-cover::before {
  opacity: 1;
}

.video-cover::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.video-card:hover .video-cover::after {
  opacity: 1;
}

.video-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.video-card:hover .video-cover img {
  transform: scale(1.05);
}

.video-info {
  padding: 1.2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.video-info h3 {
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  color: #333;
  font-weight: 600;
  line-height: 1.4;
}

.video-desc {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  flex: 1;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 0.85rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f5f5f5;
}

.empty-videos {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-icon {
  margin-bottom: 1.5rem;
}

/* 骨架屏样式 */
.video-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.video-skeleton {
  border-radius: 10px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.skeleton-cover {
  height: 160px;
  background-color: #f2f2f2;
}

.skeleton-info {
  padding: 1.2rem;
}

.skeleton-title {
  height: 24px;
  background-color: #f2f2f2;
  margin-bottom: 0.8rem;
  border-radius: 4px;
}

.skeleton-desc {
  height: 16px;
  background-color: #f2f2f2;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  width: 90%;
}

.skeleton-meta {
  height: 16px;
  background-color: #f2f2f2;
  margin-top: 1rem;
  border-radius: 4px;
  width: 70%;
}

/* 特性部分样式 */
.features {
  padding: 4rem 2rem;
  text-align: center;
  background-color: #f8f9fa;
}

.features h2 {
  margin-bottom: 3rem;
  color: #333;
  font-size: 2rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.feature-card h3 {
  color: #42b883;
  margin-bottom: 1rem;
  font-size: 1.4rem;
}

.feature-card p {
  color: #666;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .home {
    padding-top: 1rem;
  }
  
  .hero, .videos, .features {
    padding: 2rem 1rem;
  }
  
  .hero h1 {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .video-grid, .video-skeleton-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .video-grid, .video-skeleton-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) and (max-width: 1440px) {
  .video-grid, .video-skeleton-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1441px) {
  .video-grid, .video-skeleton-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
