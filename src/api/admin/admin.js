import request from "@/utils/request.js";

export const getAdminInfoService = () => {
    return request.get('/account/adminInfo')
}

export const logoutService = () => {
    return request.delete('/account/logout')
}

// 用户管理相关接口
export const getUserListService = (params = {}) => {
    return request.get('/account/userList', { params });
}

export const addUserService = (data) => {
    return request.post('/admin/user/add', {
        username: data.username,
        nickname: data.nickname,
        email: data.email,
        password: data.password,
        status: data.status
    })
}

export const updateUserService = (userData) => {
    return request.post('/account/updateUser', userData);
}

export const deleteUserService = (id) => {
    return request.delete(`/admin/user/delete/${id}`)
}

export const getUserByIdService = (userId) => {
    return request.get('/account/getUserById', {
        params: { userId }
    });
}

// 视频管理相关接口
export const getVideoListService = (params = {}) => {
    return request.get('/account/videoList', { params });
}

export const getVideoByIdService = (videoId) => {
    return request.get('/account/getVideoById', {
        params: { videoId }
    });
}

// 删除视频
export const deleteVideoService = (id) => {
    return request.delete(`/account/videos/${id}`);
}

// 评论管理相关接口
export const getCommentListService = (params = {}) => {
    return request.get('/account/commentList', { params });
}

export const getCommentByIdService = (commentId) => {
    return request.get('/account/getCommentById', {
        params: { commentId }
    });
}

export const deleteCommentService = (id) => {
    return request.delete(`/account/comments/${id}`);
}
