'use client'
import {Avatar, Button, Input, message, Space, Tooltip} from 'antd';
import {CopyOutlined, EditOutlined, FormOutlined, LoadingOutlined, ReloadOutlined} from '@ant-design/icons';
import {useDispatch, useSelector} from "react-redux";
import {useRouter, useSearchParams} from "next/navigation";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import InfiniteScroll from 'react-infinite-scroll-component';
import Loading from "@/components/loading";
import ChatNote from "@/components/aihub/chatAiSpace/chatNote";
import {
    addMessage,
    concatMessageInChatList,
    concatMessageInChatListForAi,
    createNewChatAi,
    deleteMessageById,
    deleteMessageInChatListForAi,
    queryMessageList,
    removeUnSavedBotMessage
} from '@/lib/slices/chatAiSpaceSlice'
import NoteCreateForAiDlg from "@/components/dialog/noteCreateForAiDlg";
import {queryUserAiTools, updateDt} from '@/lib/slices/aiSpaceSlice'

import {marked} from 'marked';
import {useSession} from "next-auth/react";
import classNames from "classnames/bind";
import MarkdownMessage from "@/components/aihub/chatAiSpace/chatList/markdownMessage";

const {TextArea} = Input;

const ChatList = (props) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const query = useSearchParams()
    const {data: session} = useSession()
    // const [isUpdate, setUpdate] = useState(false)
    let isUpdate = useRef(false)

    const {chatAiList} = useSelector(state => state.chatAiSpace)

    // 注意：chooseUserAiTool变了，但是init获取的不是最新的，所以我从父组件传递过来一个新属性chatAi作为判断标准
    // const {chooseUserAiTool} = useSelector(state => state.aiSpace)

    const {platFormTheme} = useSelector(state => state.system)

    const dom = useRef(null)

    const [chatVal, setChatVal] = useState('')
    const [end, setEnd] = useState('')
    const [isStop, setStop] = useState(true)
    const abortControllerRef = useRef(null)
    const [dlg, setDlg] = useState({
        title: '',
        show: false
    })
    const isFirst = useRef(1)

    useEffect(() => {
        // 设置终止信号
        // setAbortController(controller)
        abortControllerRef.current = new AbortController()
        return () => {
            isFirst.current = 1
            isUpdate.current = false
            console.log('isFirst.current2=', isFirst.current)
            // dispatch(reset())
            // 跳转页面时，压根没有中止
            if (abortControllerRef.current?.abort) {
                abortControllerRef.current.abort()
                setStop(true)
                setEnd('')
                // const t = parseInt(Date.now() + "") + Math.floor(Math.random() * 10000000)
                console.log('-----------abortControllerRef---------中止请求----------------', query.get('usedId'))
                // setEnd('')
                // 删除bot-message 中id为空的数据，因为你都中止了，要不要无所谓，为了防止前端报错这里就删除
                dispatch(removeUnSavedBotMessage())
            }
        }
    }, [])


    // 注意：这里为什么监听usedId的变化来触发初始化？
    // 如果使用默认数组：[],因为使用的是同一个组件，A聊天切换到B聊天不会再触发此useEffect，所以监听usedId
    useEffect(() => {
        if (isFirst.current === 1) {
            console.log('--- 防止重复调用日志 ---', props.chatAi)
            // 防止重复调用
            isFirst.current = 2
            init()
        }
    }, [query.get('usedId')])

    useEffect(() => {
        // 监听ai生成是否结束，如果结束则保存到数据库中
        if (end) {
            // 这里要置空处理，否则会一直进来导致重复提交
            setEnd('')
            saveBotMessage()
        }
    }, [end, chatAiList])

    async function init() {

        //创建新的聊天
        await dispatch(createNewChatAi(query.get('usedId')))
        // 判断列表中是否已存在ai聊天
        const fs = chatAiList.filter(f => f.usedId === query.get('usedId'))
        if (fs.length > 0) {
            // 如果存在，则显示该ai的聊天记录
            const chatMessageList = fs[0].chatMessageList
            // 如果发布最后一条是user的，那就要重新生成消息
            if (chatMessageList.length > 0 && chatMessageList[chatMessageList.length - 1].role === 'user') {
                //重新生成ai消息
                getMessageByAi()
            }
        } else {
            // 查询聊天列表
            const res = await dispatch(queryMessageList({
                aiToolId: props.chatAi._id,
                usedId: query.get('usedId'),
                pageSize: 10,
                pageNum: 1
            }))
            // console.log('--- init res.payload.data ---1', JSON.parse(JSON.stringify(res.payload.data)))
            // 如果发现第一次进来 ，最后一条数据是user的，说明bot没有生成，那么我们就自动生成
            const rows = res?.payload?.data?.rows?.slice()
            if (res?.payload?.status === 0 && rows?.length > 0) {
                const reverseRows = rows.toReversed()
                if (reverseRows[reverseRows.length - 1].role === 'user') {
                    //重新生成ai消息
                    getMessageByAi()
                }
            }
        }
    }

    function saveBotMessage() {
        chatAiList.forEach(item => {
            if (item.usedId === query.get('usedId')) {

                const latestMessage1 = item.chatMessageList[item.chatMessageList.length - 1]
                const latestMessage2 = item.chatMessageList[item.chatMessageList.length - 2]
                console.log('latestMessage1-', latestMessage1)
                console.log('latestMessage2-', latestMessage2)

                // 先判断规则是不是[user,bot]并且bot的id是空的，说明没上传，上传的bot是设置了id，通过判断这个id来证明是否要保存到后台
                if (latestMessage1 && latestMessage1.role === 'bot'
                    && latestMessage2 && latestMessage2.role === 'user'
                    && !latestMessage1.id) {
                    // 把ai生成的数据保存到后台(注意，已经保存过的，不需要)
                    dispatch(addMessage({
                        ...latestMessage1
                    }))
                }
            }
        })
    }

    function globalUpdate() {
        if (!isUpdate.current) {
            const usedId = query.get('usedId')
            if (usedId) {
                // 更新时间并置顶
                dispatch(updateDt({
                    usedId
                }))
                dispatch(queryUserAiTools())
            }
            isUpdate.current = true
        }
    }

    function gotoBottom() {
        if (dom) {
            // const eleDom = document.getElementById('scrollableDiv');
            if (dom.current) {
                dom.current.scrollTop = dom.current.scrollHeight;
            }
        }
    }

    const queryList = async () => {
        const fs = chatAiList.filter(f => f.usedId === query.get('usedId'))

        dispatch(queryMessageList({
            aiToolId: props.chatAi._id,
            usedId: query.get('usedId'),
            pageSize: fs[0].pagination.pageSize,
            pageNum: fs[0].pagination.pageNum + 1
        }));
    }

    async function getMessageByAi() {
        setStop(false)
        let reader;

        // 默认是文本框中的消息
        // let message = chatVal
        //
        // if (myChatVal) {
        //     message = myChatVal
        // }
        // 添加数据到前端面板
        await dispatch(concatMessageInChatList({
            messageList: [{
                aiToolId: props.chatAi._id,
                type: props.chatAi.type,
                role: 'bot',
                message: '',
                reasonMessage: ''
            }]
        }))


        // 每次中止的时候，signal会变成abort，所以想再次发起请求，必须创建新的abortControllerRef
        const signal = abortControllerRef.current.signal

        // 使用fetch API请求数据流
        fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/crud/chatAi/pull`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token-id': `${session?.accessToken}`
                },
                body: JSON.stringify({
                    aiToolId: props.chatAi._id
                }),
                // 添加这一行才能携带cookie给后台
                credentials: 'include',
                // 将signal传递给fetch请求
                signal: signal
            }
        ).then((response) => {
            console.log('--- AI生成数据： response ---', response)
            const decoder = new TextDecoder()
            reader = response.body.getReader()
            return reader.read().then(function processText({done, value}) {
                // 当数据流结束时，done会被设置为true
                if (done) {
                    console.log('--- AI生成数据： 结束 ---', done)
                    setStop(true)
                    setEnd(parseInt(Date.now() + "") + Math.floor(Math.random() * 10000000))
                    return
                }
                if (abortControllerRef.current.signal.aborted) {
                    console.log('--- AI生成数据： 已终止 ---', abortControllerRef.current.signal.aborted)
                    return; // 如果请求被中止，直接返回
                }
                try {
                    // console.log('ai response value=', value)
                    // 解码数据并更新状态
                    const messages = decoder.decode(value).split('\n');
                    console.log('--- AI生成数据： messages ---', messages)

                    messages.forEach(async (message) => {
                        if (message) {
                            // console.log('message=', message)
                            if (message.startsWith('data:') || message.startsWith('{"')) {
                                let parseData = ''
                                try {
                                    if (message.startsWith('data:')) {
                                        const repData = message.replace('data:', '')
                                        if (repData) {
                                            parseData = JSON.parse(repData);
                                        }
                                    } else {
                                        parseData = JSON.parse(message)
                                    }
                                } catch (e) {
                                    console.log('报错：', e)
                                }
                                if (parseData) {
                                    console.log('--- AI生成数据： parseData ---', parseData)

                                    const {isEnd, content, reasonContent} = parseData
                                    if (content || reasonContent || !isEnd) {
                                        await dispatch(concatMessageInChatListForAi({
                                            message: content,
                                            reasonMessage: reasonContent
                                        }))
                                    } else {
                                        console.log('获取结束了')
                                    }
                                }
                            }
                        }
                    }, err => {
                        // 终止fetch
                        // abortController.abort()
                        abortControllerRef.current.abort()
                        // 捕获错误
                        setStop(true)
                        message.error("Ai生成出错，请重新尝试");
                    });

                    // 读取并处理下一块数据
                    return reader.read().then(processText);
                } catch (e) {
                    // 终止fetch
                    // abortController.abort()
                    abortControllerRef.current.abort()
                    setStop(true)
                    message.error("Ai生成出错，请重新尝试");
                }
            });
        })
            .catch((error) => {
                setStop(true)
                console.log('Fetch failed', error)
                // setEnd(true)
            });
    }

    async function onCopy(msg) {
        try {
            await navigator.clipboard.writeText(msg)
            message.success("复制成功");
        } catch (error) {
            message.error("复制失败");
        }
    }

    // 回车查询列表
    async function handleKeyDown(e) {
        if (e.keyCode === 13) {
            if (e.shiftKey) {
                // 这里是回车换行
            } else {
                // 否则直接提交表单，并且阻止换行
                e.preventDefault();
                if (!chatVal.replace(/(^\s+)|(\s+$)/g, '')) {
                    setChatVal('')
                    return message.warning('请先输入聊天内容并且不能是空字符')
                }
                if (!isStop) {
                    return message.warning('正在生成聊天，请稍候再试')
                }

                gotoBottom()
                // 清空文本框
                setChatVal('')
                // 合并用户的数据到前端
                await dispatch(concatMessageInChatList({
                    messageList: [{
                        aiToolId: props.chatAi._id,
                        type: props.chatAi.type,
                        role: 'user',
                        message: chatVal.trim(),
                        reasonMessage: ''
                    }]
                }))

                // 保存用户的数据到后台
                await dispatch(addMessage({
                    // chatAiId: query.get('chatAiId'),
                    aiToolId: props.chatAi._id,
                    type: props.chatAi.type,
                    role: 'user',
                    message: chatVal.trim(),
                    reasonMessage: ''
                }))
                // 发送完成之后调用千问api
                getMessageByAi()
            }
        }
    }


    // 重新生成和停止回答
    async function onReStop() {
        // 重新回答
        if (isStop) {
            const currentChat = getCurrentChat()
            if (currentChat) {
                const {chatMessageList, loadingChatList, hasMoreChatList} = currentChat
                // 1、删除后台最后一条bot生成的聊天
                // 2、删除前端最后一条bot生成的聊天
                // 3、重新发送获取bot聊天记录，并显示到前端
                // 4、记录生成后保存到后台
                const botMessage1 = chatMessageList[chatMessageList.length - 1]
                // const botMessage2 = chatMessageList[chatMessageList.length - 2]
                console.log('botMessage1=', botMessage1)
                if (botMessage1 && botMessage1.role === 'bot') {
                    if (botMessage1.id) {
                        // 1、删除后台最后一条bot生成的聊天
                        const res = await dispatch(deleteMessageById({
                            id: botMessage1.id
                        }))
                        console.log('deleteMessageById res =', res)
                        if (res.payload.status === 0 && res.payload.data) {
                            // 2、删除前端最后一条bot生成的聊天
                            await dispatch(deleteMessageInChatListForAi())
                            // 3、重新发送获取bot聊天记录，并显示到前端
                            //创建新的AbortController
                            abortControllerRef.current = new AbortController()
                            getMessageByAi()
                        }
                    }
                }
                if (botMessage1 && botMessage1.role === 'user') {
                    // 3、重新发送获取bot聊天记录，并显示到前端
                    //创建新的AbortController
                    abortControllerRef.current = new AbortController()
                    getMessageByAi()
                }
            }
        }
        // 停止
        else {
            // abort fetch请求
            // abortController.abort()
            abortControllerRef.current.abort()
            setStop(true)
            setEnd(parseInt(Date.now() + "") + Math.floor(Math.random() * 10000000))
        }
    }

    function onReEdit(chat) {
        setChatVal(chat.message)
    }

    function onCreateNote(chat) {
        const currentChat = getCurrentChat()
        if (currentChat) {
            const {chatMessageList, loadingChatList, hasMoreChatList} = currentChat
            // console.log('sssss=',marked.parse(chat.message))
            const fi = chatMessageList.findIndex(item => item.id === chat.id)
            if (chatMessageList[fi - 1]) {
                console.log('f---', chatMessageList[fi - 1])
                setDlg({
                    title: '添加到我的笔记',
                    show: true,
                    input: chatMessageList[fi - 1].message,
                    // 使用marked把markdown格式转换成html格式供ckeditor富文本编辑器使用
                    message: marked.parse(chat.message)
                })
            }
        }
    }

    function getBg(chat) {
        if (platFormTheme?.background === 'light') {
            if (chat.role === 'user') {
                return platFormTheme?.color
            }
            if (chat.role === 'bot') {
                return '#fff'
            }
        } else {
            if (chat.role === 'user') {
                return platFormTheme?.color
            }
            if (chat.role === 'bot') {
                return '#2D3748'
            }
        }
    }

    function getColor(chat) {
        if (platFormTheme?.background === 'light') {
            if (chat.role === 'user') {
                return '#fff'
            }
            if (chat.role === 'bot') {
                return '#333'
            }
        } else {
            if (chat.role === 'user') {
                return '#fff'
            }
            if (chat.role === 'bot') {
                return '#fff'
            }
        }
    }

    const loadingDom = useMemo(() => {
        return <div className={'flex w-full items-center justify-center'}><Loading/></div>
    }, [])

    function getCurrentChat() {
        const fs = chatAiList.filter(f => f.usedId === query.get('usedId'))
        if (fs.length <= 0) {
            return null
        }
        return {
            chatMessageList: fs[0].chatMessageList,
            loadingChatList: fs[0].loadingChatList,
            hasMoreChatList: fs[0].hasMoreChatList
        }
    }

    const renderChatList = useCallback(() => {
        const currentChat = getCurrentChat()
        if (currentChat) {
            const {chatMessageList, loadingChatList, hasMoreChatList} = currentChat
            if (loadingChatList && chatMessageList.length === 0) {
                return loadingDom
            }
            // 如果加载完成之后，列表数为0，则显示默认组件
            if ((!loadingChatList && chatMessageList.length === 0)) {
                return <ChatNote name={props.chatAi.name} desc={props.chatAi.desc}
                                 avatar={props.chatAi.avatar}/>
            }
            return <div className={'overflow-y-auto flex flex-col-reverse h-[100vh]'}
                        style={{overflowAnchor: 'none'}}
                        id="scrollableDiv"
                        ref={dom}>
                {chatMessageList.length > 0 ? <InfiniteScroll
                    //注意：dataLength={remindList.length}要写remindList.length不能写成remindListTotal,切记！
                    dataLength={chatMessageList.length}
                    next={() => {
                        queryList()
                    }}
                    // hasMore控制触发上面的next，这个要注意
                    // 当滚动条滚动到顶部时，loading=true触发next，否则不触发
                    hasMore={hasMoreChatList}
                    loader={loadingDom}
                    style={{
                        display: "flex",
                        flexDirection: "column-reverse",
                        overflowY: 'auto'
                    }}
                    scrollableTarget="scrollableDiv"
                    inverse={true}>
                    <div className={'flex flex-col gap-x-[20px] gap-y-8 pt-[20px] pb-[30px] px-[16px] overflow-hidden'}>
                        {
                            chatMessageList.map(chat => {
                                return <>
                                    <div className={classNames({
                                        "flex items-start flex-col w-full": chat.role === 'bot',
                                        "flex items-end flex-col w-full justify-end": chat.role === 'user'
                                    })}>
                                        <div className={classNames({
                                            "flex items-start gap-[12px]": chat.role === 'bot',
                                            "flex items-center gap-[12px]": chat.role === 'user',
                                            'max-w-[100%] lg:max-w-[60%]': true
                                        })}>
                                            {
                                                chat.role === 'bot' ? <div className={'shrink-0 hidden lg:block '}>
                                                    <Avatar size={36} src={props.chatAi.avatar}
                                                            style={{backgroundColor: '#fff'}}/>
                                                </div> : null
                                            }
                                            <div className={classNames({
                                                'w-full flex flex-col gap-1': chat.role === 'bot',
                                                'flex flex-row items-center gap-2 group': chat.role === 'user'
                                            })}>
                                                {
                                                    chat.role === 'user' ? <div
                                                        className={'text-[#333] dark:text-white invisible group-hover:visible'}>
                                                        <Tooltip title={'编辑消息'}
                                                                 onClick={() => onReEdit(chat)}>
                                                            <EditOutlined
                                                                className={'cursor-pointer pl-[4px] text-[16px]'}/>
                                                        </Tooltip>
                                                    </div> : null
                                                }
                                                {/*<div className={'w-full flex shrink-0 items-center justify-between '}>*/}
                                                {/*    <span*/}
                                                {/*    className={'text-[#333] dark:text-white text-xs pb-[4px]'}>{dayjs(chat.createdDt).format("YYYY-MM-DD HH:mm")}</span>*/}
                                                {/*</div>*/}
                                                <div style={{
                                                    backgroundColor: getBg(chat),
                                                    color: getColor(chat)
                                                }} className={'px-[16px] py-[12px] rounded-xl shadow text-base w-full'}>
                                                    {!chat.message.trim() && !chat.reasonMessage.trim() ?
                                                        <div className={'flex items-center gap-2'}><LoadingOutlined/>正在思考中...
                                                        </div> : null}
                                                    {
                                                        chat.reasonMessage ? <div className={'flex flex-col'}>
                                                            <div
                                                                className={'font-bold text-base dark:text-white'}>思考过程：
                                                            </div>
                                                            <MarkdownMessage isDeepThink={true} content={chat.reasonMessage} />
                                                        </div> : null
                                                    }
                                                    <MarkdownMessage isDeepThink={false} content={chat.message} />
                                                </div>
                                                {
                                                    chat.role === 'bot' ? <div
                                                        className={'w-full items-center justify-end text-[#333] dark:text-white flex'}>
                                                        <Space size={8}>
                                                            <Tooltip title={'复制'}>
                                                                <CopyOutlined
                                                                    className={'cursor-pointer pl-[4px] text-[16px]'}
                                                                    onClick={() => onCopy(chat.message)}/>
                                                            </Tooltip>
                                                            <Tooltip title={'添加到我的笔记'}
                                                                     onClick={() => onCreateNote(chat)}>
                                                                <FormOutlined
                                                                    className={'cursor-pointer pl-[4px] text-[16px]'}/>
                                                            </Tooltip>
                                                        </Space>
                                                    </div> : null
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </>
                            })
                        }
                    </div>
                </InfiniteScroll> : loadingDom}
            </div>
        }
    }, [chatAiList, isStop, query])

    function renderBtn() {
        const currentChat = getCurrentChat()
        if (currentChat) {
            const {chatMessageList, loadingChatList, hasMoreChatList} = currentChat
            return chatMessageList.length > 0 ? <div className={'flex items-center gap-2'}>
                    <Button icon={isStop ? <ReloadOutlined/> :
                        <span className={'inline-block p-[4px] rounded-full align-middle'}>
                                <span className={'w-[10px] h-[10px] bg-white inline-block'}></span></span>}
                            type={'primary'}
                            onClick={onReStop}></Button>
                </div> :
                null
        }
    }

    return <div className={classNames({
        'chatAiList': true,
        'bg-[#f4f4f4] dark:bg-[#141414] w-full h-full pl-0 lg:pl-[16px]': true,
        // 'lg:pl-[296px]': showPanel
    })} onClick={globalUpdate}>
        <div className={'overflow-y-hidden flex flex-col h-screen'}>
            <div className={'h-screen flex flex-col gap-x-[12px] overflow-y-hidden'}>
                {renderChatList()}
            </div>
            <div className={'pt-[30px] pb-[20px flex items-center justify-center relative flex-col'}>


                <div className={'w-[90%] lg:w-[60%] rounded flex items-center gap-2'}>
                    <TextArea value={chatVal}
                              rootClassName={'shadow'}
                              maxLength={5500}
                              size={'large'}
                              placeholder={'请输入聊天内容（Shift + Enter = 换行）'}
                              autoSize={{minRows: 1, maxRows: 7}}
                              variant={'borderless'}
                              style={{backgroundColor: platFormTheme?.background === 'light' ? '#fff' : '#2D3748'}}
                              onKeyDown={handleKeyDown}
                              addonAfter={<div><Button>停止</Button></div>}
                              onChange={(e) => {
                                  setChatVal(e.target.value)
                              }}/>
                    {props.floatBtn ?? props.floatBtn}
                    {renderBtn()}
                    {/*<Button>刷新</Button>*/}
                </div>
                <div
                    className={'pt-[12px] pb-[12px] px-[20px] text-[#999] text-xs'}>服务生成的所有内容均由人工智能模型生成，其生成内容的准确性和完整性无法保证，不代表我们的态度或观点
                </div>
            </div>
        </div>
        <NoteCreateForAiDlg dlg={dlg}/>
    </div>
}

export default ChatList
