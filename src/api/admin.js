import request from '@/utils/request'

// 管理员登录
export const adminLoginService = (username, password) => {
    return request({
        url: '/admin/login',
        method: 'post',
        data: {
            username,
            password
        }
    })
}

// 获取管理员信息
export const getAdminInfoService = (id) => {
    return request({
        url: '/admin/info',
        method: 'get',
        params: { id }
    })
}

