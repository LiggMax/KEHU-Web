<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';
import { ElMessage, ElUpload, ElMessageBox } from 'element-plus';
import { isLoggedIn, getUserInfo } from '../utils/auth.js';
import { useRouter } from 'vue-router';
import { deleteVideoService, updateCoverService } from '../api/video.js';
import { UploadFilled, VideoCamera } from '@element-plus/icons-vue';
import { getUserVideosService,uploadVideoService } from '@/api/user.js'

const router = useRouter();
const currentUser = ref(null);
const videoList = ref([]);
const dialogVisible = ref(false);
const coverDialogVisible = ref(false);
const selectedVideoId = ref(null);
const coverFile = ref(null);
const coverUploading = ref(false);
const videoForm = reactive({
  title: '',
  description: '',
  videoFile: null,
  coverFile: null
});

// 上传进度
const uploadProgress = ref(0);
const uploading = ref(false);

// 计算属性：封面预览URL
const coverPreviewUrl = computed(() => {
  if (videoForm.coverFile && window.URL) {
    return window.URL.createObjectURL(videoForm.coverFile);
  }
  return '';
});

// 计算属性：新封面预览URL
const newCoverPreviewUrl = computed(() => {
  if (coverFile.value && window.URL) {
    return window.URL.createObjectURL(coverFile.value);
  }
  return '';
});

onMounted(() => {
  // 检查是否已登录
  if (!isLoggedIn()) {
    ElMessage.warning('请先登录');
    router.push('/');
    return;
  }
  
  // 获取用户信息
  currentUser.value = getUserInfo();
  
  // 加载用户视频列表
  loadUserVideos();
});

// 加载用户视频列表
const loadUserVideos = async () => {
  try {
    const res = await getUserVideosService();
    if (res.code === 200 && res.data) {
      videoList.value = res.data;
    } else {
      videoList.value = [];
    }
  } catch (error) {
    console.error('获取视频列表失败', error);
    videoList.value = [];
    ElMessage.error('获取视频列表失败，请刷新页面重试');
  }
};

// 打开上传视频对话框
const openUploadDialog = () => {
  dialogVisible.value = true;
};

// 关闭上传视频对话框
const closeUploadDialog = () => {
  dialogVisible.value = false;
  // 重置表单
  clearUploadForm();
};

// 处理视频文件选择
const handleVideoChange = (file) => {
  if (file.raw) {
    // 检查文件类型
    const acceptedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv'];
    if (!acceptedTypes.includes(file.raw.type) && !file.raw.name.match(/\.(mp4|avi|mov|wmv|flv|mkv)$/i)) {
      ElMessage.warning('请上传支持的视频格式文件');
      return false;
    }
    
    // 检查文件大小，限制为1000MB
    const maxSize = 1000 * 1024 * 1024; // 1000MB
    if (file.raw.size > maxSize) {
      ElMessage.warning('文件大小不能超过1000MB');
      return false;
    }
    
    videoForm.videoFile = file.raw;
  }
  return false; // 阻止默认上传行为
};

// 处理封面文件选择(视频上传时)
const handleCoverChange = (file) => {
  if (file.raw) {
    // 检查文件类型
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!acceptedTypes.includes(file.raw.type) && !file.raw.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      ElMessage.warning('请上传支持的图片格式文件');
      return false;
    }
    
    // 检查文件大小，限制为5MB
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.raw.size > maxSize) {
      ElMessage.warning('封面图片大小不能超过5MB');
      return false;
    }
    
    videoForm.coverFile = file.raw;
  }
  return false; // 阻止默认上传行为
};

// 处理封面文件选择(单独更新封面)
const handleCoverFileChange = (file) => {
  if (file.raw) {
    // 检查文件类型
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!acceptedTypes.includes(file.raw.type) && !file.raw.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      ElMessage.warning('请上传支持的图片格式文件');
      return false;
    }
    
    // 检查文件大小，限制为5MB
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.raw.size > maxSize) {
      ElMessage.warning('封面图片大小不能超过5MB');
      return false;
    }
    
    coverFile.value = file.raw;
  }
  return false; // 阻止默认上传行为
};

// 移除封面图片
const removeCover = () => {
  videoForm.coverFile = null;
};

// 移除新封面
const removeNewCover = () => {
  if (coverFile.value && newCoverPreviewUrl.value) {
    window.URL.revokeObjectURL(newCoverPreviewUrl.value);
  }
  coverFile.value = null;
};

