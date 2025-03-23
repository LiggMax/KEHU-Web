import request from '../utils/request.js'

/**
 * 获取当前登录用户信息
 */
export const getCurrentUserService = () => {
    return request.get('/user/current-user')
}

/**
 * 退出登录
 */
export const logoutService = () => {
    return request.post('/user/logout')
}

/**
 * 获取用户的视频列表
 */
export const getUserVideosService = () => {
    return request.get('/user/video/list')
}

/**
 * 上传视频
 * @param {Object} data 包含标题、描述、分类、视频文件和封面文件
 * @param {Function} onProgress 进度回调函数
 */
export const uploadVideoService = (data, onProgress) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description || '')
    formData.append('category', data.category || '')
    formData.append('videoFile', data.videoFile)

    // 如果有封面文件，也添加到表单
    if (data.coverFile) {
        formData.append('coverFile', data.coverFile)
    }

    return request.post('/user/video/upload', formData, {
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
    return request.delete(`/user/video/${videoId}`)
}

/**
 * 更新视频信息
 * @param {Object} data 包含视频ID、标题、描述和分类
 */
export const updateVideoService = (data) => {
    return request.put(`/user/video/${data.id}`, {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category
    })
}

/**
 * 更新视频封面
 * @param {Number} videoId 视频ID
 * @param {File} coverFile 封面文件
 */
export const updateCoverService = (videoId, coverFile) => {
    const formData = new FormData()
    formData.append('coverFile', coverFile)
    
    return request.post(`/user/video/${videoId}/cover`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}