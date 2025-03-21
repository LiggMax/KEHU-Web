import request from '../utils/request.js'

/**
 * 获取用户的视频列表
 */
export const getUserVideosService = () => {
    return request.get('/video/list')
}

/**
 * 上传视频
 * @param {Object} data 包含标题、描述和视频文件
 */
export const uploadVideoService = (data) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('videoFile', data.videoFile)
    
    return request.post('/video/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
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
 * 更新视频信息
 * @param {Object} data 包含视频ID、标题和描述
 */
export const updateVideoService = (data) => {
    return request.put(`/video/${data.id}`, data)
} 