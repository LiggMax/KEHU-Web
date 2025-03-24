<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 用户列表数据
const userList = ref([]);
const loading = ref(false);

// 分页参数
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 搜索参数
const searchForm = ref({
  username: '',
  role: '',
  status: ''
});

// 获取用户列表
const getUserList = async () => {
  loading.value = true;
  try {
    // TODO: 调用后端API获取用户列表
    // 模拟数据
    userList.value = [
      {
        id: 1,
        username: 'admin',
        nickname: '管理员',
        role: 'admin',
        status: 'active',
        createTime: '2024-03-20 10:00:00'
      },
      {
        id: 2,
        username: 'user1',
        nickname: '用户1',
        role: 'user',
        status: 'active',
        createTime: '2024-03-19 15:30:00'
      }
    ];
    pagination.value.total = 2;
  } catch (error) {
    console.error('获取用户列表失败', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  pagination.value.currentPage = 1;
  getUserList();
};

// 处理重置
const handleReset = () => {
  searchForm.value = {
    username: '',
    role: '',
    status: ''
  };
  handleSearch();
};

// 处理分页变化
const handlePageChange = (page) => {
  pagination.value.currentPage = page;
  getUserList();
};

// 处理每页条数变化
const handleSizeChange = (size) => {
  pagination.value.pageSize = size;
  pagination.value.currentPage = 1;
  getUserList();
};

// 处理用户状态变更
const handleStatusChange = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.status === 'active' ? '禁用' : '启用'}该用户吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // TODO: 调用后端API更新用户状态
    row.status = row.status === 'active' ? 'inactive' : 'active';
    ElMessage.success('操作成功');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新用户状态失败', error);
      ElMessage.error('更新用户状态失败');
    }
  }
};

// 处理删除用户
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该用户吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // TODO: 调用后端API删除用户
    ElMessage.success('删除成功');
    getUserList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败', error);
      ElMessage.error('删除用户失败');
    }
  }
};

onMounted(() => {
  getUserList();
});
</script>

<template>
  <div class="user-management">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary">添加用户</el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="userList"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="'active'"
              :inactive-value="'inactive'"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link>编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.user-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media screen and (max-width: 768px) {
  .el-form-item {
    margin-bottom: 10px;
  }
  
  .el-form--inline .el-form-item {
    margin-right: 0;
  }
}
</style> 