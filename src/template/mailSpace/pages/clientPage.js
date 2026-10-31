'use client'
import {useDispatch, useSelector} from "react-redux";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {Drawer, theme} from "antd";
import {useEffect, useState} from "react";
import LeftPanel from "@/template/mailSpace/components/leftPanel";
import MailMessageList from "@/template/mailSpace/components/mailMessageList";
import MailEditor from "@/template/mailSpace/components/mailEditor";
import classNames from "classnames/bind";
import {
    setOpenMailMessageListDrawer,
    setOpenSidebarDrawer,
    setShowSidebar
} from '@/lib/slices/mailSpaceSlice'

const ClientPage = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    // const {query} = router;
    const routerParams = useParams()
    const [open, setOpen] = useState(false);
    const [childrenOpen, setChildrenOpen] = useState(false);
    const {token} = theme.useToken();
    const {isMobile, isXlScreen, isMdScreen} = useSelector(state => state.system)
    const {showSidebar, openSidebarDrawer, openMailMessageListDrawer} = useSelector(state => state.mailSpace)
    const query = useSearchParams()

    // 监听变化
    useEffect(() => {
        dispatch(setOpenMailMessageListDrawer(false))
        // 初始化两个面板的显示条件
        if (isMobile) {
            dispatch(setShowSidebar(false))
            dispatch(setOpenSidebarDrawer(false))
        }
    }, [isMobile]);

    useEffect(() => {
        // dispatch(setOpenNoteListMobileDrawer(false))
        // // 初始化两个面板的显示条件
        if (isMdScreen) {
            dispatch(setShowSidebar(false))
            dispatch(setOpenSidebarDrawer(false))
        }
    }, [isMdScreen]);

    useEffect(() => {
        if (isXlScreen) {
            dispatch(setShowSidebar(true))
            dispatch(setOpenSidebarDrawer(false))
        }
    }, [isXlScreen]);

    return <div className={'overflow-hidden h-screen'}>
        <div className={'flex flex-row h-full'}>
            <div
                style={{backgroundColor: token.colorPrimary || 'transparent'}}
                className={classNames({
                    'flex-col': true,
                    'w-0 hidden': !showSidebar,
                    'w-[260px] pl-1 dark:pl-0 border-r border-[#ddd] dark:border-[#474747] ': showSidebar
                })}>
                <LeftPanel rounded={true}/>
                {/*<UserHeader userInfo={props.userInfo}/>*/}
            </div>
            <div className={'hidden md:block shrink-0 w-[260px] border-r border-[#ddd] dark:border-[#474747]'}>
                <MailMessageList/>
            </div>
            <div className={classNames({
                'bg-white dark:bg-[#141414] shirk-0': true,
                'w-screen': isMobile,
                'w-[calc(100vw-260px)]': isMdScreen || (isXlScreen && !showSidebar),
                'w-[calc(100vw-520px)]': isXlScreen && showSidebar
            })}>
                <MailEditor onOpenDrawer={() => {
                    setOpen(true)
                }}/>
            </div>
        </div>

        <Drawer styles={{
            body: {
                padding: '0',
            },
        }}
                title={null}
                width={320}
                closable={false}
                placement="left"
                onClose={() => dispatch(setOpenMailMessageListDrawer(false))}
                open={openMailMessageListDrawer}>
            <div className={'w-full'}>
                <MailMessageList/>
            </div>

        </Drawer>

        <Drawer
            title=""
            styles={{
                body: {
                    padding: '0',
                },
            }}
            placement="left"
            width={320}
            zIndex={2000}
            closable={false}
            onClose={() => dispatch(setOpenSidebarDrawer(false))}
            open={openSidebarDrawer}>
            <div className={'w-full flex flex-col'}>
                <LeftPanel
                    isDrawer
                    rounded={false}
                    onClickCategory={() => {
                        // dispatch(setOpenMobileDrawer(false))
                    }}/>
            </div>
        </Drawer>
    </div>
}

export default ClientPage