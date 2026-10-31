'use client'
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch, useSelector} from "react-redux";
import {MenuFoldOutlined, MenuOutlined} from "@ant-design/icons";
import {
    setOpenMailMessageListDrawer,
    setOpenSidebarDrawer,
    setShowSidebar
} from '@/lib/slices/mailSpaceSlice'
const MailMessageList = (props) => {
    const {data: session} = useSession()
    const router = useRouter();
    const dispatch = useDispatch()
    const {platFormTheme, isMobile, isMdScreen} = useSelector(state => state.system)
    const {showSidebar, openSidebarDrawer, openMailMessageListDrawer} = useSelector(state => state.mailSpace)

    useEffect(()=>{

    },[])

    function renderIcon() {
        if (isMdScreen || isMobile) {
            return !openSidebarDrawer ? <MenuOutlined/> : <MenuFoldOutlined/>
        } else {
            return !showSidebar ? <MenuOutlined/> : <MenuFoldOutlined/>
        }
    }

    return <div className={'flex flex-col gap-2'}>
        <div className={'flex items-center gap-1 p-2'}>
            <div
                className={'flex items-center justify-center cursor-pointer hover:bg-[#eee] dark:hover:bg-[#2E333C] w-[36px] h-[36px] rounded-full'}
                onClick={() => {
                    if (isMdScreen || isMobile) {
                        dispatch(setOpenSidebarDrawer(!openSidebarDrawer))
                        dispatch(setShowSidebar(false))
                    } else {
                        dispatch(setOpenSidebarDrawer(false))
                        dispatch(setShowSidebar(!showSidebar))
                    }
                }}>
                {renderIcon()}
            </div>
            全部标记已读
        </div>
    </div>
};

export default withRouter(MailMessageList);