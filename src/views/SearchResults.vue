<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElSkeleton, ElSkeletonItem, ElEmpty, ElPagination, ElMessage } from 'element-plus';
import { searchService, getHotSearchesService } from '@/api/search.js';

const route = useRoute();
const router = useRouter();
const searchQuery = ref('');
const searchResults = ref([]);
const loading = ref(true);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const noResults = ref(false);
const hotKeywords = ref([]);

// 模拟数据，当API未实现时使用
const mockSearchResults = [
  {
    id: 1,
    title: "Vue.js 入门教程",
    description: "一个完整的Vue.js入门指南，包含组件、路由和状态管理",
    thumbnail: "https://picsum.photos/id/1/200/112",
    author: "张三",
    views: 1200,
    date: "2023-12-01"
  },
  {
    id: 2,
    title: "前端开发最佳实践",
    description: "介绍现代前端开发的最佳实践和常用技巧",
    thumbnail: "https://picsum.photos/id/2/200/112",
    author: "李四",
    views: 890,
    date: "2023-11-15"
  },
  {
    id: 3,
    title: "响应式布局设计",
    description: "学习如何设计适应各种屏幕尺寸的响应式网页",
    thumbnail: "https://picsum.photos/id/3/200/112",
    author: "王五",
    views: 760,
    date: "2023-10-20"
  },
  {
    id: 4,
    title: "JavaScript高级编程",
    description: "深入学习JavaScript的高级特性和编程技巧",
    thumbnail: "https://picsum.photos/id/4/200/112",
    author: "赵六",
    views: 1500,
    date: "2023-09-05"
  },
  {
    id: 5,
    title: "CSS动画实战",
    description: "使用CSS创建各种炫酷的动画效果",
    thumbnail: "https://picsum.photos/id/5/200/112",
    author: "钱七",
    views: 630,
    date: "2023-08-12"
  }
];

// 搜索API调用
const fetchSearchResults = async (query, page = 1, size = 10) => {
  if (!query || query.trim() === '') return;
  
  loading.value = true;
  searchQuery.value = query;
  
  try {
    // 从API获取数据
    const response = await searchService(query, page, size);
    
    // 更新数据（由于request.js已经处理了错误情况，这里只需处理成功响应）
    searchResults.value = response.data.list || [];
    totalItems.value = response.data.total || 0;
    noResults.value = (response.data.list || []).length === 0;
    
    // 移除模拟数据数组，不再需要
  } finally {
    loading.value = false;
  }
};

// 获取热门搜索关键词
const fetchHotKeywords = async () => {
  try {
    const response = await getHotSearchesService();
    hotKeywords.value = response.data || [];
  } catch {
    // 错误已由request.js处理，这里可以保持静默
  }
};

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchSearchResults(searchQuery.value, page, pageSize.value);
};

// 跳转到视频详情页
const goToVideoDetail = (videoId) => {
  router.push(`/video/${videoId}`);
};

