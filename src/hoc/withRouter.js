// HOC 示例
import {useDispatch, useSelector} from "react-redux";
import {usePathname, useRouter} from "next/navigation";
import {setProgress} from "@/lib/slices/systemSlice";
import {useSession} from "next-auth/react";
import {revalidatePath} from "next/cache";
import {reset} from "@/lib/slices/aiSpaceSlice";

export function withRouter(WrappedComponent) {

    function isSamePath(url1, url2) {
        const parsedUrl1 = new URL(url1, window.location.origin);
        const parsedUrl2 = new URL(url2, window.location.origin);

        // 比较 pathname 是否相同
        return parsedUrl1.pathname === parsedUrl2.pathname;
    }

    // 新组件，包含增强功能
    return function EnhancedComponent(props) {
        const dispatch = useDispatch()
        const router = useRouter()
        const pathname = usePathname()
        const {data: session} = useSession()

        const {loadingKey} = useSelector(state => state.system)
        const {chooseUserAiTool} = useSelector(state => state.aiSpace)


        // 在此可以添加额外的逻辑，比如处理props、订阅等
        const newProps = {
            ...props,
            // 添加自定义属性
            routerPush: (url) => {
                console.log('----url=', url)
                console.log('----pathname=', pathname)
                console.log('---------', isSamePath(url, pathname))
                // console.log('----router=', location.pathname)
                // 判断有没有登录，没有登录则使用location跳转，否则使用h5跳转
                if (session?.user) {
                    // 相同的地址不需要跳转，并且不是前缀关系
                    if (url !== pathname) {
                        // if (url.startsWith(pathname) && pathname !== '/') {
                        //     router.push(url)
                        // } else {
                        if (!isSamePath(url, pathname)) {
                            dispatch(setProgress({
                                isRouteChanging: true,
                                loadingKey: loadingKey ^ 1
                            }))
                            router.push(url)
                        } else {

                            router.push(url)
                        }

                        // console.log(' withrouter - chooseUserAiTool -', chooseUserAiTool)

                        // 注意：只有工具间切换需要缓存数据，跳转到其它页面一律清除工具缓存(我现在留着这段代码，如果后面改变主意再切回来)
                        // 拦截drawio的工具，并缓存，否则直接跳转
                        // if (url !== '/aiSpace/aiUsed' && chooseUserAiTool?.type === 'drawio'){
                        //     dispatch(setAiToolsWillChange((exportDrawioXml) => {
                        //         // exportDrawioXml就是从拦截的工具传递过来的参数，并且是function
                        //         if (exportDrawioXml) {
                        //             // 如果存在a这个function则执行a，并且将跳转做为参数传递给具体的工具中
                        //             exportDrawioXml(() => {
                        //                 router.push(url)
                        //             })
                        //         }
                        //     }))
                        // }else{
                        //     router.push(url)
                        // }
                        // }
                    }
                } else {
                    location.href = url
                }

            }
        };

        // 渲染传入的组件，并传递新的props
        return <WrappedComponent {...newProps} />;
    };
}