'use client'
import {Input, Row, Col, List, Avatar, Badge, Result, Button, message, Drawer} from 'antd'
import cns from "classnames/bind";
import React, {memo, useCallback, useLayoutEffect, useEffect, useRef, useState} from 'react'
import {
    MessageFilled,
    UserOutlined,
    SoundOutlined,
    BellFilled,
    PlusOutlined,
    UserAddOutlined,
    SettingOutlined,
    BarsOutlined,
    TeamOutlined,
    ReloadOutlined, PicRightOutlined,
} from "@ant-design/icons";
import {useRouter, useParams, useSearchParams, usePathname} from "next/navigation";
import {
    reset,
    getMailboxes,
    setMailboxes,
    getUserInfoByUid,
    setCurrentUserInfo,
    pushMessage,
    getMessages,
    setReadMessage,
    getMyselfInfo,
    clearChatList,
    concatMessageInChatList,
    resetChatListPage,
    setChatListLoading,
    setDataFromServer, pushFirstChatInMailBox
} from '@/lib/slices/notifySlice'
import {isReadNotify} from "@/lib/slices/authSlice";

import {useSelector, useDispatch, useStore} from 'react-redux'
import dayjs from "dayjs";
import Loading from "@/components/loading";
import Empty from '@/components/empty'
import InfiniteScroll from 'react-infinite-scroll-component';
import classNames from "classnames/bind";
import {shallowUpdateRouterParams, routerPush} from '@/utils/routerHelp'
import {withRouter} from "@/hoc/withRouter";

