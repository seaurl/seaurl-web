'use client'
import React, {useEffect, useRef, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch, useSelector} from "react-redux";
import {
    DoubleRightOutlined,
    FlagOutlined,
    MenuOutlined,
    PlusOutlined,
    RightCircleOutlined,
    UserOutlined
} from "@ant-design/icons";
import {
    deleteMessage, getMailMessages, setChooseMailMessage, setMailMessage,
    setOpenMailMessageListDrawer,
    setOpenSidebarDrawer,
    setShowSidebar
} from '@/lib/slices/mailSpaceSlice'
import IconFont from "@/utils/iconFont";
import {Avatar, Button, Drawer, List, message, Modal, Tag, Tooltip} from "antd";
import dayjs from "dayjs";
import Empty from "@/components/empty";
import MailMessage from "@/components/mailSpace/mailMessage";
import {deleteNoteCategory, queryNoteCategory} from "@/lib/slices/noteSpaceSlice";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import MailLetterDlg from "@/components/dialog/mailLetterDlg";

const {confirm} = Modal;

const MailEditor = (props) => {
    const {data: session} = useSession()
    const router = useRouter();
    const dispatch = useDispatch()
    const query = useSearchParams()
    const abortControllerRef = useRef(null)
    const [mailLetterDlg, setMailLetterDlg] = useState(null)
    const [openDrawer, setOpenDrawer] = useState(false)
    const [drawerMailList, setDrawerMailList] = useState([])
    const [color, setColor] = useState('')
    const {
        showSidebar,
        openSidebarDrawer,
        openMailMessageListDrawer,
        chooseMailMessage
    } = useSelector(state => state.mailSpace)

    useEffect(() => {

    }, [])

    function onReply() {
        setMailLetterDlg({
            title: '回复',
            show: true,
            action: 'reply',
            data: chooseMailMessage
        })
    }

    function onReplyAll() {
        setMailLetterDlg({
            title: '回复所有',
            show: true,
            action: 'replyAll',
            data: chooseMailMessage
        })
    }

    function onForward() {
        setMailLetterDlg({
            title: '转发',
            show: true,
            action: 'forward',
            data: chooseMailMessage
        })
    }

    function onDelete() {
        confirm({
            title: `您确定要删除该邮件？`,
            okText: '确定',
            cancelText: '取消',
            onOk: async () => {
                if (chooseMailMessage.id) {
                    const res = await dispatch(deleteMessage(chooseMailMessage.id))
                    if (res.payload.status === 0 && res.payload.data) {
                        if (abortControllerRef.current?.abort) {
                            abortControllerRef.current.abort();
                        }
                        // 创建新的 AbortController
                        abortControllerRef.current = new AbortController();

                        // await dispatch(resetMailMessageList())
                        const res = await dispatch(getMailMessages({
                            data: {
                                email: chooseMailMessage.email,
                                folderName: chooseMailMessage.folderName,
                                pageNum: 1,
                                pageSize: 20,
                            },
                            abortController: abortControllerRef.current
                        }))
                        const resData = res.payload.data
                        if (resData) {
                            const rows = resData.rows
                            if (rows?.length > 0) {
                                console.log('----------rows----------', rows)
                                dispatch(setChooseMailMessage(rows[0]))
                                shallowUpdateRouterParams(`fid=${query.get('fid')}&eid=${rows[0].id}`)
                                // 设置邮件为已读
                                await dispatch(setMailMessage({
                                    messageId: rows[0].id
                                }))
                            }
                        } else {
                            shallowUpdateRouterParams(`fid=${query.get('fid')}`)
                        }
                    }
                } else {

                }

            }
        });
    }

    function onSendClose() {
        setMailLetterDlg({
            show: false
        })
    }

    function onSendSuccess() {
        setMailLetterDlg({
            show: false
        })
    }

    function onClose() {
        setOpenDrawer(false)
    }

    function renderMailList(mailList, color) {
        if (mailList.length > 3) {
            return mailList.slice(0, 3).map((item, index) => {
                return <Tag color={color} key={index}>{item.personal?<Tooltip title={item.email}>{item.personal}</Tooltip>:item.email}</Tag>
            })
        } else {
            return mailList.map((item, index) => {
                return <Tag color={color} key={index}>{item.personal?<Tooltip title={item.email}>{item.personal}</Tooltip>:item.email}</Tag>
            })
        }

    }

    return <div className={'flex flex-col h-screen overflow-y-auto'}>
        <div
            className={'flex md:hidden items-center justify-center hover:bg-[#eee] dark:hover:bg-[#2E333C] shrink-0 w-[36px] h-[36px] rounded-full cursor-pointer'}
            onClick={() => {
                dispatch(setOpenMailMessageListDrawer(!openMailMessageListDrawer))
            }}>
            <MenuOutlined/>
        </div>
        {
            chooseMailMessage && query.get('eid') ? <div className={'flex flex-col'}>
                <div className={'flex items-center justify-center '}>
                    <div className={'flex items-center text-md gap-10 p-3'}>
                        <Tooltip title="回复" placement={'bottom'}>
                            <IconFont type="icon-undo" className={'cursor-pointer'} onClick={onReply}/>
                        </Tooltip>
                        <Tooltip title="回复所有" placement={'bottom'}>
                            <IconFont type="icon-reply" className={'cursor-pointer'} onClick={onReplyAll}/>
                        </Tooltip>
                        <Tooltip title="转发" placement={'bottom'}>
                            <IconFont type="icon-redo" className={'cursor-pointer'} onClick={onForward}/>
                        </Tooltip>
                        {/*<Tooltip title="标记" placement={'bottom'}>*/}
                        {/*    <FlagOutlined className={'cursor-pointer'}/>*/}
                        {/*</Tooltip>*/}
                        <Tooltip title="删除" placement={'bottom'}>
                            <IconFont type="icon-delete" className={'cursor-pointer'} onClick={onDelete}/>
                        </Tooltip>
                    </div>
                </div>
                <div className={'flex items-start px-4 gap-3 pb-2'}>
                    <div className={'shrink-0'}>
                        <Avatar icon={['Sent Messages', '已发送'].includes(chooseMailMessage.folderName) ?
                            <UserOutlined/> : null}>
                            {chooseMailMessage?.from[0]?.personal ? chooseMailMessage?.from[0]?.personal?.trim().slice(0, 1)
                                : chooseMailMessage?.from[0]?.email?.slice(0, 1)}
                        </Avatar>
                    </div>
                    <div className={'flex flex-col w-full gap-1'}>
                        <div className={'truncate flex items-center justify-between w-full'}>
                            <span className={'text-sm font-bold'}>{chooseMailMessage?.from[0]?.personal
                                || chooseMailMessage?.from[0]?.email}</span>
                            <span
                                className={'text-xs'}>{dayjs(dayjs.utc(chooseMailMessage?.receivedDate).local()).fromNow()}</span>
                        </div>
                        <div className={'text-xs'}>{chooseMailMessage?.subject}</div>
                        <div className={'flex flex-col'}>
                            <div className={'text-xs pb-1'}>
                                <div className={' pb-1'}>
                                    收件人：
                                </div>
                                <div
                                    className={'inline-flex flex-wrap gap-1'}>{renderMailList(chooseMailMessage?.recipients, 'blue')}
                                    {
                                        chooseMailMessage?.recipients.length > 3 ?
                                            <div className={'flex items-center gap-0.5 text-[#000] cursor-pointer font-medium'} onClick={() => {
                                                setOpenDrawer(true)
                                                setDrawerMailList(chooseMailMessage?.recipients.slice(3))
                                                setColor('blue')
                                            }}>+另外{chooseMailMessage?.recipients.length - 3}人</div> : null}
                                </div>
                            </div>
                            {
                                chooseMailMessage?.ccRecipients?.length > 0 ?
                                    <div className={'text-xs'}>
                                        <div className={' pb-1'}>
                                            抄送人：
                                        </div>
                                        <div
                                            className={'inline-flex flex-wrap gap-1'}>{renderMailList(chooseMailMessage?.ccRecipients, 'purple')}
                                            {
                                                chooseMailMessage?.ccRecipients.length > 3 ? <div className={'flex items-center gap-0.5 text-[#000] cursor-pointer font-medium'} onClick={() => {
                                                    setOpenDrawer(true)
                                                    setDrawerMailList(chooseMailMessage?.ccRecipients.slice(3))
                                                    setColor('purple')
                                                }}>+另外{chooseMailMessage?.ccRecipients.length - 3}人</div> : null
                                            }
                                        </div>
                                    </div> : null
                            }
                        </div>
                    </div>
                </div>
                <div className={'break-all break-words'}>
                    {chooseMailMessage?.content ? <div className={'break-all break-words shrink-0 h-full'}>
                        <MailMessage/>
                        {/*<iframe*/}
                        {/*    srcDoc={`<!DOCTYPE html><html><head>*/}
                        {/*  <style>*/}
                        {/*  body{*/}
                        {/*      margin: 0;*/}
                        {/*      padding: 0 12px;*/}
                        {/*  }*/}
                        {/*    pre {*/}
                        {/*      white-space: break-spaces;*/}
                        {/*      padding: 12px !important;*/}
                        {/*    }*/}
                        {/*  </style>*/}
                        {/*</head><body>${chooseMailMessage.content}</body></html>`}*/}
                        {/*    style={{width: "100%", height: "100%", border: "none"}}*/}
                        {/*    sandbox="allow-same-origin"*/}
                        {/*/>*/}
                    </div> : null}
                </div>
            </div> : <Empty/>
        }
        <MailLetterDlg dlg={mailLetterDlg} onClose={onSendClose} onSuccess={onSendSuccess}/>
        <Drawer title={color==='blue'?'收件人列表':'抄送人列表'} styles={{
            body: {
                padding: '0',
            },
        }} onClose={onClose} open={openDrawer}>
            <div className={'flex flex-col gap-2'}>
                <List
                    bordered={false}
                    dataSource={drawerMailList}
                    renderItem={(item) => (
                        <List.Item>
                            <div className={'px-3 flex items-center gap-2'}>{item.personal?<div className={'font-medium'}>{item.personal}</div>:null}<Tag color={color}>{item.email}</Tag></div>
                        </List.Item>
                    )}
                />
            </div>
        </Drawer>
    </div>
};

export default withRouter(MailEditor);