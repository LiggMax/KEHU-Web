import request from '../utils/request.js'

/**
 * 获取用户的视频列表
 */
export const getUserVideosService = () => {
    return request.get('/video/list')
}

/**
 * 获取所有视频列表
 */
export const getAllVideosService = () => {
    return request.get('/video/all')
}

/**
 * 上传视频
 * @param {Object} data 包含标题、描述和视频文件
 * @param {Function} onProgress 进度回调函数
 */
export const uploadVideoService = (data, onProgress) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description || '')
    formData.append('videoFile', data.videoFile)
    
    return request.post('/video/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: onProgress
    })
}

/**
 * 删除视频
 * @param {Number} videoId 视频ID
 */
export const deleteVideoService = (videoId) => {
    return request.delete(`/video/${videoId}`)
}

/**
 * 获取视频详情
 * @param {Number} videoId 视频ID
 */
export const getVideoById = (videoId) => {
    return request.get(`/video/${videoId}`)
}

/**
 * 更新视频信息
 * @param {Object} data 包含视频ID、标题和描述
 */
export const updateVideoService = (data) => {
    return request.put(`/video/${data.id}`, data)
} 