'use client'
import React, { useCallback, useEffect, useRef, useState } from "react";
import { message, Modal } from 'antd'
import { ExclamationCircleFilled, LoginOutlined, LoadingOutlined } from "@ant-design/icons";
// import dayjs from "dayjs";
import { useSession, getSession, signOut } from "next-auth/react"
import Loading from "@/components/loading";
import LogoutLayout from "@/components/layout/logoutLayout";
import { refreshToken, isReadNotify, getAccountBaseInfo } from '@/lib/slices/authSlice'
import {invalidateSessionCache} from '@/lib/axios'
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { setIsMobile, setIsXlScreen, setIsMdScreen, setPlatFormTheme, setProgress } from "@/lib/slices/systemSlice";
import GlobalLoading from "@/components/globalLoading";
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import { reset } from "@/lib/slices/aiSpaceSlice";
import LoginLayout from "@/components/layout/loginLayout";


function ChildrenLayout({ children, serverSession }) {
    const { confirm } = Modal;
    // useSession中的session需要useEffect监听变化才能拿到最新的，而getSession获取的永远是最新的
    const { data: session, status, update } = useSession()
    const dispatch = useDispatch()
    const router = useRouter()
    const query = useSearchParams()
    const { isRouteChanging, loadingKey, isMobile } = useSelector(state => state.system)
    const [isOnline, setOnline] = useState(true)
    const pathname = usePathname()
    const [error, setError] = useState({
        show: false,
        content: ""
    });
    const [messageApi, contextHolder] = message.useMessage();

    const latestUpdate = useRef()

    // 生产环境禁止打印日志
    if (process.env.NODE_ENV === 'production') {
        console.log = () => {
        }
        console.warn = () => {
        }
    }

    useEffect(() => {
        // 必须：更新update，否则在tokenHandler方法中拿不到最新的update方法
        latestUpdate.current = update
    }, [update]);

    useEffect(() => {
        // 监听路由变化，如果变化了则执行此代码，停止加载process bar
        dispatch(setProgress({
            isRouteChanging: false
        }))
        console.log('query-', query)
        console.log('pathname-', pathname)
        // 注意：只有工具间切换需要缓存数据，跳转到其它页面一律清除工具缓存
        if (!pathname.includes('aiSpace/aiUsed') && !pathname.includes('aiSpace/aiTools')) {
            dispatch(reset())
        }
    }, [pathname, query])

    useEffect(() => {
        // 立即执行：每一次进来就执行函数进行检查
        checkToken()
        document.addEventListener('visibilitychange', tokenHandler);

        window.addEventListener("offline", changeOffline);
        window.addEventListener('online', changeOnline);

        changeResize()
        window.addEventListener('resize', changeResize);

        //return 中的清理函数在组件卸载或 update 变量变化时执行
        return () => {
            // 销毁的时候是removeEventListener，而不是addEventListener，否则会造成dead cycle
            document.removeEventListener('visibilitychange', tokenHandler);
            // clearInterval(interval)
            window.removeEventListener("offline", changeOffline);
            window.removeEventListener('online', changeOnline);

            window.removeEventListener('resize', changeResize);
        };
    }, []);

    function changeResize() {
        if (window.innerWidth <= 768) {
            console.log("切换到小屏设备");
            dispatch(setIsMobile(true))
        } else {
            console.log("切换到大屏设备");
            dispatch(setIsMobile(false))
        }

        if (window.innerWidth < 1280 && window.innerWidth > 768) {
            dispatch(setIsMdScreen(true))
        } else {
            dispatch(setIsMdScreen(false))
        }

        if (window.innerWidth >= 1280) {
            dispatch(setIsXlScreen(true))
        } else {
            dispatch(setIsXlScreen(false))
        }
    }


    // 防抖：10秒内如果触发多次，只有最后一次会被执行，不过注意，我们没有直播使用update方法，因为拿到的不是最新的，我们只能定义一个新变量latestUpdate来捕捉update的变化，然后才能使用
    // 显示页面时需要验证token是否过期，
    const tokenHandler = _.debounce(async () => checkToken(), 1000)

    // 从用户信息同步主题设置
    function syncThemeFromUserInfo(userData) {
        const background = userData.background;
        const color = userData.color || '#54458a';

        if (background === 'light') {
            document.documentElement.classList.remove('dark');
        } else if (background === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        localStorage.setItem('theme.background', background || 'light');
        localStorage.setItem('theme.color', color);
        dispatch(setPlatFormTheme({ background: background || 'light', color }));
    }

    // 清除主题设置（未登录时）
    function clearThemeSettings() {
        document.documentElement.classList.remove('dark');
        localStorage.removeItem('theme.background');
        localStorage.removeItem('theme.color');
        dispatch(setPlatFormTheme({ background: 'light', color: '#54458a' }));
    }

    // 处理token刷新
    async function handleTokenRefresh(session) {
        const res = await dispatch(refreshToken());
        console.log('tokenHandler refreshToken res=', res);

        if (res?.payload?.status === 40001) {
            confirm({
                title: '登录已过期',
                icon: <ExclamationCircleFilled />,
                content: '您的登录已过期，请重新登录！',
                okText: '确定',
                cancelText: '取消',
                onOk() {
                    signOut({ callbackUrl: `/` });
                },
                onCancel() {
                    signOut({ callbackUrl: `/` });
                }
            });
        } else if (res?.payload?.data && session?.accessToken !== res?.payload?.data) {
            latestUpdate.current({ newTokenId: res.payload.data });
            invalidateSessionCache();
        }
    }

    // 检查token
    async function checkToken() {
        console.log('visibilityState', document.visibilityState);
        try {
            if (document.hidden) return;

            const session = await getSession();
            console.log('session ---', session);

            if (!session?.accessToken || !session?.user) {
                clearThemeSettings();
                return;
            }

            const accountBaseInfo = await dispatch(getAccountBaseInfo());
            console.log('res2 ===', accountBaseInfo);

            if (accountBaseInfo?.payload?.status === 0 && accountBaseInfo?.payload?.data) {
                syncThemeFromUserInfo(accountBaseInfo.payload.data);
            }

            await handleTokenRefresh(session);
        } catch (e) {
            console.log('报错：', e);
        }
    }

    function changeOffline() {
        setOnline(false)
        setError({
            show: true,
            content: "你没有联网，请检查网络连接。"
        });
    }

    function changeOnline() {
        setOnline(true)
        setError({
            show: false
        });
    }

    function renderChildren(children) {
        if (status === 'loading' && serverSession?.user) {
            return <div className={'flex items-center justify-center h-screen w-screen'}>
                <Loading />
            </div>
        }
        return <div className={'w-full h-full'}>
            {/*没有登录就不显示顶部菜单栏*/}
            {pathname !== '/fileSpace/onlyoffice' ? (
                serverSession?.user ? <LoginLayout children={children} /> : <>
                    <LogoutLayout isLogin={!!serverSession?.user} />
                    {children}
                </>
            ) : null}
        </div>
    }

    return <div className={'w-full h-full'}>
        {contextHolder}
        <GlobalLoading isRouteChanging={isRouteChanging} key={loadingKey} />
        {isOnline ? renderChildren(children) : <div className={'flex flex-col justify-center items-center gap-4 pt-4'}>
            {/*<Image width={200} height={200} src={lostnet}/>*/}
            <LoadingOutlined className={'text-3xl py-4'} />
            <div className={'text-2xl'}>连接到互联网</div>
            <div className={'text-base'}>你没有联网，请检查网络连接。</div>
        </div>}
    </div>
}

export default ChildrenLayout