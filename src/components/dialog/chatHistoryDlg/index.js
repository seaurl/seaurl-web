'use client'
import {Button, Modal, Input, message, Drawer, DatePicker, Avatar, Space, Tooltip, Select} from 'antd';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useDispatch, useSelector} from "react-redux";
import {useRouter, usePathname, useParams, useSearchParams} from "next/navigation";
import Empty from "@/components/empty";
import {
    CopyOutlined,
    FormOutlined,
    OpenAIOutlined,
    SearchOutlined,
    SyncOutlined,
    UserOutlined
} from "@ant-design/icons";
import Loading from "@/components/loading";
import {Virtuoso} from "react-virtuoso";
import classNames from "classnames/bind";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import dayjs from "dayjs";
import {getMailMessages} from "@/lib/slices/mailSpaceSlice";
import {queryMessageList} from "@/lib/slices/chatAiSpaceSlice";
import MarkdownMessage from "@/components/aihub/chatAiSpace/chatList/markdownMessage";
import {marked} from "marked";
import NoteCreateForAiDlg from "@/components/dialog/noteCreateForAiDlg";
import IconFont from "@/utils/iconFont";

const {RangePicker} = DatePicker;

const ChartAiDlg = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [input, setInput] = useState('')
    const dispatch = useDispatch();
    const router = useRouter();
    const [showLoading, setShowLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [chatList, setChatList] = useState([]);
    const abortControllerRef = useRef(null)
    const virtuoso = useRef(null);
    const [chatVal, setChatVal] = useState('')
    const {platFormTheme} = useSelector(state => state.system)
    const [filter, setFilter] = useState('bot')
    const query = useSearchParams()
    const [total, setTotal] = useState(0)
    const [dlg, setDlg] = useState({
        title: '',
        show: false
    })
    const [pagination, setPagination] = useState({
        pageSize: 10,
        pageNum: 0
    })
    useEffect(() => {
        setChatVal('')
        setFilter('bot')
        setPagination({
            pageSize: 10,
            pageNum: 0
        })
        setIsModalOpen(props.dlg.show)
        if (props.dlg.show) {
            if (virtuoso.current) {
                virtuoso.current.scrollToIndex({
                    index: 0,
                    align: 'start',
                    behavior: 'auto'
                });
            }
            queryChatList()
        }
    }, [props.dlg.show])

    useEffect(() => {
        setFilter('bot')
        return () => {
            if (abortControllerRef.current?.abort) {
                abortControllerRef.current.abort();
            }
        }
    }, [])

    useEffect(() =>{
        setPagination({
            pageSize: 10,
            pageNum: 0
        })
        queryChatList()
    }, [filter])

    async function queryChatList(pageNum = 0) {
        if (props.dlg.aiToolId) {
            setShowLoading(true);
            if (abortControllerRef.current?.abort) {
                abortControllerRef.current.abort();
            }
            // 创建新的 AbortController
            abortControllerRef.current = new AbortController();
            const res = await dispatch(queryMessageList({
                aiToolId: props.dlg.aiToolId,
                usedId: query.get('usedId'),
                message: chatVal.trim(),
                pageSize: pagination.pageSize,
                pageNum: pageNum + 1,
                role: filter,
                abortControllerRef: abortControllerRef.current
            }));
            setShowLoading(false);
            if (res.payload.status === 0) {
                const resData = res.payload.data
                if (resData) {
                    setTotal(resData.total)
                    if (resData.pageNum > 1) {
                        setChatList([
                            ...chatList,
                            ...resData.rows
                        ])
                    } else {
                        setChatList(resData.rows)
                    }
                    const isFinished = resData.rows.length < resData.pageSize
                        || resData.pageNum * resData.pageSize >= resData.total;
                    setIsFinished(isFinished)

                    setPagination({
                        pageSize: resData.pageSize,
                        pageNum: resData.pageNum
                    })
                }
            }
        }

    }


    const handleCancel = () => {
        if (props.close) {
            props.close()
        }
    };

    const loadMore = useCallback(() => {
        if (!isFinished) {
            queryChatList(pagination.pageNum)
        }

    }, [pagination])

    async function onCopy(chat) {
        try {
            await navigator.clipboard.writeText(chat.message)
            message.success("复制成功");
        } catch (error) {
            message.error("复制失败");
        }
    }

    function onCreateNote(chat) {
        console.log('f---', chat)
        if (chat.message) {
            setDlg({
                title: '添加到我的笔记',
                show: true,
                input: '',
                // 使用marked把markdown格式转换成html格式供ckeditor富文本编辑器使用
                message: marked.parse(chat.message)
            })
        }
    }

    function handleKeyDown(e) {
        if (e.keyCode === 13) {
            if (e.shiftKey) {
                // 这里是回车换行
            } else {
                // 否则直接提交表单，并且阻止换行
                e.preventDefault();
                setPagination({
                    pageSize: 10,
                    pageNum: 0
                })
                queryChatList()
            }
        }
    }

    function getFileIcon(file){
        if (file){
            if (file.name?.endsWith('.xlsx') || file.name?.endsWith('.xls')) {
                return <IconFont type={'icon-excel'} className='text-base'/>
            } else if (file.name?.endsWith('.docx')) {
                return <IconFont type={'icon-word'} className='text-base'/>
            } else if (file.name?.endsWith('.pdf')) {
                return <IconFont type={'icon-pdf'} className='text-base'/>
            } else if (file.name?.endsWith('.txt')) {
                return <IconFont type={'icon-txt'} className='text-base'/>
            }
        }
        return <IconFont type={'icon-unknown'} className='text-base'/>
    }

    const renderMessages = useMemo(() => {
        if (pagination.pageNum === 0 && showLoading) {
            return <div className={'flex items-center justify-center'}>
                <Loading/>
            </div>
        }
        if (!showLoading && chatList.length === 0) {
            return <Empty/>
        }
        return <Virtuoso
            ref={virtuoso}
            data={chatList}
            endReached={loadMore}
            increaseViewportBy={200}
            context={{showLoading, isFinished}}
            itemContent={(index, item) => {
                return <div className={'px-4 py-2 flex flex-1 gap-2 w-full'}>
                    {/*<div className={'shrink-0'}>*/}
                    {/*    <Avatar size={36} src={item.role === 'bot' ? props.dlg.botAvatar ||*/}
                    {/*        <OpenAIOutlined/> : props.dlg.userAvatar || <UserOutlined/>}*/}
                    {/*            style={{backgroundColor: '#fff'}}/>*/}
                    {/*</div>*/}
                    <div className={'flex flex-col gap-1 w-full pt-1 leading-[28px] overflow-hidden'}>
                        {
                            item.file ? <div
                                className={'w-fit px-[12px] leading-[28px] flex items-center gap-2 text-sm p-2 bg-[#F0F6FF] dark:bg-[#494f5a] break-all rounded-xl '}>
                                {getFileIcon(item.file)}
                                {item.file.name}
                            </div> : null
                        }
                        <div className={`w-fit rounded-lg px-3 py-4 ${item.role === 'bot' ? 'bg-[#F0F6FF] dark:bg-[#494f5a]' : 'bg-[#FFF9E6] dark:bg-[#4a4530]'}`}>
                            <MarkdownMessage isDeepThink={false} content={item.message}/>
                        </div>
                        <div className={'text-xs text-[#7a7676] flex justify-between pr-2 gap-2'}>
                            {
                                (item.message.trim() && item.role === 'bot') ? <Space size={8}>
                                    <Tooltip title={'复制'}>
                                        <CopyOutlined className={'cursor-pointer text-xs'} onClick={() => onCopy(item)}/>
                                    </Tooltip>
                                    <Tooltip title={'添加到我的笔记'} onClick={() => onCreateNote(item)}>
                                        <FormOutlined className={'cursor-pointer text-xs'}/>
                                    </Tooltip>
                                </Space> : <span/>
                            }
                            {dayjs(item.createdDt).format('YYYY-MM-DD HH:mm')}
                        </div>

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
    }, [showLoading, isFinished, chatList, pagination])

    function renderFilter() {
        return <Select style={{width: '100px'}}
                       value={filter}
                       onChange={(key) => {
                           console.log('key====', key)
                           setFilter(key)
                       }}>
            <Option value="user">
                <Avatar size={28} src={props.dlg.userAvatar || <UserOutlined/>}
                        style={{backgroundColor: '#fff'}}/><span className={'pl-1'}>我</span>
            </Option>
            <Option value="bot">
                <Avatar size={28} src={props.dlg.botAvatar || <OpenAIOutlined/>}
                        style={{backgroundColor: '#fff'}}/><span className={'pl-1'}>AI</span>
            </Option>
        </Select>
    }

    return <div className={''}>
        <Drawer
            title="聊天记录"
            width={600}
            closable={{'aria-label': 'Close Button'}}
            onClose={handleCancel}
            open={isModalOpen}
            styles={{
                body: {
                    padding: '0',
                    height: '100%'
                },
                mask: {
                    backgroundColor: "transparent"  // ✅ 正确设置遮罩颜色
                }
            }}>
            <div className={'flex items-center gap-2 sticky top-0 bg-white z-10 p-2 dark:bg-[#2E333D]'}>
                <Input value={chatVal}
                       // addonAfter={renderFilter()}
                       allowClear
                       style={{backgroundColor: platFormTheme?.background === 'light' ? '#f3f4f5' : '#404045'}}
                       onChange={(e) => {
                           setChatVal(e.target.value)
                       }} prefix={<SearchOutlined/>} placeholder="请输入搜索内容" size={'large'}
                       onKeyDown={handleKeyDown}/>
            </div>
            <div className={'h-[calc(100vh-114px)] bg-[#fff] dark:bg-[#2E333D] '}>
                {renderMessages}
            </div>
        </Drawer>
        <NoteCreateForAiDlg dlg={dlg}/>

    </div>
}

export default ChartAiDlg
