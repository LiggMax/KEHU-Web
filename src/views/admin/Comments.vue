<template>
  <div class="comments-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>评论管理</span>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="评论内容">
          <el-input v-model="searchForm.content" placeholder="请输入评论内容" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="commentList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="videoTitle" label="视频标题" width="200" show-overflow-tooltip />
        <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
        <el-table-column prop="createTime" label="评论时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="likes" label="点赞数" width="100" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="handleView(scope.row)"
            >
              查看
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
            >
              删除
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

    <!-- 评论详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="评论详情"
      width="600px"
      destroy-on-close
    >
      <div v-loading="dialogLoading">
        <div class="comment-info" v-if="currentComment">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="评论ID">{{ currentComment.id }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ currentComment.username }}</el-descriptions-item>
            <el-descriptions-item label="视频标题">{{ currentComment.videoTitle }}</el-descriptions-item>
            <el-descriptions-item label="评论内容">{{ currentComment.content }}</el-descriptions-item>
            <el-descriptions-item label="评论时间">{{ formatDate(currentComment.createTime) }}</el-descriptions-item>
            <el-descriptions-item label="点赞数">{{ currentComment.likes }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCommentListService, getCommentByIdService, deleteCommentService } from '@/api/admin/admin.js'

const loading = ref(false)
const dialogLoading = ref(false)
const detailDialogVisible = ref(false)
const currentComment = ref(null)
const commentList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({
  content: ''
})

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString()
}

// 获取评论列表
const fetchCommentList = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchForm.content) {
      params.content = searchForm.content
    }
    
    const res = await getCommentListService(params)
    if (res.code === 200) {
      commentList.value = res.data
      total.value = res.data.length
    } else {
      ElMessage.error(res.message || '获取评论列表失败')
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
    ElMessage.error('获取评论列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchCommentList()
}

// 重置搜索
const handleReset = () => {
  searchForm.content = ''
  fetchCommentList()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchCommentList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchCommentList()
}

// 查看评论详情
const handleView = async (comment) => {
  detailDialogVisible.value = true
  dialogLoading.value = true
  try {
    const res = await getCommentByIdService(comment.id)
    if (res.code === 200) {
      currentComment.value = res.data
    } else {
      ElMessage.error(res.message || '获取评论详情失败')
    }
  } catch (error) {
    console.error('获取评论详情失败:', error)
    ElMessage.error('获取评论详情失败')
  } finally {
    dialogLoading.value = false
  }
}

// 删除评论
const handleDelete = (comment) => {
  ElMessageBox.confirm(
    `确定要删除该评论吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        const res = await deleteCommentService(comment.id)
        if (res.code === 200) {
          ElMessage.success('删除成功')
          fetchCommentList() // 刷新列表
        } else {
          ElMessage.error(res.message || '删除失败')
        }
      } catch (error) {
        console.error('删除评论失败:', error)
        ElMessage.error('删除评论失败')
      }
    })
    .catch(() => {
      // 用户点击取消，不做任何操作
    })
}

onMounted(() => {
  fetchCommentList()
})
</script>

<style scoped>
.comments-container {
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

.comment-info {
  padding: 20px;
}

:deep(.el-descriptions__label) {
  width: 120px;
}
</style> 