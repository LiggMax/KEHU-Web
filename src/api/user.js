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
 * @param {Object} data 包含标题、描述、视频文件和封面文件
 * @param {Function} onProgress 进度回调函数
 */
export const uploadVideoService = (data, onProgress) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description || '')
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