// 提交视频上传
const submitVideo = async () => {
  if (!videoForm.title) {
    ElMessage.warning('请输入视频标题');
    return;
  }
  
  if (!videoForm.videoFile) {
    ElMessage.warning('请选择视频文件');
    return;
  }
  
  uploading.value = true;
  
  try {
    // 创建上传进度监听器
    const onUploadProgress = (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        uploadProgress.value = percentCompleted;
      }
    };
    
    // 调用上传API
    const res = await uploadVideoService({
      title: videoForm.title,
      description: videoForm.description,
      videoFile: videoForm.videoFile,
      coverFile: videoForm.coverFile
    }, onUploadProgress);
    
    // 处理上传结果
    if (res.code === 200) {
      ElMessage.success('视频上传成功');
      
      // 添加到视频列表
      if (res.data) {
        videoList.value.unshift(res.data);
      }
      
      closeUploadDialog();
    } else {
      ElMessage.error(res.message || '上传失败');
    }
  } catch (error) {
    console.error('上传视频失败', error);
    ElMessage.error('上传视频失败，请稍后再试');
  } finally {
    uploading.value = false;
  }
};

// 清除上传表单
const clearUploadForm = () => {
  videoForm.title = '';
  videoForm.description = '';
  videoForm.videoFile = null;
  videoForm.coverFile = null;
  uploadProgress.value = 0;
};

