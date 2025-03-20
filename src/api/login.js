import request from '../utils/request.js'

export const loginService = (data) => {

    const params = new URLSearchParams()
    for (let key in data){
        params.append(key,data[key])
    }
    return request.post('/login',params)
}

export const registerService = (data) => {

    const params = new URLSearchParams()
    for (let key in data){
        params.append(key,data[key])
    }
    return request.post('/register',params)
}

