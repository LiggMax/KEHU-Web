<template>
  <div class="users-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAdd">添加用户</el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" :value="1"></el-option>
            <el-option label="禁用" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="userList" v-loading="loading" style="width: 100%">
        <el-table-column prop="userId" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="registerTime" label="注册时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="openEditDialog(scope.row.userId)"
            >
              编辑
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
    
    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="dialogType === 'edit'"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="userForm.password" type="password" show-password></el-input>
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

    <!-- 用户编辑对话框 -->
    <el-dialog
      title="编辑用户信息"
      v-model="editDialogVisible"
      width="500px"
      :close-on-click-modal="!editFormLoading"
      destroy-on-close
    >
      <el-form :model="editForm" label-width="100px" v-loading="editFormLoading">
        <el-form-item label="用户ID">
          <el-input v-model="editForm.userId" disabled />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeEditDialog" :disabled="editFormLoading">取消</el-button>
          <el-button type="primary" @click="submitUserEdit" :loading="editFormLoading">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserListService, getUserByIdService, updateUserService } from '@/api/admin/admin.js'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogType = ref('add')
const userFormRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const userList = ref([])

// 用户编辑对话框
const editDialogVisible = ref(false)
const editFormLoading = ref(false)
const currentUserId = ref(null)
const editForm = reactive({
  userId: '',
  username: '',
  nickname: '',
  email: '',
})

const searchForm = reactive({
  username: '',
  status: ''
})

const userForm = reactive({
  id: null,
  username: '',
  nickname: '',
  email: '',
  password: '',
  status: 1
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const fetchUserList = async () => {
  loading.value = true
  try {
    const res = await getUserListService()
    if (res.code === 200) {
      userList.value = res.data.map(user => ({
        ...user,
        registerTime: user.registerTime ? new Date(user.registerTime).toLocaleString() : '-'
      }))
    } else {
      ElMessage.error(res.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.status = ''
  handleSearch()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchUserList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchUserList()
}

const handleAdd = () => {
  dialogType.value = 'add'
  Object.assign(userForm, {
    id: null,
    username: '',
    nickname: '',
    email: '',
    password: '',
    status: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(userForm, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteUserService(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchUserList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败')
    }
  })
}

const handleSubmit = async () => {
  if (!userFormRef.value) return
  
  try {
    await userFormRef.value.validate()
    submitting.value = true
    
    const submitData = {
      username: userForm.username,
      nickname: userForm.nickname,
      email: userForm.email,
      status: userForm.status
    }
    
    if (dialogType.value === 'add') {
      submitData.password = userForm.password
    }
    
    let res
    if (dialogType.value === 'add') {
      res = await addUserService(submitData)
    } else {
      res = await updateUserService(userForm.id, submitData)
    }
    
    if (res.code === 200) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
      dialogVisible.value = false
      fetchUserList()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('提交表单失败:', error)
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

// 打开编辑对话框
const openEditDialog = async (userId) => {
  currentUserId.value = userId
  editFormLoading.value = true
  try {
    const res = await getUserByIdService(userId)
    if (res.code === 200) {
      const userData = res.data
      // 填充表单数据
      editForm.userId = userData.userId
      editForm.username = userData.username
      editForm.nickname = userData.nickname || ''
      editForm.email = userData.email || ''
      // 显示对话框
      editDialogVisible.value = true
    } else {
      ElMessage.error(res.message || '获取用户信息失败')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  } finally {
    editFormLoading.value = false
  }
}

// 关闭编辑对话框
const closeEditDialog = () => {
  editDialogVisible.value = false
  currentUserId.value = null
  // 重置表单
  Object.keys(editForm).forEach(key => {
    editForm[key] = ''
  })
}

// 提交用户编辑
const submitUserEdit = async () => {
  if (!editForm.userId) {
    ElMessage.warning('用户ID不能为空')
    return
  }
  
  editFormLoading.value = true
  try {
    const res = await updateUserService(editForm)
    if (res.code === 200) {
      ElMessage.success('用户信息更新成功')
      // 刷新用户列表
      await fetchUserList()
      // 关闭对话框
      closeEditDialog()
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (error) {
    console.error('更新用户失败:', error)
    ElMessage.error('更新用户失败')
  } finally {
    editFormLoading.value = false
  }
}

// 获取头像URL
const getAvatarUrl = (filename) => {
  if (!filename) return '/user/default-avatar.png'
  // 从完整路径中提取文件名
  const extractFilename = (path) => {
    if (!path) return ''
    // 如果包含完整路径，提取最后一部分作为文件名
    if (path.includes('/')) {
      return path.split('/').pop()
    }
    return path
  }
  
  // 获取文件名并构建URL
  const avatarFilename = extractFilename(filename)
  return `/user/avatar/${avatarFilename}`
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.users-container {
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

.el-avatar {
  width: 40px;
  height: 40px;
}

.avatar-preview {
  display: flex;
  align-items: center;
}

.avatar-preview .el-avatar {
  width: 64px;
  height: 64px;
  margin-right: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 