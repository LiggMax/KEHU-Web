import request from '@/utils/request';

// 设置基础URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// 搜索API接口
export const searchService = async (query, page = 1, size = 10) => {
  return request({
    url: '/video/search',
    method: 'get',
    params: {
      q: query,
      page,
      size
    }
  });
};

// 获取热门搜索关键词
export const getHotSearchesService = async () => {
  return request({
    url: '/video/search/hot',
    method: 'get'
  });
};

// 获取搜索建议
export const getSearchSuggestionsService = async (keyword) => {
  return request({
    url: '/video/search/suggest',
    method: 'get',
    params: {
      keyword
    }
  });
}; 