// 删除视频
const deleteVideo = async (id) => {
  try {
    const confirmResult = await ElMessageBox.confirm(
      '确定要删除这个视频吗？此操作不可撤销。',
      '删除提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    if (confirmResult === 'confirm') {
      const res = await deleteVideoService(id);
      
      if (res.code === 200) {
        videoList.value = videoList.value.filter(video => video.id !== id);
        ElMessage.success('删除成功');
      } else {
        ElMessage.error(res.message || '删除失败');
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除视频失败', error);
      ElMessage.error('删除视频失败，请稍后再试');
    }
  }
};

// 打开更新封面对话框
const openCoverDialog = (videoId) => {
  selectedVideoId.value = videoId;
  coverFile.value = null;
  coverDialogVisible.value = true;
};

// 关闭更新封面对话框
const closeCoverDialog = () => {
  coverDialogVisible.value = false;
  if (coverFile.value && newCoverPreviewUrl.value) {
    window.URL.revokeObjectURL(newCoverPreviewUrl.value);
  }
  coverFile.value = null;
  selectedVideoId.value = null;
};

// 提交更新封面
const submitCoverUpdate = async () => {
  if (!selectedVideoId.value) {
    ElMessage.warning('视频ID无效');
    return;
  }
  
  if (!coverFile.value) {
    ElMessage.warning('请选择封面图片');
    return;
  }
  
  coverUploading.value = true;
  
  try {
    const res = await updateCoverService(selectedVideoId.value, coverFile.value);
    
    if (res.code === 200) {
      ElMessage.success('封面更新成功');
      
      // 更新视频列表中的对应视频
      await loadUserVideos();
      
      closeCoverDialog();
    } else {
      ElMessage.error(res.message || '更新失败');
    }
  } catch (error) {
    console.error('更新封面失败', error);
    ElMessage.error('更新封面失败，请稍后再试');
  } finally {
    coverUploading.value = false;
  }
};

// 组件销毁时清理资源
onUnmounted(() => {
  // 清理blob URL
  if (coverFile.value && newCoverPreviewUrl.value) {
    window.URL.revokeObjectURL(newCoverPreviewUrl.value);
  }
  if (videoForm.coverFile && coverPreviewUrl.value) {
    window.URL.revokeObjectURL(coverPreviewUrl.value);
  }
});
</script>

<template>
  <div class="app-container">
    <div class="user-center">
      <!-- 用户信息头部 -->
      <div class="user-header">
        <div class="user-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="#42b883" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="user-info">
          <h2>{{ currentUser?.username }}</h2>
          <p class="user-id">用户ID: {{ currentUser?.id }}</p>
          <p class="join-date">加入时间: {{ new Date().toLocaleDateString() }}</p>
        </div>
        <div class="action-buttons">
          <el-button type="primary" @click="openUploadDialog">上传视频</el-button>
        </div>
      </div>
      
      <!-- 视频列表 -->
      <div class="content-section">
        <div class="section-header">
          <h3>我的视频</h3>
          <span class="video-count">共 {{ videoList.length }} 个视频</span>
        </div>
        
        <div class="video-list" v-if="videoList.length > 0">
          <div class="video-card" v-for="video in videoList" :key="video.id">
            <div class="video-cover">
              <img :src="video.videoImg || video.coverUrl" alt="视频封面">
            </div>
            <div class="video-info">
              <h4>{{ video.title }}</h4>
              <p class="video-desc">{{ video.description }}</p>
              <div class="video-meta">
                <span class="views">观看: {{ video.viewCount }}</span>
                <span class="date">发布: {{ video.createTime }}</span>
              </div>
              <div class="video-actions">
                <el-button size="small" type="primary" @click="openCoverDialog(video.id)">更新封面</el-button>
                <el-button size="small" type="warning">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteVideo(video.id)">删除</el-button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="empty-list" v-else>
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
          <p>您还没有上传任何视频</p>
          <el-button type="primary" @click="openUploadDialog">上传第一个视频</el-button>
        </div>
      </div>
      
      <!-- 上传视频对话框 -->
      <el-dialog
        title="上传视频"
        v-model="dialogVisible"
        width="500px"
        :close-on-click-modal="!uploading"
        :close-on-press-escape="!uploading"
        :show-close="!uploading"
        top="5vh"
        fullscreen-class="upload-dialog-fullscreen"
      >
        <el-scrollbar height="calc(80vh - 120px)">
          <el-form label-position="top">
            <el-form-item label="视频标题" required>
              <el-input v-model="videoForm.title" placeholder="请输入视频标题" :disabled="uploading"></el-input>
            </el-form-item>
            
            <el-form-item label="视频描述">
              <el-input 
                v-model="videoForm.description" 
                type="textarea" 
                :rows="3" 
                placeholder="请输入视频描述（可选）"
                :disabled="uploading"
              ></el-input>
            </el-form-item>
            
            <el-form-item label="视频文件" required>
              <el-upload
                class="video-uploader"
                action="#"
                :auto-upload="false"
                :on-change="handleVideoChange"
                :show-file-list="false"
                accept="video/mp4,video/avi,video/mov,video/wmv,video/flv,video/mkv"
                :disabled="uploading"
              >
                <div class="upload-area" v-if="!videoForm.videoFile">
                  <el-icon class="upload-icon"><upload-filled /></el-icon>
                  <div class="el-upload__text">点击视频文件到此区域上传</div>
                  <div class="el-upload__tip">支持MP4, MOV, AVI等格式视频文件，大小不超过1000MB</div>
                </div>
                <div class="selected-file" v-else>
                  <el-icon class="file-icon"><video-camera /></el-icon>
                  <span class="file-name">{{ videoForm.videoFile.name }}</span>
                  <el-button size="small" type="primary" :disabled="uploading">重新选择</el-button>
                </div>
              </el-upload>
            </el-form-item>
            
            <el-form-item label="封面图片">
              <el-upload
                class="cover-uploader"
                action="#"
                :auto-upload="false"
                :on-change="handleCoverChange"
                :show-file-list="false"
                accept="image/jpeg,image/png,image/gif,image/webp"
                :disabled="uploading"
              >
                <div class="upload-area is-cover" v-if="!videoForm.coverFile">
                  <el-icon class="upload-icon"><upload-filled /></el-icon>
                  <div class="el-upload__text">点击封面图片到此区域上传</div>
                  <div class="el-upload__tip">支持JPG, PNG, GIF, WEBP格式图片，大小不超过5MB</div>
                </div>
                <div v-else class="selected-file is-cover">
                  <img class="cover-preview" :src="coverPreviewUrl" alt="封面预览">
                  <div class="cover-actions">
                    <span class="file-name">{{ videoForm.coverFile.name }}</span>
                    <el-button size="small" type="danger" @click.stop="removeCover" :disabled="uploading">移除</el-button>
                  </div>
                </div>
              </el-upload>
            </el-form-item>
            
            <el-progress 
              v-if="uploading" 
              :percentage="uploadProgress" 
              :format="p => p + '%'"
              :status="uploadProgress < 100 ? '' : 'success'"
              :striped="true"
              :striped-flow="uploadProgress < 100"
            ></el-progress>
          </el-form>
        </el-scrollbar>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="closeUploadDialog" :disabled="uploading">取消</el-button>
            <el-button type="primary" @click="submitVideo" :loading="uploading" :disabled="uploading">
              {{ uploading ? '上传中...' : '上传' }}
            </el-button>
          </span>
        </template>
      </el-dialog>
      
      <!-- 封面更新对话框 -->
      <el-dialog
        title="更新视频封面"
        v-model="coverDialogVisible"
        width="500px"
        :close-on-click-modal="!coverUploading"
        :close-on-press-escape="!coverUploading"
        :show-close="!coverUploading"
        top="10vh"
      >
        <el-scrollbar height="calc(60vh - 120px)">
          <el-form>
            <el-form-item label="封面图片" required>
              <el-upload
                class="cover-uploader"
                action="#"
                :auto-upload="false"
                :on-change="handleCoverFileChange"
                :show-file-list="false"
                accept="image/jpeg,image/png,image/gif,image/webp"
                :disabled="coverUploading"
              >
                <div class="upload-area is-cover" v-if="!coverFile">
                  <el-icon class="upload-icon"><upload-filled /></el-icon>
                  <div class="el-upload__text">点击选择新封面图片</div>
                  <div class="el-upload__tip">支持JPG, PNG, GIF, WEBP格式图片，大小不超过5MB</div>
                </div>
                <div v-else class="selected-file is-cover">
                  <img class="cover-preview" :src="newCoverPreviewUrl" alt="封面预览">
                  <div class="cover-actions">
                    <span class="file-name">{{ coverFile.name }}</span>
                    <el-button size="small" type="danger" @click.stop="removeNewCover" :disabled="coverUploading">移除</el-button>
                  </div>
                </div>
              </el-upload>
            </el-form-item>
          </el-form>
        </el-scrollbar>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="closeCoverDialog" :disabled="coverUploading">取消</el-button>
            <el-button type="primary" @click="submitCoverUpdate" :loading="coverUploading">
              {{ coverUploading ? '更新中...' : '更新封面' }}
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  background-color: #f8f9fa;
  min-height: calc(100vh - 60px);
  width: 100%;
  padding: 2rem 0;
  /* 添加GPU加速 */
  transform: translateZ(0);
  contain: layout size;
}

