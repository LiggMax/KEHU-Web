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