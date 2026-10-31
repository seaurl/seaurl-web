'use client'
import {useDispatch, useSelector} from "react-redux";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {Drawer, theme} from "antd";
import {useEffect, useRef, useState} from "react";
import LeftPanel from "@/components/mailSpace/leftPanel";
import MailMessageList from "@/components/mailSpace/mailMessageList";
import MailEditor from "@/components/mailSpace/mailEditor";
import classNames from "classnames/bind";
import {
    getMailMessages, resetMailMessageList, setChooseMailMessage, setFoundSyncingMailbox, setMailMessage,
    setOpenMailMessageListDrawer,
    setOpenSidebarDrawer, setServerData,
    setShowSidebar
} from '@/lib/slices/mailSpaceSlice'
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import {sortFolderList} from "@/utils/help";
import {MailOutlined} from "@ant-design/icons";

const ClientPage = (props) => {
    const router = useRouter();
    const dispatch = useDispatch();
    // const {query} = router;
    const routerParams = useParams()
    const [open, setOpen] = useState(false);
    const [childrenOpen, setChildrenOpen] = useState(false);
    const {token} = theme.useToken();
    const {isMobile, isXlScreen, isMdScreen} = useSelector(state => state.system)
    const {
        showSidebar,
        openSidebarDrawer,
        openMailMessageListDrawer,
        mailProviders,
        mailMessageList
    } = useSelector(state => state.mailSpace)
    const query = useSearchParams()

    const isServer = useRef(true)
    const abortControllerRef = useRef(null)

    useEffect(() => {
        console.log('props=server=', props)
        if (isServer) {
            isServer.current = false
            if (props.mailProviderData) {
                dispatch(setServerData(props.mailProviderData))
                init(props.mailProviderData)
            }
        }
    }, [])

    async function init(mailProviders) {
        let mailbox = null
        if (mailProviders?.length > 0) {
            let firstFolder = null

            // 如果存在fid则从mailProviders中筛选出来，否则取第1个邮箱数据
            if (query.get('fid')) {
                mailProviders.forEach(mail => {
                    const fs = mail.mailFolderList.filter(f => f.id === query.get('fid'))
                    if (fs?.length > 0) {
                        mailbox = mail
                        firstFolder = fs[0]
                    }
                })
            } else {
                mailbox = mailProviders[0]
                firstFolder = mailProviders[0].mailFolderList[0]
            }
            // console.log('firstFolder ========', firstFolder)
            // console.log('mailbox ========', mailbox)
            if (firstFolder?.id) {
                if (mailbox?.status === '2') {
                    // 如果url中指定的邮箱数据就是正在同步邮件的话，不做任何处理，到leftPanel组件中做定时处理
                    dispatch(setFoundSyncingMailbox(true))
                }
                if (abortControllerRef.current?.abort) {
                    abortControllerRef.current.abort();
                }
                // 创建新的 AbortController
                abortControllerRef.current = new AbortController();

                // await dispatch(resetMailMessageList())
                const res = await dispatch(getMailMessages({
                    data: {
                        email: firstFolder.email,
                        folderName: firstFolder.realName,
                        pageNum: 1,
                        pageSize: 20,
                    },
                    abortController: abortControllerRef.current
                }))
                const resData = res.payload.data
                // console.log('getMailMessages2 ========', res)
                if (resData?.rows?.length > 0) {
                    const rows = resData.rows
                    // console.log('----------rows----------', rows)
                    dispatch(setChooseMailMessage(rows[0]))
                    shallowUpdateRouterParams(`fid=${firstFolder.id}&eid=${rows[0].id}`)
                    // 设置邮件为已读
                    await dispatch(setMailMessage({
                        messageId: rows[0].id
                    }))
                } else {
                    shallowUpdateRouterParams(`fid=${firstFolder.id}`)
                }
            }

        }else{
            shallowUpdateRouterParams(``)
        }
    }

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

    return <div className={'overflow-hidden h-[100vh]'}>
        <div className={'flex flex-row h-full'}>
            <div
                className={classNames({
                    'flex-col': true,
                    'w-0 hidden': !showSidebar,
                    'w-[260px] border-r border-[#e5e5e5] dark:border-[#474747]': showSidebar
                })}>
                <LeftPanel/>
                {/*<UserHeader userInfo={props.userInfo}/>*/}
            </div>
            <div className={'hidden md:block shrink-0 w-[300px] border-r border-[#ddd] dark:border-[#474747]'}>
                <MailMessageList/>
            </div>
            <div className={classNames({
                'bg-white dark:bg-[#141414] shirk-0': true,
                'w-screen': isMobile,
                'w-[calc(100vw-300px)]': isMdScreen || (isXlScreen && !showSidebar),
                'w-[calc(100vw-620px)]': isXlScreen && showSidebar
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