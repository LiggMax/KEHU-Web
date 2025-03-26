<template>
  <div class="comments-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>评论管理</span>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="视频">
          <el-input v-model="searchForm.videoTitle" placeholder="请输入视频标题" clearable></el-input>
        </el-form-item>
        <el-form-item label="用户">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" :value="1"></el-option>
            <el-option label="隐藏" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="commentList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="videoTitle" label="视频" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="评论时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
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
    
    <!-- 评论编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑评论"
      width="500px"
    >
      <el-form
        ref="commentFormRef"
        :model="commentForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="评论内容" prop="content">
          <el-input
            v-model="commentForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入评论内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="commentForm.status"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const commentFormRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const commentList = ref([])

const searchForm = reactive({
  videoTitle: '',
  username: '',
  status: ''
})

const commentForm = reactive({
  id: null,
  content: '',
  status: 1
})

const rules = {
  content: [
    { required: true, message: '请输入评论内容', trigger: 'blur' },
    { max: 500, message: '评论内容不能超过500个字符', trigger: 'blur' }
  ]
}

const fetchCommentList = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/admin/comments', {
      params: {
        page: currentPage.value,
        size: pageSize.value,
        ...searchForm
      }
    })
    if (response.data.code === 200) {
      commentList.value = response.data.data.list
      total.value = response.data.data.total
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
    ElMessage.error('获取评论列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchCommentList()
}

const handleReset = () => {
  searchForm.videoTitle = ''
  searchForm.username = ''
  searchForm.status = ''
  handleSearch()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchCommentList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchCommentList()
}

const handleEdit = (row) => {
  Object.assign(commentForm, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该评论吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const response = await axios.delete(`/api/admin/comments/${row.id}`)
      if (response.data.code === 200) {
        ElMessage.success('删除成功')
        fetchCommentList()
      }
    } catch (error) {
      console.error('删除评论失败:', error)
      ElMessage.error('删除评论失败')
    }
  })
}

const handleSubmit = async () => {
  if (!commentFormRef.value) return
  
  try {
    await commentFormRef.value.validate()
    submitting.value = true
    
    const response = await axios.put(`/api/admin/comments/${commentForm.id}`, commentForm)
    if (response.data.code === 200) {
      ElMessage.success('更新成功')
      dialogVisible.value = false
      fetchCommentList()
    }
  } catch (error) {
    console.error('提交表单失败:', error)
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
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
</style> 