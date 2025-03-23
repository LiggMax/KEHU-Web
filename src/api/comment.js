import request from '../utils/request.js'

/**
 * 添加评论
 * @param {Object} data 包含评论内容和视频ID
 */
export const addCommentService = (data) => {
    return request.post('/comment', data)
}

/**
 * 获取视频评论列表
 * @param {Number} videoId 视频ID
 */
export const getCommentsByVideoIdService = (videoId) => {
    return request.get(`/comment/video/${videoId}`)
}

/**
 * 获取视频评论数量
 * @param {Number} videoId 视频ID
 */
export const countCommentsByVideoIdService = (videoId) => {
    return request.get(`/comment/count/${videoId}`)
}

/**
 * 删除评论
 * @param {Number} id 评论ID
 */
export const deleteCommentService = (id) => {
    return request.delete(`/comment/${id}`)
}

/**
 * 评论点赞
 * @param {Number} id 评论ID
 */
export const likeCommentService = (id) => {
    return request.post(`/comment/like/${id}`)
} 