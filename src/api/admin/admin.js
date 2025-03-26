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

export const updateUserService = (id, data) => {
    return request.put(`/admin/user/update/${id}`, {
        nickname: data.nickname,
        email: data.email,
        status: data.status
    })
}

export const deleteUserService = (id) => {
    return request.delete(`/admin/user/delete/${id}`)
}

export const getUserByIdService = (id) => {
    return request.get(`/admin/user/${id}`)
}