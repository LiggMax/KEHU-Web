<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 视频列表数据
const videoList = ref([]);
const loading = ref(false);

// 分页参数
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 搜索参数
const searchForm = ref({
  title: '',
  category: '',
  status: ''
});

// 获取视频列表
const getVideoList = async () => {
  loading.value = true;
  try {
    // TODO: 调用后端API获取视频列表
    // 模拟数据
    videoList.value = [
      {
        id: 1,
        title: '示例视频1',
        category: '教育',
        author: 'admin',
        status: 'published',
        views: 1000,
        createTime: '2024-03-20 10:00:00'
      },
      {
        id: 2,
        title: '示例视频2',
        category: '娱乐',
        author: 'user1',
        status: 'draft',
        views: 0,
        createTime: '2024-03-19 15:30:00'
      }
    ];
    pagination.value.total = 2;
  } catch (error) {
    console.error('获取视频列表失败', error);
    ElMessage.error('获取视频列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  pagination.value.currentPage = 1;
  getVideoList();
};

// 处理重置
const handleReset = () => {
  searchForm.value = {
    title: '',
    category: '',
    status: ''
  };
  handleSearch();
};

// 处理分页变化
const handlePageChange = (page) => {
  pagination.value.currentPage = page;
  getVideoList();
};

// 处理每页条数变化
const handleSizeChange = (size) => {
  pagination.value.pageSize = size;
  pagination.value.currentPage = 1;
  getVideoList();
};

// 处理视频状态变更
const handleStatusChange = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.status === 'published' ? '下架' : '发布'}该视频吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // TODO: 调用后端API更新视频状态
    row.status = row.status === 'published' ? 'draft' : 'published';
    ElMessage.success('操作成功');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新视频状态失败', error);
      ElMessage.error('更新视频状态失败');
    }
  }
};

// 处理删除视频
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该视频吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // TODO: 调用后端API删除视频
    ElMessage.success('删除成功');
    getVideoList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除视频失败', error);
      ElMessage.error('删除视频失败');
    }
  }
};

onMounted(() => {
  getVideoList();
});
</script>

<template>
  <div class="video-management">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="视频标题">
          <el-input v-model="searchForm.title" placeholder="请输入视频标题" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择分类">
            <el-option label="教育" value="教育" />
            <el-option label="娱乐" value="娱乐" />
            <el-option label="音乐" value="音乐" />
            <el-option label="游戏" value="游戏" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 视频列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>视频列表</span>
          <el-button type="primary">上传视频</el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="videoList"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'">
              {{ row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="播放量" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link>编辑</el-button>
            <el-button 
              type="warning" 
              link 
              @click="handleStatusChange(row)"
            >
              {{ row.status === 'published' ? '下架' : '发布' }}
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
.video-management {
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