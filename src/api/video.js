import request from '../utils/request.js'


/**
 * 获取所有视频列表
 */
export const getAllVideosService = () => {
    return request.get('/video/all')
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

/**
 * 更新视频封面
 * @param {Number} videoId 视频ID
 * @param {File} coverFile 封面文件
 */
export const updateCoverService = (videoId, coverFile) => {
    const formData = new FormData()
    formData.append('coverFile', coverFile)
    
    return request.post(`/video/${videoId}/cover`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
} 