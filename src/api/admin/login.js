import request from "@/utils/request.js";

// 管理员登录
export const adminLoginService = (data) => {
    return request.post('/account/adminLogin', data)
}