// 搜索热门关键词
const searchHotKeyword = (keyword) => {
  router.push({
    path: '/search',
    query: { q: keyword }
  });
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 格式化时间（多久前）
const formatTime = (dateString) => {
  if (!dateString) return '';
  
  const now = new Date();
  const date = new Date(dateString);
  const diff = now - date;
  
  // 转换为相应的时间单位
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  
  if (years > 0) {
    return `${years}年前`;
  } else if (months > 0) {
    return `${months}个月前`;
  } else if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else {
    return '刚刚';
  }
};

// 格式化观看次数
const formatViewCount = (count) => {
  if (count === undefined || count === null) return '0';
  
  if (count < 1000) {
    return count.toString();
  } else if (count < 10000) {
    return (count / 1000).toFixed(1) + 'K';
  } else {
    return (count / 10000).toFixed(1) + '万';
  }
};

// 监听路由参数变化
watch(() => route.query.q || route.query.keyword, (newQuery) => {
  if (newQuery) {
    currentPage.value = 1;
    fetchSearchResults(newQuery);
  }
}, { immediate: true });

onMounted(() => {
  // 从URL获取搜索查询
  const query = route.query.q || route.query.keyword;
  if (query) {
    fetchSearchResults(query);
  }
  
  // 获取热门搜索关键词
  fetchHotKeywords();
});
</script>

<template>
  <div class="search-page">
    <div class="search-header">
      <h1 class="search-title">搜索结果: <span class="search-keyword">{{ searchQuery }}</span></h1>
      <p class="search-stats" v-if="!loading && searchResults.length > 0">
        找到 {{ totalItems }} 条相关结果
      </p>
    </div>
    
    <!-- 热门搜索标签 -->
    <div class="hot-keywords" v-if="hotKeywords.length > 0">
      <span class="hot-label">热门搜索：</span>
      <div class="keyword-tags">
        <el-tag 
          v-for="(keyword, index) in hotKeywords" 
          :key="index" 
          size="small" 
          class="hot-tag"
          @click="searchHotKeyword(keyword)"
        >
          {{ keyword }}
        </el-tag>
      </div>
    </div>
    
    <!-- 加载中状态 -->
    <div class="search-content" v-if="loading">
      <div class="skeleton-container" v-for="i in 5" :key="i">
        <el-skeleton animated>
          <template #template>
            <div class="skeleton-item">
              <!-- 随机显示一些带图片的骨架和一些不带图片的骨架 -->
              <template v-if="i % 2 === 0">
                <div class="skeleton-left">
                  <el-skeleton-item variant="image" style="width: 200px; height: 112px;" />
                </div>
                <div class="skeleton-right">
                  <el-skeleton-item variant="h3" style="width: 50%" />
                  <el-skeleton-item variant="text" style="margin-top: 16px; width: 80%" />
                  <el-skeleton-item variant="text" style="width: 60%" />
                  <div class="skeleton-footer">
                    <el-skeleton-item variant="text" style="width: 30%" />
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="skeleton-full">
                  <el-skeleton-item variant="h3" style="width: 50%" />
                  <el-skeleton-item variant="text" style="margin-top: 16px; width: 90%" />
                  <el-skeleton-item variant="text" style="width: 80%" />
                  <el-skeleton-item variant="text" style="width: 70%" />
                  <div class="skeleton-footer">
                    <el-skeleton-item variant="text" style="width: 30%" />
                  </div>
                </div>
              </template>
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>
    
    <!-- 无搜索结果 -->
    <div class="empty-results" v-else-if="noResults">
      <el-empty 
        description="没有找到相关结果" 
        :image-size="200"
      >
        <p>尝试使用其他关键词搜索</p>
      </el-empty>
    </div>
    
    <!-- 搜索结果列表 -->
    <div class="search-content" v-else>
      <div class="search-items">
        <div class="search-item" v-for="item in searchResults" :key="item.id" @click="goToVideoDetail(item.id)">
          <div class="item-thumbnail" v-if="item.videoImg">
            <img :src="item.videoImg" alt="视频缩略图">
          </div>
          <div class="item-info" :class="{'full-width': !item.videoImg}">
            <h4 class="item-title">{{ item.title }}</h4>
            <p class="item-desc">{{ item.introduction || '暂无简介' }}</p>
            <div class="item-meta">
              <span class="views">{{ formatViewCount(item.viewCount) }}次观看</span>
              <span class="dot">•</span>
              <span class="time">{{ formatTime(item.createTime) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="totalItems"
          :page-size="pageSize"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  max-width: 1000px;
  margin: 80px auto 40px;
  padding: 0 20px;
}

.search-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 16px;
}

.search-title {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 8px;
  font-weight: 600;
}

.search-keyword {
  color: #409eff;
}

.search-stats {
  color: #606266;
  font-size: 14px;
}

.hot-keywords {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 8px;
}

.hot-label {
  font-size: 14px;
  color: #606266;
  margin-right: 8px;
}

.keyword-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hot-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.hot-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-item {
  display: flex;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
  background-color: #fff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.search-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
}

.item-thumbnail {
  flex: 0 0 200px;
  height: 112px;
  overflow: hidden;
}

.item-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.search-item:hover .item-thumbnail img {
  transform: scale(1.05);
}

.item-info {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-info.full-width {
  width: 100%;
  padding: 20px 24px;
}

.item-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 16px;
  flex-grow: 1;
}

.item-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #909399;
}

.views {
  font-weight: 500;
}

.dot {
  margin: 0 8px;
}

.time {
  font-weight: 500;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.empty-results {
  margin: 60px 0;
  text-align: center;
}

.empty-results p {
  color: #909399;
  margin-top: 10px;
}

.skeleton-container {
  margin-bottom: 20px;
}

.skeleton-item {
  display: flex;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.skeleton-left {
  flex: 0 0 200px;
  margin-right: 16px;
}

.skeleton-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.skeleton-footer {
  margin-top: 20px;
}

.skeleton-full {
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 768px) {
  .search-item {
    flex-direction: column;
  }
  
  .item-thumbnail {
    width: 100%;
    height: auto;
  }
  
  .item-thumbnail img {
    width: 100%;
    height: auto;
    max-height: 200px;
    object-fit: cover;
  }
  
  .item-info, .item-info.full-width {
    width: 100%;
    padding: 16px;
  }
  
  .search-header {
    margin-bottom: 20px;
  }
  
  .search-title {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .search-page {
    margin-top: 60px;
  }
  
  .item-thumbnail {
    height: 160px;
  }
  
  .item-title {
    font-size: 16px;
  }
  
  .item-meta {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style> 