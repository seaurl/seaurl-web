'use client'
import { Button, theme, Tooltip } from 'antd'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from "react";

import { useAppDispatch } from "@/lib/hooks";
import { useAppSelector } from "@/lib/hooks";
import { usePathname } from 'next/navigation'
import LogoInHeader from "@/components/layout/logoInHeader";
// import AddInHeader from "@/components/layout/addInHeader";
import MenusInHeader from "@/components/layout/menusInHeader";
import SearchInHeader from "@/components/layout/searchInHeader";
import UserInHeader from "@/components/layout/userInHeader";
import QuickToolsInHeader from "@/components/layout/quickToolsInHeader";
import RemindInHeader from "@/components/layout/remindInHeader";
import MessageInHeader from "@/components/layout/messageInHeader";
import { setPlatFormTheme, queryUserAiTools } from "@/lib/slices/systemSlice";
import { useSelector } from "react-redux";
import { withRouter } from "@/hoc/withRouter";
import AiToolsInHeader from "@/components/layout/aiToolsInHeader"
const { useToken } = theme;


function TopMenus({ isLogin: serverLogin, routerPush }) {

    const dispatch = useAppDispatch()
    const { platFormTheme, userAiToolsList } = useSelector(state => state.system)

    const topMenuRef = useRef(null)
    const [isLogin, setIsLogin] = useState(false)
    const query = useSearchParams()

    // console.log('token ===', token.colorPrimaryBg)
    const pathname = usePathname()

    useEffect(() => {
        setIsLogin(serverLogin)
        // getData()
    }, [])

    useEffect(() => {
        if (query.get('usedId')) {
            // getData()
        }
    }, [query.get('usedId')]);

    useEffect(() => {
        // topMenuRef.current.style.backgroundColor = '#54458a'
        // 监听主题是否变化，如果变化，就跟着变
        if (isLogin && platFormTheme && topMenuRef.current) {
            // 判断是否是深色
            if (platFormTheme.background === 'dark'
                || (platFormTheme.background === 'system'
                    && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                topMenuRef.current.style.backgroundColor = ''
            } else {
                topMenuRef.current.style.backgroundColor = platFormTheme?.color
            }
        }
    }, [platFormTheme])

    function getData() {
        // 获取用户使用过的userAi工具列表
        dispatch(queryUserAiTools())
    }

    return <>
        {
            pathname !== '/login' ? <div ref={topMenuRef}
                className={`dark:bg-[#000] dark:text-white flex sticky top-0 w-full z-[100] bg-[#54458a] h-[56px] dark:border-b dark:border-[#474747]`}>
                <div className={'flex flex-row justify-between px-4 w-full'}>
                    <div className={'flex gap-4 '}>
                        <LogoInHeader />
                    </div>
                    <div className={'flex items-center justify-center'}>
                        {isLogin ?
                            <div className={'flex text-white items-center gap-2 lg:gap-5'}>
                                <div className={'flex items-center gap-2 lg:gap-5'}>


                                </div>
                                <div className={'hidden lg:flex gap-3'}>
                                    <AiToolsInHeader />
                                </div>
                            </div> :
                            <div
                                className={'text-sm text-white cursor-pointer hover:text-[#eee] dark:hover:text-[#eee]'}
                                onClick={() => goto('/login')}>登录</div>}

                    </div>
                </div>
            </div> : null
        }
    </>

    // function toggleTheme(type) {
    //     dispatch(setMyTheme(myTheme === 'dark' ? 'default' : 'dark'))
    // }

    function goto(val) {
        // router.push(val)
        routerPush(val)
    }
}

export default withRouter(TopMenus)