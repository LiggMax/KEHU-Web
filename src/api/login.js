import request from '../utils/request.js'

export const loginService = (username, password) => {
    const params = new URLSearchParams()
    params.append('username', username)
    params.append('password', password)
    
    return request.post('/login', params)
}

export const registerService = (username, password) => {
    const params = new URLSearchParams()
    params.append('username', username)
    params.append('password', password)
    
    return request.post('/register', params)
}


