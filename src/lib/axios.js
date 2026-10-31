import axios from 'axios';

import {getSessionCached, invalidateSessionCache} from "@/lib/sessionCache"

axios.defaults.withCredentials = true;
const axiosInstance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_HOST}`,
    withCredentials: false,
});

// 添加请求拦截器
axiosInstance.interceptors.request.use(
    async config => {
        // 参考：https://stackoverflow.com/questions/77564411/use-axios-interceptor-to-refresh-the-token-for-next-auth
        const session = await getSessionCached()

        // 在发送请求之前做些什么，例如从 localStorage 获取 token
        // const token = localStorage.getItem('token');
        if (session?.accessToken) {
            // 让每个请求带上自定义的 token 请根据实际情况自行修改
            config.headers['token-id'] = session?.accessToken;
        }
        return config;
    },
    error => {
        // 对请求错误做些什么
        return Promise.reject(error);
    }
);

export { invalidateSessionCache };
export default axiosInstance;
