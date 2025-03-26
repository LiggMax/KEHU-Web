import request from "@/utils/request.js";

export const getAdminInfoService = () => {
    return request.get('/account/adminInfo')
}

export const logoutService = () => {
    return request.delete('/account/logout')
}