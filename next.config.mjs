/** @type {import('next').NextConfig} */
const nextConfig = {
    // webpack(config, { dev, isServer }) {
    //     config.devtool = false
    //     return config
    // },
    experimental:{
        staleTimes: {
            // 参考：https://github.com/vercel/next.js/issues/49300
            // https://nextjs.org/docs/app/api-reference/next-config-js/staleTimes
            // 清除缓存
            dynamic: 0
        }
    }
};

export default nextConfig;