const Chatroom = (serverData) => {
    const store = useStore(); // 获取 Redux store

    const router = useRouter();
    const routerSearchParams = useSearchParams()

    const dispatch = useDispatch();

    // const [isServer, setServer] = useState(true)
    const [open, setOpen] = useState(false);

    const {
        mailboxes,
        currentUserInfo,
        chatList,
        myselfInfo,
        showChatListLoading,
        chatListPage
    } = useSelector(state => state.notify)
    const {platFormTheme} = useSelector(state => state.system)

    const [messageValue, setMessageValue] = useState('')
    const [ws, setWs] = useState(null);

    const dom = useRef(null)
    const isServer = useRef(true)
    useEffect(() => {
        if (isServer.current) {
            isServer.current = false
            const fid = routerSearchParams.get('fid')
            dispatch(reset())
            // 将服务端数据保存到client
            dispatch(setDataFromServer({
                mailboxes: serverData.mailboxes,
                myselfInfo: serverData.myselfInfo
            }))
            if (fid) {
                const filterUser = serverData.mailboxes.filter(item => item.uid === fid)
                console.log('----------filterUser-----------', filterUser)
                if (serverData.mailboxes.length <= 0 || filterUser.length <= 0) {
                    initFirstChat()
                } else {
                    dispatch(setCurrentUserInfo(filterUser[0]))
                }
            }
        }

        // gotoBottom();
        console.log('init web socket', serverData)
        if (!ws) {
            console.log('success init web socket')
            initWebsocket();
        } else {
            console.log('failure init web socket')
        }
        return () => {
            if (ws) {
                console.log('closing websocket')
                ws.close();
                setWs(null)
            }
        }

    }, [])

    async function initFirstChat() {
        const date = dayjs().format("YYYY-MM-DD HH:mm:ss")

        // 如果是第1次聊天，则要推送到mailbox表中
        const res = await dispatch(pushFirstChatInMailBox({
            friendId: serverData.guysInfo.uid,
            uid: serverData.myselfInfo.uid
        }))

        console.log('initFirstChat res = ', res)
        // 注意：这里的res是当前聊天人，也是登录人的mailbox,不是被聊天人的mailbox，不要搞反了
        if (res.payload.status === 0){
            if (res.payload.data){
                const resData = res.payload.data
                //往mailbox新建一条内存记录目的是：如果不发消息，则不会往表里面保存数据，下次进来就没有了。
                dispatch(setMailboxes({
                    avatar: serverData.guysInfo.avatar,
                    createdDt: date,
                    // 只从resData拿dialogId
                    dialogId:resData.dialogId,
                    email: serverData.guysInfo.email,
                    //因为是mailbox列表数据，所以这里的friendId肯定是我，
                    friendId: serverData.myselfInfo.uid,
                    isRead: true,
                    //因为是mailbox列表数据，所以这里的uid肯定是guys，
                    uid: serverData.guysInfo.uid,
                    updatedDt: date,
                    userName: serverData.guysInfo.userName,
                }))
            }
        }
    }

    const getCurrentData = useCallback(async () => {
        if (currentUserInfo?.dialogId) {
            let params = {
                dialogId: currentUserInfo.dialogId,
                pageSize: chatListPage.pageSize,
                pageNum: chatListPage.pageNum
            }
            //用户改变重新获取消息
            await dispatch(getMessages(params))
            if (chatListPage.pageNum === 1) {
                gotoBottom()
            }
        } else {
            dispatch(setChatListLoading(false))
        }
    }, [currentUserInfo, chatListPage])

    useEffect(() => {
        console.log('chatListPage====', chatListPage)
        // 第1次重复渲染问题，因为react18新机制问题，只在开发环境有，生产环境正常
        getCurrentData()

        // 这里的query.fid是聊天方uid
        //如果是query.fid可能一直不变，这时候就触发不了这里的查询了,所以只能使用currentUserInfo
    }, [currentUserInfo])


    function gotoBottom() {
        if (dom) {
            // const eleDom = document.getElementById('scrollableDiv');
            if (dom.current) {
                dom.current.scrollTop = dom.current.scrollHeight;
            }
        }
    }

    function isJSON(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }


    const callMsg = useCallback((msg) => {
        // 由于websocket onmessage使用了闭包，所以只能使用useStore获取最新的currentUserInfo
        const latestState = store.getState();
        const {currentUserInfo} = latestState.notify;

        console.log('callMsg latestState=', currentUserInfo);
        if (msg && isJSON(msg)) {
            console.log('msg=', msg)
            // console.log('chatUserInfo=', currentUserInfo)
            const msgData = JSON.parse(msg)
            if (msgData && msgData.length > 0) {
                dispatch(getMailboxes({
                    userName: myselfInfo.name
                }));
                // await dispatch(isReadNotify());
                // 获取当前对话记录
                // 只有当前对话id=返回来的对话id，才能合并，否则只用查询左面的msgBox即可
                // console.log('--------显示currentUserInfo-------', currentUserInfo)
                if (currentUserInfo && currentUserInfo.dialogId && currentUserInfo.dialogId === msgData[0].dialogId) {
                    console.log('--------连接消息')
                    dispatch(concatMessageInChatList(msgData))
                }
                if (currentUserInfo && !currentUserInfo.dialogId) {
                    console.log('--------连接用户信息')
                    //为什么没有dalogID?
                    // 是因为跟朋友第一次建立对话的时候是没有dialogId的，所以消息回来的时候要补上
                    dispatch(setCurrentUserInfo({...currentUserInfo, ...{dialogId: msgData[0].dialogId}}))
                }
            }
        }
    }, [currentUserInfo])

    function initWebsocket(msg) {
        console.log('----------initWebsocket-------------', myselfInfo)
        // const a = currentUserInfo;
        // 如果没有ws或者状态不是open=1则重新建立连接
        if ((!ws || ws.readyState !== 1) && myselfInfo?.uid) {
            // 创建Socket对象和服务器进行连接
            const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_HOST}/notify/websocket?uid=${myselfInfo.uid}`);
            console.log('socket =', socket)
            setWs(socket);
            // 连接成功监听 当客户端成功连接到服务器时该监听触发
            socket.onopen = function () {
                // ws.send("测试发送");
                console.log('ws open=>', msg);
                // 判断是否有消息，如果有则open时发送，并且清空下msg值
                if (msg) {
                    console.log('正在发送消息...');
                    socket.send(msg)
                    console.log('已发送消息');
                }
            };

            // 消息监听 当服务器向客户端发送信息时触发该监听
            socket.onmessage = (e) => {
                console.log('建立连接等待服务端推送消息：', e.data)
                const msg = e.data;
                // console.log('----onmessage---currentUserInfo',currentUserInfo)
                //注意：onmessage方法中获取不到最新的useState、useRef值,因为onmessage使用了闭包
                callMsg(msg)
            };
            // 当连接关闭时监听触发
            socket.onclose = function (e) {
                console.log('websocket 断开 e= ', e)
                console.log('websocket 断开: ' + e.code + ' ' + e.reason + ' ' + e.wasClean)
            };
        }
    }

    //选中聊天
    async function choosedUser(user) {
        console.log('user =', user)
        setOpen(false)
        shallowUpdateRouterParams(`fid=${user.uid}`)
        await dispatch(clearChatList())
        await dispatch(setCurrentUserInfo(user))
        await dispatch(setReadMessage({
            dialogId: user.dialogId,
            friendId: user.uid,
            uid: myselfInfo.uid,
        }))
        await dispatch(getMailboxes());
        // await dispatch(isReadNotify());
    }

    //发送消息
    async function onEnter(e) {
        console.log('onEnter currentUserInfo=', currentUserInfo)
        console.log('onEnter myselfInfo=', myselfInfo)
        if (myselfInfo?.uid === currentUserInfo?.uid) {
            await dispatch(getMailboxes({
                userName: myselfInfo.name
            }));
            router.replace(`/chatroom`)
            return;
        }
        // 如果是输入法的回车则不做处理
        if (e.nativeEvent.isComposing) {
            return
        }
        // console.log('messageValue=', messageValue.trim())
        if (!messageValue.trim()) {
            message.warning('不能发送空消息！')
            return
        }
        setMessageValue('')
        gotoBottom();
        console.log('ws====', ws)
        const msgObj = JSON.stringify({
            message: messageValue,
            uid: myselfInfo.uid,
            friendId: currentUserInfo.uid
        });
        if (ws) {
            console.log('ws.readyState====', ws.readyState)
        }
        // 0        CONNECTING        连接尚未建立
        // 1        OPEN            WebSocket的链接已经建立
        // 2        CLOSING            连接正在关闭
        // 3        CLOSED            连接已经关闭或不可用
        if (!ws || ws.readyState !== 1) {
            console.log('重新构造ws---')
            initWebsocket(msgObj);
        } else {
            console.log('正在发送消息...')
            ws.send(msgObj)
        }
    }

    function gotoUser(name) {
        // router.push(`/${name}`)
        serverData.routerPush(`/${name}`)
    }


    function getDt(data, index) {
        const date2 = dayjs(data.createdDt)
        if (index === 0) {
            return data.chatDt
        }
        if (index > 0 && index < chatList.length - 1) {

            // const date1 = dayjs(chatList[index - 1].createdDt)
            const date3 = dayjs(chatList[index + 1].createdDt)
            // 这里按1分钟聚合记录，如果每隔1分钟连续发送记录，那么也是不显示时间的，twitter也是这么做的
            if (Math.abs(date3.diff(date2, 'minute', true)) >= 1 || data.uid !== chatList[index + 1].uid) {
                return data.chatDt
            }
        } else if (index === chatList.length - 1) {
            return data.chatDt
        }
        return null
    }

    const renderChatList = useCallback(() => {
        return <div className={'border-r border-[#EFF3F5] border-b dark:border-[#474747]'}>
            <div className={''}>
                <div
                    className={'py-[16px] px-[16px] border-b border-[#EFF3F5] dark:border-[#474747] flex items-center gap-2'}>
                    <div className={'lg:hidden block'}>
                        <Button size={'small'} icon={<PicRightOutlined />} onClick={() => {
                            setOpen(true)
                        }
                        }></Button>
                    </div>
                    {
                        currentUserInfo?.uid ?
                            <span className={'text-xl font-bold'}>与@{currentUserInfo?.userName}的会话</span> :
                            <span className={'text-xl font-bold'}>请选择私信</span>
                    }

                    {/*<ReloadOutlined className={styles.reload}/>*/}
                </div>
                {
                    currentUserInfo?.uid ?
                        <div className={'h-[calc(100vh-169px)] overflow-y-auto flex flex-col-reverse'}
                             style={{overflowAnchor: "none"}} id="scrollableDiv"
                             ref={dom}>
                            <InfiniteScroll
                                //注意：dataLength={remindList.length}要写remindList.length不能写成remindListTotal,切记！
                                dataLength={chatList.length}
                                next={getCurrentData}
                                // hasMore控制触发上面的next，这个要注意
                                // 当滚动条滚动到顶部时，loading=true触发next，否则不触发
                                hasMore={showChatListLoading}
                                loader={<div className={'flex items-center justify-center w-full'}><Loading/></div>}
                                style={{
                                    display: "flex",
                                    flexDirection: "column-reverse"
                                }} //To put endMessage and loader to the top.
                                scrollableTarget="scrollableDiv"
                                inverse={true}>
                                <div className={'pt-[64px] pb-[24px]'}>
                                    {
                                        chatList.map((item, index) => {
                                            return <div key={index} className={classNames({
                                                // me
                                                'flex items-end flex-col': item.uid === myselfInfo.uid,
                                                //other
                                                'w-full': item.uid !== myselfInfo.uid
                                            })}>
                                                <div className={
                                                    classNames({
                                                        // me
                                                        'flex flex-col items-end w-[70%]': item.uid === myselfInfo.uid,
                                                        //other
                                                        'w-[70%] s': item.uid !== myselfInfo.uid,
                                                    })
                                                }>
                                                    <div
                                                        className={'px-[16px] list-none mb-[6px] gap-2 flex items-end border-bl'}>
                                                        {
                                                            item?.uid === myselfInfo?.uid ? null :
                                                                <Avatar style={{flexShrink: '0', cursor: 'pointer'}}
                                                                        src={item.avatar}
                                                                        size={40} onClick={() => {
                                                                    gotoUser(item.userName)
                                                                }}/>
                                                        }
                                                        <div className={classNames({
                                                            // me
                                                            'inline-flex bg-[#00a3ff] rounded-2xl px-[16px] py-[12px] text-white': item.uid === myselfInfo.uid,
                                                            //other
                                                            'inline-flex bg-[#eff3f4] rounded-2xl px-[16px] py-[12px] dark:text-black': item.uid !== myselfInfo.uid,
                                                            'rounded-bl': item?.uid !== myselfInfo?.uid && getDt(item, index),
                                                            'rounded-br': item?.uid === myselfInfo?.uid && getDt(item, index),
                                                        })}>
                                                            <span className={'text-md'}> {item.content}</span>
                                                        </div>
                                                    </div>

                                                    {getDt(item, index) ? <div className={classNames({
                                                        'text-sm text-[#536471] dark:text-white mb-[25px]': true,
                                                        'ml-[65px]': item.uid !== myselfInfo.uid,
                                                        'flex items-center justify-end mr-[16px]': item.uid === myselfInfo.uid
                                                    })}>{getDt(item, index)}</div> : null}
                                                </div>
                                            </div>
                                        })
                                    }
                                </div>
                            </InfiniteScroll>
                        </div> :
                        <div className={'w-full h-[calc(100vh-169px)] flex items-center justify-center flex-col'}>
                            <span
                                className={'inline-block text-[#333] dark:text-white text-2xl font-bold'}>你还没有选择一条私信</span>
                            <p className={'text-md text-[#666] dark:text-white'}>从你的已有私信中选择一条。</p>
                        </div>
                }
            </div>
            <div className={'p-[6px] border-t border-[#EFF3F5] dark:border-[#474747]'}>
                <Input placeholder="请输入内容" size={'large'} variant="borderless" disabled={!currentUserInfo?.uid}
                       value={messageValue}
                       onChange={(e) => {
                           // console.log('请输入内容:', e.target.value)
                           setMessageValue(e.target.value)
                       }} onPressEnter={onEnter}/>
            </div>
        </div>

    }, [currentUserInfo, chatList, showChatListLoading, messageValue])


    function renderLeftSide(isDrawer = false) {
        return <div className={classNames({
            'border-b border-[#EFF3F5] dark:border-[#474747]': true,
            'border-x': !isDrawer
        })}>
            <div
                className={'py-[16px] px-[16px] flex items-center justify-between border-b border-[#EFF3F5] dark:border-[#474747]'}>
                <span className={'text-xl font-bold'}>私信列表</span>
                <SettingOutlined
                    className={'text-xl'}
                    onClick={() => {
                        // router.push("/setting/notice");
                        serverData.routerPush("/setting/notice")
                    }}
                />
            </div>
            {
                mailboxes?.length > 0 ?
                    <List
                        className={classNames({
                            'overflow-y-auto ': true,
                            'h-[calc(100vh-62px)]': isDrawer,
                            'h-[calc(100vh-118px)]': !isDrawer
                        })}
                        itemLayout="horizontal"
                        bordered={false}
                        dataSource={mailboxes}
                        renderItem={(item, index) => (
                            <List.Item
                                style={{borderColor: item.uid !== currentUserInfo?.uid ? 'transparent' : platFormTheme.color, borderBlockEnd: 'none'}}
                                className={classNames({
                                    'cursor-pointer hover:bg-[#f7f9f9] dark:hover:bg-[#2D333B] h-[88px] border-r-[2px]': true
                                })} onClick={() => {
                                console.log('item-', item)
                                // 这里mailbox里面的item实际就是每个用户信息，但是对于当前登录者其实是friend的关系，所以这里使用fid和uid来判断
                                if (routerSearchParams.get('fid') !== item.uid) {
                                    choosedUser(item)
                                }
                            }}>
                                <List.Item.Meta avatar={<span className={'pl-[10px]'}>
                                                {item?.isRead ? <Badge color="transparent"/> : <Badge color="blue"/>}
                                    <Avatar size={48} src={item.avatar}/>
                                              </span>}
                                                title={<div className={'flex items-center justify-between'}>
                                                    <span className={'text-md'}>{item?.userName}</span>
                                                    {item?.chatDt ? <span
                                                        className={'text-xs text-[#666] pr-[10px]'}>{item?.chatDt ? dayjs(dayjs.utc(item.chatDt).local()).fromNow() : dayjs().fromNow()}</span> : null}
                                                </div>}
                                                description={item?.content ?
                                                    <div
                                                        className={'w-full inline-block overflow-hidden text-nowrap truncate'}>
                                                        {item.content}
                                                    </div> : null}
                                />
                            </List.Item>
                        )}
                    /> : <div className={'h-[calc(100vh-135px)] overflow-y-auto'}><Empty/></div>
            }

        </div>
    }

    function onClose() {
        setOpen(false)
    }

    return <div className={'flex items-center justify-center'}>
        <div className={'max-w-screen-lg mx-auto w-full flex'}>
            <div className={'w-[320px] shrink-0 hidden lg:block'}>
                {renderLeftSide()}
            </div>
            <div className={'w-full flex-1'}>
                {renderChatList()}
            </div>
        </div>

        <Drawer width={320} title="" placement="left" onClose={onClose} closable={false} open={open} styles={{
            body: {
                padding: '0',
            },
        }}>
            <div className={'w-[320px] shrink-0'}>
                {renderLeftSide(true)}
            </div>
        </Drawer>
    </div>
}
export default withRouter(Chatroom);
