// 用户认证相关的工具函数

// 用户信息存储的key
const USER_KEY = 'login_user'

/**
 * 保存用户信息到localStorage
 * @param {Object} userInfo 用户信息
 */
export function setUserInfo(userInfo) {
  localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
}

/**
 * 从localStorage获取用户信息
 * @returns {Object|null} 用户信息
 */
export function getUserInfo() {
  const userInfo = localStorage.getItem(USER_KEY)
  return userInfo ? JSON.parse(userInfo) : null
}

/**
 * 清除用户信息
 */
export function removeUserInfo() {
  localStorage.removeItem(USER_KEY)
}

/**
 * 判断用户是否已登录
 * @returns {Boolean} 是否已登录
 */
export function isLoggedIn() {
  return !!getUserInfo()
} 