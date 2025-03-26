<template>
  <div class="videos-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>视频管理</span>
          <el-button type="primary" @click="handleAdd">添加视频</el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="视频标题">
          <el-input v-model="searchForm.title" placeholder="请输入视频标题" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="videoList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="createTime" label="上传时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="播放量" width="100" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="handleView(scope.row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 视频表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加视频' : '编辑视频'"
      width="600px"
    >
      <el-form
        ref="videoFormRef"
        :model="videoForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="videoForm.title"></el-input>
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="videoForm.categoryId" placeholder="请选择分类">
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="封面" prop="coverUrl">
          <el-upload
            class="cover-uploader"
            action="/api/admin/upload"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :before-upload="beforeCoverUpload"
          >
            <img v-if="videoForm.coverUrl" :src="videoForm.coverUrl" class="cover" />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="视频文件" prop="videoUrl" v-if="dialogType === 'add'">
          <el-upload
            class="video-uploader"
            action="/api/admin/upload"
            :show-file-list="false"
            :on-success="handleVideoSuccess"
            :before-upload="beforeVideoUpload"
          >
            <el-button type="primary">选择视频文件</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="videoForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入视频描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="videoForm.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 视频详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="视频详情"
      width="600px"
      destroy-on-close
    >
      <div v-loading="dialogLoading">
        <div class="video-info" v-if="currentVideo">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="视频ID">{{ currentVideo.id }}</el-descriptions-item>
            <el-descriptions-item label="标题">{{ currentVideo.title }}</el-descriptions-item>
            <el-descriptions-item label="描述">{{ currentVideo.description }}</el-descriptions-item>
            <el-descriptions-item label="上传时间">{{ formatDate(currentVideo.uploadTime) }}</el-descriptions-item>
            <el-descriptions-item label="播放量">{{ currentVideo.viewCount }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="currentVideo.status === 1 ? 'success' : 'danger'">
                {{ currentVideo.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import axios from 'axios'
import { getVideoListService, getVideoByIdService } from '@/api/admin/admin.js'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogType = ref('add')
const videoFormRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const videoList = ref([])
const categories = ref([])
const dialogLoading = ref(false)
const currentVideo = ref(null)

const searchForm = reactive({
  title: ''
})

const videoForm = reactive({
  id: null,
  title: '',
  categoryId: '',
  coverUrl: '',
  videoUrl: '',
  description: '',
  status: 1
})

const rules = {
  title: [
    { required: true, message: '请输入视频标题', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择视频分类', trigger: 'change' }
  ],
  coverUrl: [
    { required: true, message: '请上传视频封面', trigger: 'change' }
  ],
  videoUrl: [
    { required: true, message: '请上传视频文件', trigger: 'change' }
  ]
}

const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/admin/categories')
    if (response.data.code === 200) {
      categories.value = response.data.data
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

const fetchVideoList = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchForm.title) {
      params.title = searchForm.title
    }
    
    const res = await getVideoListService(params)
    if (res.code === 200) {
      videoList.value = res.data
    } else {
      ElMessage.error(res.message || '获取视频列表失败')
    }
  } catch (error) {
    console.error('获取视频列表失败:', error)
    ElMessage.error('获取视频列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchVideoList()
}

const handleReset = () => {
  searchForm.title = ''
  fetchVideoList()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchVideoList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchVideoList()
}

const handleAdd = () => {
  dialogType.value = 'add'
  Object.assign(videoForm, {
    id: null,
    title: '',
    categoryId: '',
    coverUrl: '',
    videoUrl: '',
    description: '',
    status: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(videoForm, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该视频吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const response = await axios.delete(`/api/admin/videos/${row.id}`)
      if (response.data.code === 200) {
        ElMessage.success('删除成功')
        fetchVideoList()
      }
    } catch (error) {
      console.error('删除视频失败:', error)
      ElMessage.error('删除视频失败')
    }
  })
}

const handleCoverSuccess = (response) => {
  if (response.code === 200) {
    videoForm.coverUrl = response.data.url
  } else {
    ElMessage.error('上传封面失败')
  }
}

const handleVideoSuccess = (response) => {
  if (response.code === 200) {
    videoForm.videoUrl = response.data.url
  } else {
    ElMessage.error('上传视频失败')
  }
}

const beforeCoverUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const beforeVideoUpload = (file) => {
  const isVideo = file.type.startsWith('video/')
  const isLt500M = file.size / 1024 / 1024 < 500

  if (!isVideo) {
    ElMessage.error('只能上传视频文件!')
    return false
  }
  if (!isLt500M) {
    ElMessage.error('视频大小不能超过 500MB!')
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!videoFormRef.value) return
  
  try {
    await videoFormRef.value.validate()
    submitting.value = true
    
    const url = dialogType.value === 'add' ? '/api/admin/videos' : `/api/admin/videos/${videoForm.id}`
    const method = dialogType.value === 'add' ? 'post' : 'put'
    
    const response = await axios[method](url, videoForm)
    if (response.data.code === 200) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
      dialogVisible.value = false
      fetchVideoList()
    }
  } catch (error) {
    console.error('提交表单失败:', error)
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const handleView = async (video) => {
  dialogVisible.value = true
  dialogLoading.value = true
  try {
    const res = await getVideoByIdService(video.videoId)
    if (res.code === 200) {
      currentVideo.value = res.data
    } else {
      ElMessage.error(res.message || '获取视频详情失败')
    }
  } catch (error) {
    console.error('获取视频详情失败:', error)
    ElMessage.error('获取视频详情失败')
  } finally {
    dialogLoading.value = false
  }
}

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString()
}

onMounted(() => {
  fetchCategories()
  fetchVideoList()
})
</script>

<style scoped>
.videos-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 100px;
}

.cover-uploader:hover {
  border-color: #409eff;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.cover {
  width: 178px;
  height: 100px;
  display: block;
  object-fit: cover;
}

.video-uploader {
  width: 178px;
}

.video-info {
  padding: 20px;
}

:deep(.el-descriptions__label) {
  width: 120px;
}
</style> 