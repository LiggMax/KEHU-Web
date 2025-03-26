import request from "@/utils/request.js";

export const getAdminInfoService = () => {
    return request.get('/account/adminInfo')
}

export const logoutService = () => {
    return request.delete('/account/logout')
}

// 用户管理相关接口
export const getUserListService = () => {
    return request.get('/account/userList')
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