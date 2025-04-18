//定制请求的实例

//导入axios  npm install axios
import axios from 'axios';
import {ElMessage} from "element-plus";
import router from '../router';

//定义一个变量,记录公共的前缀  ,  baseURL
const baseURL = '/api';
const instance = axios.create({
    baseURL,
    withCredentials: true // 允许跨域请求携带cookie
})

//添加请求拦截器
instance.interceptors.request.use(
    config => {
        //请求前回调
        
        // 对于表单数据，设置正确的Content-Type
        if (config.data instanceof URLSearchParams) {
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        
        return config;
    },
    (err) => {
        //请求失败回调
        return Promise.reject(err);//异步的状态转化成失败的状态
    }
)

//添加响应拦截器
instance.interceptors.response.use(
    result => {
        //判断业务状态码
        if (result.data.code === 200) {
            //返回数据
            return result.data;
        }
        //提示错误信息
        ElMessage.error(result.data.message?result.data.message:'服务异常')
        //异步操作状态转换为失败
        return Promise.reject(result.data);
    },
    err => {
        if (err.response && err.response.status === 429) {
            ElMessage.error('请求过于频繁，请稍后再试')
        } else if (err.response && err.response.status === 401) {
            ElMessage.error('请先登录')
            // 重定向到登录页
            router.push('/')
        } else {
            ElMessage.error('服务异常')
        }
        return Promise.reject(err);//异步的状态转化成失败的状态
    }
)
export default instance;
