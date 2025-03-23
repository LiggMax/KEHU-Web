import request from '../utils/request.js'

/**
 * 获取所有视频列表
 */
export const getAllVideosService = () => {
    return request.get('/video/all')
}

/**
 * 获取视频详情
 * @param {Number} videoId 视频ID
 */
export const getVideoById = (videoId) => {
    return request.get(`/video/${videoId}`)
}

/**
 * 增加视频观看次数
 * @param {Number} videoId 视频ID
 */
export const incrementViewCountService = (videoId) => {
    return request.post(`/video/${videoId}/view`)
}

/**
 * 根据分类获取视频
 * @param {String} category 分类名称
 * @param {Number} page 页码
 * @param {Number} size 每页条数
 */
export const getVideosByCategoryService = (category, page = 1, size = 10) => {
    return request.get('/video/category', {
        params: {
            category,
            page,
            size
        }
    })
} 