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
