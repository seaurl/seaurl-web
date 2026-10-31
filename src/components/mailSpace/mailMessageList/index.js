'use client'
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch, useSelector} from "react-redux";
import {FilterOutlined, LoadingOutlined, MenuFoldOutlined, MenuOutlined, SyncOutlined} from "@ant-design/icons";
import {
    getMailMessages, resetMailMessageList, startResyncMail, reSyncMail,
    setChooseMailMessage, setMailMessage, setMailProvider,
    setOpenMailMessageListDrawer,
    setOpenSidebarDrawer, setResyncMail,
    setShowSidebar
} from '@/lib/slices/mailSpaceSlice'
import {Avatar, message, Tooltip} from "antd";
import dayjs from "dayjs";
import Loading from "@/components/loading";
import {Virtuoso} from "react-virtuoso";
import Empty from "@/components/empty";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import classNames from "classnames/bind";

const MailMessageList = (props) => {
    const {data: session} = useSession()
    const router = useRouter();
    const dispatch = useDispatch()
    const {platFormTheme, isMobile, isMdScreen} = useSelector(state => state.system)
    const {
        mailProviders,
        showSidebar,
        openSidebarDrawer,
        mailMessageList,
        isFinished,
        showLoading,
        hasMore,
        pagination
    } = useSelector(state => state.mailSpace)
    const virtuoso = useRef(null);
    const query = useSearchParams()
    const abortControllerRef = useRef(null)


    useEffect(() => {
        return () => {
            if (abortControllerRef.current?.abort) {
                abortControllerRef.current.abort();
            }
        }
    }, [])

    function renderIcon() {
        if (isMdScreen || isMobile) {
            return !openSidebarDrawer ? <MenuOutlined/> : <MenuFoldOutlined/>
        } else {
            return !showSidebar ? <MenuOutlined/> : <MenuFoldOutlined/>
        }
    }

    const loadMore = useCallback(() => {
        console.log('========== load more ===========')
        console.log('========== isFinished ===========', isFinished)
        const fid = query.get('fid')
        const eid = query.get('eid')
        const isUnread = query.get('isUnread')
        console.log('========== fid ===========', fid)
        console.log('========== eid ===========', eid)
        console.log('========== isUnread ===========', isUnread)

        if (!isFinished && fid && eid) {
            let mailMessage = null
            mailProviders.forEach(provider => {
                const fs = provider.mailFolderList?.filter(f => f.id === fid)
                if (fs?.length > 0) {
                    mailMessage = fs[0]
                }
            })
            let params = {
                email: mailMessage.email,
                folderName: mailMessage.realName,
                pageNum: pagination.pageNum + 1,
                pageSize: 20
            }
            if (isUnread && isUnread === 'y') {
                params.isUnread = isUnread === 'y'
            }

            if (abortControllerRef.current?.abort) {
                abortControllerRef.current.abort();
            }
            // 创建新的 AbortController
            abortControllerRef.current = new AbortController();

            dispatch(getMailMessages({
                data: params,
                abortController: abortControllerRef.current
            }))
        }

    }, [pagination, query])

    function replaceHtml(d) {
        return d.replaceAll("&nbsp;", " ")
            .replaceAll("&lt;", "<")
            .replaceAll("&gt;", ">")
            .replaceAll("&amp;", "&")
            .replaceAll("&quot;", "\"")
            .replaceAll("&apos;", "'");
    }

    function removeHtmlTags(html) {
        // 创建一个临时的DOM元素
        var tempElement = document.createElement("div");
        // 设置其innerHTML为富文本内容
        tempElement.innerHTML = html;

        // 使用textContent或innerText获取纯文本内容
        return replaceHtml(tempElement.textContent) || replaceHtml(tempElement.innerText) || "";
    }

    /**
     * Extracts pure text content from an HTML string, removing <script>, <style>, and all HTML tags.
     * @param {string} htmlString - The input HTML string.
     * @returns {string} - The extracted text content.
     */
    function extractTextContent(htmlString) {
        if (typeof htmlString !== "string") {
            throw new Error("Input must be a string");
        }

        // Step 1: Remove <script> and <style> tags and their content
        const cleanedHtml = htmlString
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // Remove <script> tags and their content
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");  // Remove <style> tags and their content

        // Step 2: Remove all remaining HTML tags
        const textContent = cleanedHtml.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags

        // Step 3: Trim and return pure text content
        return textContent.trim();
    }

    function getTitle(item) {
        // console.log('-------getTitle------',item)
        const fid = query.get("fid")
        if (item.from.length > 0){
            let title = item.from[0].personal || item.from[0].email
            if (fid) {
                mailProviders.forEach(provider => {
                    const fs = provider.mailFolderList.filter((folder) => folder.id === fid)
                    if (fs && fs.length > 0) {
                        if (fs[0].name === '已发送') {
                            title = item.recipients[0].personal || item.recipients[0].email
                        }
                    }
                })
            }
            return title
        }
        return ''
    }

    const renderMessages = useMemo(() => {
        return <Virtuoso
            ref={virtuoso}
            data={mailMessageList}
            endReached={loadMore}
            increaseViewportBy={200}
            context={{showLoading, isFinished}}
            itemContent={(index, item) => {
                return <div className={classNames({
                    'flex items-center py-2 px-2 gap-2 cursor-pointer ': true,
                    'bg-[#d4cef1] dark:bg-[#1c2126]': query.get('eid') === item.id
                })} onClick={async () => {
                    if (query.get('fid')) {
                        shallowUpdateRouterParams(`fid=${query.get('fid')}&eid=${item.id}`)
                    }
                    dispatch(setChooseMailMessage(item))

                    // 设置邮件为已读
                    await dispatch(setMailMessage({
                        messageId: item.id,
                    }))
                }}>
                    <div className={classNames({
                        'w-[8px] h-[8px] rounded-full flex-shrink-0': true,
                        'bg-transparent': !item.isUnread,
                        'bg-[#54458a]': item.isUnread
                    })}></div>
                    <div className={'flex flex-col w-full '}>
                        <div className={'flex items-center justify-between line-clamp-1'}>
                            <span className={'text-sm font-bold'}>{getTitle(item)}</span>
                            <span className={'text-xs'}>{dayjs(dayjs.utc(item.receivedDate).local()).fromNow()}</span>
                        </div>
                        <div className={'text-xs line-clamp-1'}>{item.subject}</div>
                        <div
                            className={'text-xs line-clamp-2 text-[#808080] break-words break-all'}> {extractTextContent(item.content)}</div>
                    </div>
                </div>
            }}
            components={{
                Footer: ({context: {showLoading, isFinished}}) => {
                    return <div className={'flex items-center justify-center w-full'}>
                        {!isFinished && showLoading ? <Loading/> : null}
                    </div>
                }
            }}
        />
    }, [showLoading, isFinished, query, mailMessageList])

    function getSyncLoading() {
        let isSyncing = false
        mailProviders.forEach(provider => {
            const fs = provider.mailFolderList.filter((folder) => provider.status === '2')
            if (fs && fs.length > 0) {
                isSyncing = true
            }
        })
        return isSyncing
    }


    function renderAll() {
        // if (showLoading && pagination.pageNum === 1) {
        //     return <div className={'flex items-center justify-center w-full'}>
        //         <Loading/>
        //     </div>
        // } else if (mailMessageList.length === 0) {
        //     return <Empty/>
        // } else {
        //     return renderMessages()
        // }
        if (!showLoading && mailMessageList.length === 0) {
            return <Empty />
        }else{
            return renderMessages
        }
    }

    return <div className={'flex flex-col'}>
        <div className={'w-full flex items-center justify-between gap-1 py-1 px-2 text-sm font-medium'}>
            <div className={'flex items-center '}>
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
                {
                    getSyncLoading() ? <div className={'flex items-center gap-2'}>
                        <span className={'text-sm'}>正在检查邮件...</span>
                        {/*<LoadingOutlined style={{fontSize: 16}} spin/>*/}
                    </div> : null
                }
            </div>

            <div className={'flex items-center gap-1'}>
                <Tooltip title="同步邮件" placement={'bottom'}>
                    <div
                        className={'flex items-center justify-center cursor-pointer hover:bg-[#eee] dark:hover:bg-[#2E333C] w-[36px] h-[36px] rounded-full'}
                        onClick={async () => {
                            const fid = query.get('fid')
                            const eid = query.get('eid')

                            let mailFolder = null
                            let mailProvider = null
                            mailProviders.forEach(provider => {
                                const fs = provider.mailFolderList?.filter(f => f.id === fid)
                                if (fs?.length > 0) {
                                    mailFolder = fs[0]
                                    mailProvider = provider
                                }
                            })
                            console.log('-=-=-=-=-=mailFolder-=-=-=-=-=-', mailFolder)
                            console.log('-=-=-=-=-=mailProvider-=-=-=-=-=-', mailProvider)
                            if (mailFolder) {
                                const fs = mailProviders.filter(f => f.email === mailFolder.email && f.status === '2')
                                if (fs.length > 0) {
                                    // 只要有一个正在同步，就不能再点击同步
                                    message.info("正在同步邮件，请稍候！")
                                } else {
                                    if (showLoading) {
                                        message.info("正在加载，请稍候！")
                                        return
                                    }
                                    const res = await dispatch(reSyncMail({
                                        email: mailFolder.email || '',
                                    }))
                                    if (res.payload.status === 0 && res.payload.data) {
                                        // 重置相关状态
                                        await dispatch(startResyncMail())
                                        // 如果设置重新同步邮件操作之后，还要同步前端里面的mailBox status=2
                                        // dispatch(setMailProvider({
                                        //     id: mailProvider.id
                                        // }))
                                    } else {
                                        // 定时轮询是否同步邮件完成
                                        // dispatch(setResyncMail(false))
                                    }
                                }
                            } else {
                                message.info("未查询到指定邮件")
                            }
                        }}>
                        <SyncOutlined className={'cursor-pointer'} spin={getSyncLoading()}/>
                    </div>
                </Tooltip>
                <Tooltip title="过滤已读邮件" placement={'bottom'}>
                    <div
                        className={classNames({
                            'flex items-center justify-center cursor-pointer hover:bg-[#eee] dark:hover:bg-[#2E333C] w-[36px] h-[36px] rounded-full': true,
                            'bg-[#eee]': query.get('isUnread') === 'y'
                        })}
                        onClick={async () => {
                            const fid = query.get('fid')
                            const eid = query.get('eid')
                            const isUnread = query.get('isUnread')

                            // 注意：已读只在点击过滤按钮和滚动加载时传递isRead参数，其它，如刷新页面不用
                            if (fid) {
                                let mailFolder = null
                                let mailProvider = null

                                mailProviders.forEach(provider => {
                                    const fs = provider.mailFolderList?.filter(f => f.id === fid)
                                    if (fs?.length > 0) {
                                        mailFolder = fs[0]
                                        mailProvider = provider
                                    }
                                })
                                console.log('-=-=-=-=-=mailFolder-=-=-=-=-=-', mailFolder)
                                console.log('-=-=-=-=-=mailProvider-=-=-=-=-=-', mailProvider)
                                if (mailFolder) {
                                    const fs = mailProviders.filter(f => f.email === mailFolder.email && f.status === '2')
                                    if (fs.length > 0) {
                                        // 只要有一个正在同步，就不能再点击同步
                                        message.info("正在同步邮件，请稍候！")
                                    } else {
                                        if (showLoading) {
                                            message.info("正在加载，请稍候！")
                                            return
                                        }
                                        if (isUnread) {
                                            shallowUpdateRouterParams(`fid=${fid}`)
                                        } else {
                                            shallowUpdateRouterParams(`fid=${fid}&isUnread=y`)
                                        }

                                        await dispatch(resetMailMessageList())


                                        if (abortControllerRef.current?.abort) {
                                            abortControllerRef.current.abort();
                                        }
                                        // 创建新的 AbortController
                                        abortControllerRef.current = new AbortController();

                                        // 此时：同步状态，0：未同步，1：同步完成，,-1：同步失败
                                        const res2 = await dispatch(getMailMessages({
                                            data: {
                                                email: mailFolder.email,
                                                folderName: mailFolder.realName,
                                                isUnread: !isUnread,
                                                pageNum: 1,
                                                pageSize: 20,
                                            },
                                            abortController: abortControllerRef.current
                                        }))
                                        const resData2 = res2.payload.data
                                        console.log('-=-=-=-=-=resData2-=-=-=-=-=-', resData2)
                                        if (resData2?.rows?.length > 0) {
                                            dispatch(setChooseMailMessage(resData2?.rows[0]))
                                            if (isUnread) {
                                                shallowUpdateRouterParams(`fid=${fid}&eid=${resData2?.rows[0].id}`)
                                            } else {
                                                shallowUpdateRouterParams(`fid=${fid}&eid=${resData2?.rows[0].id}&isUnread=y`)
                                            }
                                            // 设置邮件为已读
                                            await dispatch(setMailMessage({
                                                messageId: resData2?.rows[0].id
                                            }))
                                        }
                                    }
                                } else {
                                    message.info("未查询到指定邮件")
                                }
                            }
                        }}>
                        <FilterOutlined className={'cursor-pointer'}/>
                    </div>
                </Tooltip>
            </div>

            {/*全部标记已读*/}
        </div>
        <div className={'flex flex-col overflow-y-auto h-[calc(100vh-50px)]'}>
            {renderAll()}
        </div>
    </div>
};

export default withRouter(MailMessageList);