.user-center {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 2rem;
  contain: layout style;
}

.content-section {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  margin-bottom: 2rem;
  width: 100%;
  contain: content;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  contain: content;
}

.user-avatar {
  background-color: #f0f9f4;
  border-radius: 50%;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-info {
  flex: 1;
}

.user-info h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.user-id, .join-date {
  color: #666;
  margin-bottom: 0.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-size: 1.5rem;
  color: #333;
  font-weight: 600;
  margin: 0;
}

.video-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

@media (min-width: 576px) {
  .video-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (min-width: 992px) {
  .video-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .app-container {
    padding: 1rem 0;
  }
  
  .user-center {
    padding: 0 1rem;
  }
  
  .user-header, .content-section {
    padding: 1.5rem;
  }
  
  .user-header {
    flex-direction: column;
    text-align: center;
  }
  
  .video-list {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}

@media (min-width: 769px) and (max-width: 1199px) {
  .video-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .video-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1600px) {
  .video-list {
    grid-template-columns: repeat(4, 1fr);
  }
}

.video-card {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background-color: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
  will-change: transform;
}

.video-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-cover {
  height: 160px;
  overflow: hidden;
  position: relative;
  background-color: #f8f8f8;
  contain: strict;
}

.video-cover::before {
  content: '►';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #42b883;
  opacity: 0.9;
  line-height: 1;
  padding-left: 3px;
}

.video-cover::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
  z-index: 1;
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
  transform: translateZ(0);
}

.video-info {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  contain: content;
}

.video-info h4 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
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
  margin-bottom: 0.8rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f5f5f5;
}

.video-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.empty-list {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-icon {
  margin-bottom: 1rem;
}

.video-uploader, .cover-uploader {
  width: 100%;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area.is-cover {
  padding: 1.5rem;
  min-height: 120px;
}

.upload-area:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.upload-icon {
  font-size: 32px;
  color: #909399;
  margin-bottom: 10px;
}

.upload-area:hover .upload-icon {
  color: #409eff;
}

.el-upload__text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 6px;
}

.el-upload__tip {
  font-size: 12px;
  color: #909399;
}

.selected-file {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.selected-file.is-cover {
  flex-direction: column;
  align-items: stretch;
  padding: 0;
  overflow: hidden;
}

.cover-preview {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.cover-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #f0f0f0;
}

.file-icon {
  font-size: 24px;
  color: #409eff;
  margin-right: 10px;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 10px;
}

.video-count {
  color: #666;
  font-size: 0.95rem;
  background-color: #f8f8f8;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-weight: 500;
}

.upload-dialog-fullscreen {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.el-dialog) {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  margin: 5vh auto !important;
}

:deep(.el-dialog__body) {
  overflow: auto;
  padding: 20px;
  flex: 1;
}

:deep(.el-dialog__header) {
  padding: 15px 20px;
}

:deep(.el-dialog__footer) {
  padding: 15px 20px;
  border-top: 1px solid #ebeef5;
}
</style> 