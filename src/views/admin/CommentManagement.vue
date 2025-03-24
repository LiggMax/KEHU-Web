<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 评论列表数据
const commentList = ref([]);
const loading = ref(false);

// 分页参数
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 搜索参数
const searchForm = ref({
  content: '',
  videoTitle: '',
  status: ''
});

// 获取评论列表
const getCommentList = async () => {
  loading.value = true;
  try {
    // TODO: 调用后端API获取评论列表
    // 模拟数据
    commentList.value = [
      {
        id: 1,
        content: '这是一个很好的视频！',
        videoTitle: '示例视频1',
        author: 'user1',
        status: 'normal',
        createTime: '2024-03-20 10:00:00'
      },
      {
        id: 2,
        content: '这个视频太棒了！',
        videoTitle: '示例视频2',
        author: 'user2',
        status: 'hidden',
        createTime: '2024-03-19 15:30:00'
      }
    ];
    pagination.value.total = 2;
  } catch (error) {
    console.error('获取评论列表失败', error);
    ElMessage.error('获取评论列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  pagination.value.currentPage = 1;
  getCommentList();
};

// 处理重置
const handleReset = () => {
  searchForm.value = {
    content: '',
    videoTitle: '',
    status: ''
  };
  handleSearch();
};

// 处理分页变化
const handlePageChange = (page) => {
  pagination.value.currentPage = page;
  getCommentList();
};

// 处理每页条数变化
const handleSizeChange = (size) => {
  pagination.value.pageSize = size;
  pagination.value.currentPage = 1;
  getCommentList();
};

// 处理评论状态变更
const handleStatusChange = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.status === 'normal' ? '隐藏' : '显示'}该评论吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // TODO: 调用后端API更新评论状态
    row.status = row.status === 'normal' ? 'hidden' : 'normal';
    ElMessage.success('操作成功');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新评论状态失败', error);
      ElMessage.error('更新评论状态失败');
    }
  }
};

// 处理删除评论
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该评论吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // TODO: 调用后端API删除评论
    ElMessage.success('删除成功');
    getCommentList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败', error);
      ElMessage.error('删除评论失败');
    }
  }
};

onMounted(() => {
  getCommentList();
});
</script>

<template>
  <div class="comment-management">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="评论内容">
          <el-input v-model="searchForm.content" placeholder="请输入评论内容" />
        </el-form-item>
        <el-form-item label="视频标题">
          <el-input v-model="searchForm.videoTitle" placeholder="请输入视频标题" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="正常" value="normal" />
            <el-option label="已隐藏" value="hidden" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 评论列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>评论列表</span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="commentList"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="content" label="评论内容" min-width="300" />
        <el-table-column prop="videoTitle" label="视频标题" min-width="200" />
        <el-table-column prop="author" label="评论者" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'normal' ? 'success' : 'info'">
              {{ row.status === 'normal' ? '正常' : '已隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="评论时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="warning" 
              link 
              @click="handleStatusChange(row)"
            >
              {{ row.status === 'normal' ? '隐藏' : '显示' }}
            </el-button>
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
.comment-management {
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