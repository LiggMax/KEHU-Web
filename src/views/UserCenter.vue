<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';
import { ElMessage, ElUpload, ElMessageBox } from 'element-plus';
import { isLoggedIn, getUserInfo } from '../utils/auth.js';
import { useRouter } from 'vue-router';
import { deleteVideoService, updateCoverService, updateVideoService } from '../api/video.js';
import { UploadFilled, VideoCamera } from '@element-plus/icons-vue';
import { getUserVideosService, uploadVideoService } from '@/api/user.js'

const router = useRouter();
const currentUser = ref(null);
const videoList = ref([]);
const dialogVisible = ref(false);
const coverDialogVisible = ref(false);
const editDialogVisible = ref(false);
const selectedVideoId = ref(null);
const coverFile = ref(null);
const coverUploading = ref(false);
const videoForm = reactive({
  title: '',
  description: '',
  category: '',
  videoFile: null,
  coverFile: null
});

// 视频编辑表单
const editForm = reactive({
  id: null,
  title: '',
  description: '',
  category: '',
});

// 是否正在提交编辑
const editSubmitting = ref(false);

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

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

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

// 移除视频文件
const removeVideoFile = () => {
  videoForm.videoFile = null;
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
      category: videoForm.category,
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
  videoForm.category = '';
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

// 打开编辑视频对话框
const openEditDialog = (video) => {
  // 复制视频数据到编辑表单
  editForm.id = video.id;
  editForm.title = video.title;
  editForm.description = video.description || '';
  editForm.category = video.category || '';
  
  // 显示对话框
  editDialogVisible.value = true;
};

// 关闭编辑视频对话框
const closeEditDialog = () => {
  editDialogVisible.value = false;
  // 重置表单
  editForm.id = null;
  editForm.title = '';
  editForm.description = '';
  editForm.category = '';
};

// 提交视频编辑
const submitVideoEdit = async () => {
  // 验证表单
  if (!editForm.title) {
    ElMessage.warning('请输入视频标题');
    return;
  }
  
  editSubmitting.value = true;
  
  try {
    // 调用更新视频接口
    const res = await updateVideoService({
      id: editForm.id,
      title: editForm.title,
      description: editForm.description,
      category: editForm.category
    });
    
    if (res.code === 200) {
      ElMessage.success('视频信息更新成功');
      
      // 更新本地视频列表
      const index = videoList.value.findIndex(v => v.id === editForm.id);
      if (index !== -1) {
        videoList.value[index].title = editForm.title;
        videoList.value[index].description = editForm.description;
        videoList.value[index].category = editForm.category;
      }
      
      // 关闭对话框
      closeEditDialog();
    } else {
      ElMessage.error(res.message || '更新失败');
    }
  } catch (error) {
    console.error('更新视频失败', error);
    ElMessage.error('更新视频失败，请稍后再试');
  } finally {
    editSubmitting.value = false;
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
                <span class="category" v-if="video.category">分类: {{ video.category }}</span>
              </div>
              <div class="video-actions">
                <el-button size="small" type="primary" @click="openCoverDialog(video.id)">更新封面</el-button>
                <el-button size="small" type="warning" @click="openEditDialog(video)">编辑</el-button>
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
        width="560px"
        :close-on-click-modal="!uploading"
        :close-on-press-escape="!uploading"
        :show-close="!uploading"
        top="5vh"
        class="upload-video-dialog"
        append-to-body
        destroy-on-close
      >
        <div class="dialog-content">
          <el-form label-position="top">
            <el-form-item label="视频标题" required>
              <el-input 
                v-model="videoForm.title" 
                placeholder="请输入视频标题" 
                :disabled="uploading"
                maxlength="50"
                show-word-limit
              ></el-input>
            </el-form-item>
            
            <el-form-item label="视频分类">
              <el-input 
                v-model="videoForm.category" 
                placeholder="请输入视频分类" 
                :disabled="uploading"
                maxlength="20"
                show-word-limit
              ></el-input>
            </el-form-item>
            
            <el-form-item label="视频描述">
              <el-input 
                v-model="videoForm.description" 
                type="textarea" 
                :rows="4" 
                placeholder="请输入视频描述（可选）"
                :disabled="uploading"
                maxlength="200"
                show-word-limit
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
                  <div class="el-upload__text">点击或拖拽视频文件到此区域上传</div>
                  <div class="el-upload__tip">支持MP4, MOV, AVI等格式视频文件，大小不超过1000MB</div>
                </div>
                <div class="selected-file" v-else>
                  <div class="file-info">
                    <el-icon class="file-icon"><video-camera /></el-icon>
                    <div class="file-details">
                      <span class="file-name">{{ videoForm.videoFile.name }}</span>
                      <span class="file-size">{{ formatFileSize(videoForm.videoFile.size) }}</span>
                    </div>
                  </div>
                  <el-button size="small" type="primary" :disabled="uploading" @click.stop="removeVideoFile">重新选择</el-button>
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
                <div class="upload-area cover-upload-area" v-if="!videoForm.coverFile">
                  <el-icon class="upload-icon"><upload-filled /></el-icon>
                  <div class="el-upload__text">点击或拖拽封面图片到此区域上传</div>
                  <div class="el-upload__tip">支持JPG, PNG, GIF, WEBP格式图片，大小不超过5MB</div>
                  <div class="el-upload__tip tip-highlight">建议尺寸：1280×720或16:9比例图片</div>
                </div>
                <div v-else class="selected-cover">
                  <img class="cover-preview" :src="coverPreviewUrl" alt="封面预览">
                  <div class="cover-actions">
                    <span class="file-name">{{ videoForm.coverFile.name }}</span>
                    <span class="file-size">{{ formatFileSize(videoForm.coverFile.size) }}</span>
                    <el-button size="small" type="danger" @click.stop="removeCover" :disabled="uploading">移除</el-button>
                  </div>
                </div>
              </el-upload>
            </el-form-item>
            
            <div v-if="uploading" class="upload-progress-container">
              <div class="progress-status">
                <span class="progress-text">上传中 {{ uploadProgress }}%</span>
                <span class="progress-size" v-if="videoForm.videoFile">
                  已上传 {{ formatFileSize(videoForm.videoFile.size * uploadProgress / 100) }} / {{ formatFileSize(videoForm.videoFile.size) }}
                </span>
              </div>
              <el-progress 
                :percentage="uploadProgress" 
                :status="uploadProgress < 100 ? '' : 'success'"
                :striped="true"
                :striped-flow="uploadProgress < 100"
              ></el-progress>
              <div class="upload-tip" v-if="uploadProgress < 100">
                上传过程中请勿关闭此窗口
              </div>
            </div>
          </el-form>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="closeUploadDialog" :disabled="uploading">取消</el-button>
            <el-button type="primary" @click="submitVideo" :loading="uploading" :disabled="uploading || !videoForm.videoFile || !videoForm.title">
              {{ uploading ? '上传中...' : '上传' }}
            </el-button>
          </div>
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
        class="cover-update-dialog"
        append-to-body
        destroy-on-close
      >
        <div class="dialog-content">
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
                <div class="upload-area cover-upload-area" v-if="!coverFile">
                  <el-icon class="upload-icon"><upload-filled /></el-icon>
                  <div class="el-upload__text">点击或拖拽新封面图片到此区域上传</div>
                  <div class="el-upload__tip">支持JPG, PNG, GIF, WEBP格式图片，大小不超过5MB</div>
                  <div class="el-upload__tip tip-highlight">建议尺寸：1280×720或16:9比例图片</div>
                </div>
                <div v-else class="selected-cover">
                  <img class="cover-preview" :src="newCoverPreviewUrl" alt="封面预览">
                  <div class="cover-actions">
                    <div class="file-info">
                      <span class="file-name">{{ coverFile.name }}</span>
                      <span class="file-size">{{ formatFileSize(coverFile.size) }}</span>
                    </div>
                    <el-button size="small" type="danger" @click.stop="removeNewCover" :disabled="coverUploading">移除</el-button>
                  </div>
                </div>
              </el-upload>
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="closeCoverDialog" :disabled="coverUploading">取消</el-button>
            <el-button type="primary" @click="submitCoverUpdate" :loading="coverUploading" :disabled="!coverFile">
              {{ coverUploading ? '更新中...' : '更新封面' }}
            </el-button>
          </div>
        </template>
      </el-dialog>
      
      <!-- 编辑视频对话框 -->
      <el-dialog
        title="编辑视频"
        v-model="editDialogVisible"
        width="500px"
        :close-on-click-modal="!editSubmitting"
        :close-on-press-escape="!editSubmitting"
        :show-close="!editSubmitting"
        top="10vh"
        class="edit-video-dialog"
        append-to-body
        destroy-on-close
      >
        <div class="dialog-content">
          <el-form>
            <el-form-item label="视频标题" required>
              <el-input 
                v-model="editForm.title" 
                placeholder="请输入视频标题" 
                :disabled="editSubmitting"
                maxlength="50"
                show-word-limit
              ></el-input>
            </el-form-item>
            
            <el-form-item label="视频分类">
              <el-input 
                v-model="editForm.category" 
                placeholder="请输入视频分类" 
                :disabled="editSubmitting"
                maxlength="20"
                show-word-limit
              ></el-input>
            </el-form-item>
            
            <el-form-item label="视频描述">
              <el-input 
                v-model="editForm.description" 
                type="textarea" 
                :rows="4" 
                placeholder="请输入视频描述（可选）"
                :disabled="editSubmitting"
                maxlength="200"
                show-word-limit
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="closeEditDialog" :disabled="editSubmitting">取消</el-button>
            <el-button type="primary" @click="submitVideoEdit" :loading="editSubmitting" :disabled="!editForm.title">
              {{ editSubmitting ? '保存中...' : '保存' }}
            </el-button>
          </div>
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
  flex-wrap: wrap;
  gap: 10px;
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 0.8rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f5f5f5;
}

.category {
  background-color: #f0f9f4;
  color: #42b883;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
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

/* 上传区域样式 */
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
  text-align: center;
  margin-bottom: 10px;
}

.upload-area.cover-upload-area {
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
  margin-bottom: 4px;
}

.tip-highlight {
  color: #409eff;
  font-weight: 500;
}

/* 已选文件样式 */
.selected-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.file-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.file-icon {
  font-size: 24px;
  color: #409eff;
  margin-right: 10px;
  flex-shrink: 0;
}

.file-name {
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 10px;
}

.file-size {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

/* 封面预览样式 */
.selected-cover {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f8f9fa;
}

.cover-preview {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
  background-color: #eee;
}

.cover-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #f0f0f0;
}

/* 上传进度样式 */
.upload-progress-container {
  margin-top: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  background-color: #f9f9f9;
}

.progress-status {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.progress-text {
  font-weight: 500;
  color: #409eff;
}

.progress-size {
  color: #606266;
  font-size: 13px;
}

.upload-tip {
  text-align: center;
  margin-top: 10px;
  color: #ff9800;
  font-size: 13px;
}

/* 对话框样式 */
.upload-video-dialog,
.cover-update-dialog,
.edit-video-dialog {
  z-index: 2001 !important;
}

.dialog-content {
  max-height: calc(80vh - 150px);
  overflow-y: auto;
  padding: 0 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-dialog) {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  margin: 5vh auto !important;
  border-radius: 8px;
  overflow: hidden;
  z-index: 2001 !important;
}

:deep(.el-dialog__body) {
  overflow: visible;
  padding: 20px;
  flex: 1;
}

:deep(.el-dialog__header) {
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
  position: sticky;
  top: 0;
  z-index: 10;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  color: #333;
}

:deep(.el-dialog__footer) {
  padding: 15px 20px;
  border-top: 1px solid #ebeef5;
  background-color: #f8f9fa;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

:deep(.el-overlay) {
  z-index: 2000 !important;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

.video-count {
  color: #666;
  font-size: 0.95rem;
  background-color: #f8f8f8;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-weight: 500;
}

.edit-video-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  font-size: 16px;
}

.edit-video-dialog .dialog-content {
  max-height: calc(80vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 5px;
}
</style> 