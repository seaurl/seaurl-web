'use client'
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch, useSelector} from "react-redux";
import {MenuOutlined} from "@ant-design/icons";
import {
    setOpenMailMessageListDrawer,
    setOpenSidebarDrawer,
    setShowSidebar
} from '@/lib/slices/mailSpaceSlice'
const MailEditor = (props) => {
    const {data: session} = useSession()
    const router = useRouter();
    const dispatch = useDispatch()
    const {showSidebar, openSidebarDrawer, openMailMessageListDrawer} = useSelector(state => state.mailSpace)

    useEffect(()=>{

    },[])

    return <div className={'flex flex-col gap-2'}>
        <div
            className={'flex md:hidden items-center justify-center hover:bg-[#eee] dark:hover:bg-[#2E333C] shrink-0 w-[36px] h-[36px] rounded-full cursor-pointer'}
            onClick={() => {
                dispatch(setOpenMailMessageListDrawer(!openMailMessageListDrawer))
            }}>
            <MenuOutlined/>
        </div>
    </div>
};

export default withRouter(MailEditor);