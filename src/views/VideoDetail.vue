<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getVideoById, incrementViewCountService } from '../api/video.js'
import { addCommentService, getCommentsByVideoIdService, countCommentsByVideoIdService, deleteCommentService, likeCommentService } from '../api/comment.js'
import { getUserInfo, isLoggedIn } from '../utils/auth.js'
import LikeIcon from '../assets/点赞.svg'

const route = useRoute()
const router = useRouter()
const videoId = ref(parseInt(route.params.id))
const video = ref(null)
const loading = ref(true)
const currentUser = ref(null)
const videoElement = ref(null)
const videoError = ref(false)
const viewCountUpdated = ref(false)

// 评论相关数据
const commentContent = ref('')
const comments = ref([])
const commentLoading = ref(false)
const commentSubmitting = ref(false)
const commentCount = ref(0)

onMounted(() => {
  // 检查是否登录
  if (isLoggedIn()) {
    currentUser.value = getUserInfo()
  }
  
  // 加载视频信息
  if (videoId.value) {
    loadVideoDetails()
    // 加载评论
    loadComments()
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

// 格式化日期，带时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 返回首页
const goBack = () => {
  router.push('/')
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

// 加载评论
const loadComments = async () => {
  commentLoading.value = true
  try {
    // 加载评论数量
    const countRes = await countCommentsByVideoIdService(videoId.value)
    if (countRes.code === 200) {
      commentCount.value = countRes.data
    }
    
    // 加载评论列表
    const res = await getCommentsByVideoIdService(videoId.value)
    if (res.code === 200 && res.data) {
      comments.value = res.data
    } else {
      comments.value = []
    }
  } catch (error) {
    console.error('获取评论失败', error)
    ElMessage.error('获取评论失败，请稍后再试')
  } finally {
    commentLoading.value = false
  }
}

// 提交评论
const submitComment = async () => {
  if (!isLoggedIn()) {
    ElMessage.warning('请先登录再评论')
    return
  }
  
  if (!commentContent.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }
  
  commentSubmitting.value = true
  try {
    const res = await addCommentService({
      content: commentContent.value,
      videoId: videoId.value
    })
    
    if (res.code === 200 && res.data) {
      // 添加到评论列表
      comments.value.unshift(res.data)
      // 更新评论数量
      commentCount.value++
      // 清空评论输入框
      commentContent.value = ''
      ElMessage.success('评论发布成功')
    } else {
      ElMessage.error(res.message || '评论失败')
    }
  } catch (error) {
    console.error('发布评论失败', error)
    ElMessage.error('发布评论失败，请稍后再试')
  } finally {
    commentSubmitting.value = false
  }
}

// 删除评论
const deleteComment = async (id, index) => {
  try {
    const result = await ElMessageBox.confirm(
      '确定要删除这条评论吗？此操作不可撤销',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    if (result === 'confirm') {
      const res = await deleteCommentService(id)
      if (res.code === 200) {
        // 从列表中移除
        comments.value.splice(index, 1)
        // 更新评论数量
        commentCount.value--
        ElMessage.success('删除成功')
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败', error)
      ElMessage.error('删除评论失败，请稍后再试')
    }
  }
}

// 给评论点赞
const likeComment = async (id, index) => {
  try {
    const res = await likeCommentService(id)
    if (res.code === 200) {
      // 更新本地评论点赞数
      comments.value[index].likes++
      ElMessage.success('点赞成功')
    } else {
      ElMessage.error(res.message || '点赞失败')
    }
  } catch (error) {
    console.error('点赞失败', error)
    ElMessage.error('点赞失败，请稍后再试')
  }
}

// 是否可以删除评论
const canDeleteComment = (userId) => {
  return currentUser.value && (
    currentUser.value.userId === userId || 
    (video.value && currentUser.value.userId === video.value.userId) // 视频作者也可以删除
  )
}

// 在组件卸载时停止视频播放
onUnmounted(() => {
  if (videoElement.value) {
    videoElement.value.pause()
    videoElement.value.src = ''
  }
})

// 根据分类搜索
const searchByCategory = (category) => {
  router.push({
    path: '/search',
    query: { keyword: category }
  })
}
</script>

<template>
  <div class="video-detail-container">
    <div v-if="loading" class="loading-container">
      <el-skeleton animated :rows="10" />
    </div>
    
    <template v-else-if="video">
      <div class="video-navigation">
        <el-button @click="goBack" plain>返回首页</el-button>
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
          <span class="category" v-if="video.category">
            分类: <el-tag size="small" type="success" @click="searchByCategory(video.category)" class="clickable-tag">{{ video.category }}</el-tag>
          </span>
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
        
        <!-- 评论区 -->
        <div class="comments-section">
          <h3>评论区 ({{ commentCount }})</h3>
          
          <!-- 评论框 -->
          <div class="comment-form" v-if="isLoggedIn()">
            <div class="comment-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#42b883" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="comment-input-wrapper">
              <el-input
                v-model="commentContent"
                type="textarea"
                :rows="3"
                placeholder="写下你的评论..."
                :disabled="commentSubmitting"
                maxlength="1000"
                show-word-limit
              ></el-input>
              <div class="comment-actions">
                <el-button 
                  type="primary" 
                  @click="submitComment" 
                  :loading="commentSubmitting"
                  :disabled="!commentContent.trim()"
                >发表评论</el-button>
              </div>
            </div>
          </div>
          
          <div class="login-to-comment" v-else>
            <p>请先 <el-button type="text" @click="router.push('/')">登录</el-button> 后发表评论</p>
          </div>
          
          <!-- 评论列表 -->
          <div class="comments-list" v-if="!commentLoading">
            <div v-if="comments.length === 0" class="no-comments">
              <p>暂无评论，快来发表第一条评论吧!</p>
            </div>
            
            <div v-else class="comment-item" v-for="(comment, index) in comments" :key="comment.id">
              <div class="comment-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#42b883" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.username || `用户ID: ${comment.userId}` }}</span>
                  <span class="comment-time">{{ formatDateTime(comment.createTime) }}</span>
                </div>
                <div class="comment-text">{{ comment.content }}</div>
                <div class="comment-footer">
                  <div class="comment-likes" @click="likeComment(comment.id, index)">
                    <img :src="LikeIcon" alt="点赞" class="like-icon" />
                    <span>{{ comment.likes || 0 }}</span>
                  </div>
                  <div class="comment-actions">
                    <el-button 
                      v-if="canDeleteComment(comment.userId)" 
                      type="danger" 
                      size="small" 
                      text 
                      @click="deleteComment(comment.id, index)"
                    >删除</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="comments-loading">
            <el-skeleton animated :rows="3" />
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

/* 评论区样式 */
.comments-section {
  margin-top: 2.5rem;
  border-top: 1px solid #f0f0f0;
  padding-top: 2rem;
}

.comments-section h3 {
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  color: #333;
  display: flex;
  align-items: center;
}

.comment-form {
  display: flex;
  margin-bottom: 2rem;
  gap: 1rem;
}

.comment-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background-color: #f0f9f4;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.comment-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.login-to-comment {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 2rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.comment-author {
  font-weight: 500;
  color: #333;
}

.comment-time {
  color: #999;
  font-size: 0.85rem;
}

.comment-text {
  color: #555;
  line-height: 1.6;
  margin-bottom: 0.5rem;
  white-space: pre-line;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.comment-likes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s, color 0.2s;
}

.comment-likes:hover {
  background-color: #f0f0f0;
  color: #42b883;
}

.like-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}

.comment-likes:hover .like-icon {
  transform: scale(1.2);
}

.no-comments {
  text-align: center;
  padding: 2rem;
  color: #999;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.comments-loading {
  margin-top: 1rem;
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
  
  .comment-form {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .comment-avatar {
    margin-bottom: 0.5rem;
  }
  
  .comment-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .comment-header {
    flex-direction: column;
    gap: 0.3rem;
  }
  
  .comment-footer {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.clickable-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.clickable-tag:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style> 