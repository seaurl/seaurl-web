'use client'
import ChatNote from "@/components/aihub/chatAiSpace/chatNote";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {queryUserAiTools, updateDt} from "@/lib/slices/aiSpaceSlice";
import {useDispatch, useSelector} from "react-redux";
import {useRouter, useSearchParams} from "next/navigation";
import {useSession} from "next-auth/react";
import {Avatar, Button, Dropdown, Input, message, Space, Tooltip, Upload} from 'antd';
import {
    ArrowUpOutlined, CheckOutlined, CloseCircleOutlined, CloseOutlined,
    CopyOutlined,
    EditOutlined, FileOutlined, FolderOpenOutlined, FolderOutlined,
    FormOutlined, HistoryOutlined,
    LoadingOutlined, PlusOutlined,
    ReloadOutlined, SyncOutlined, UploadOutlined
} from "@ant-design/icons";
import NoteCreateForAiDlg from "@/components/dialog/noteCreateForAiDlg";
import {
    addMessage, clearBotMessage, concatMessageForAi,
    concatMessageInChatList,
    concatMessageInChatListForAi, deleteMessageById, initChat, removeUnSavedBotMessage,
    setMessageByRole
} from "@/lib/slices/chatAiSpaceSlice";
import InfiniteScroll from "react-infinite-scroll-component";
import classNames from "classnames/bind";
import MarkdownMessage from "@/components/aihub/chatAiSpace/chatList/markdownMessage";
import Loading from "@/components/loading";
import {marked} from "marked";
import ChatHistoryDlg from "@/components/dialog/chatHistoryDlg";
import RoleAddDlg from "@/components/dialog/chatAiDlg/roleAddDlg";
import IconFont from "@/utils/iconFont";
import {getFileType, isExcel, isWord, readDocx, readExcel, readPdf, readText} from "@/utils/help";
import dayjs from "dayjs";
import * as XLSX from 'xlsx';
import mammoth from "mammoth";
import * as pdfjsLib from 'pdfjs-dist';
import SelectFileDlg from "@/components/dialog/selectFileDlg";

pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdn.seaurl.com/js/pdf.js/pdf.worker.mjs';

const {TextArea} = Input;

const NewChatList = (props) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const query = useSearchParams()
    const {data: session} = useSession()
    const [chatVal, setChatVal] = useState('')
    const [end, setEnd] = useState('')
    const [isStop, setStop] = useState(true)
    // const [isUpdate, setUpdate] = useState(false)
    let isUpdate = useRef(false)
    const abortControllerRef = useRef(null)
    const [isEditRole, setEditRole] = useState(false)
    const inputRef = useRef(null);
    const [uploadFile, setUploadFile] = useState(null)
    const [selectFileDlg, setSelectFileDlg] = useState({
        title: '',
        show: false
    })
    const [dlg, setDlg] = useState({
        title: '',
        show: false
    })

    const [historyDlg, setHistoryDlg] = useState({
        title: '',
        show: false
    })


    const {platFormTheme} = useSelector(state => state.system)
    const {chatAiList} = useSelector(state => state.chatAiSpace)
    const {accountInfo} = useSelector(state => state.auth)

    useEffect(() => {
        abortControllerRef.current = new AbortController()
        init()

        return () => {
            isUpdate.current = false

            if (abortControllerRef.current?.abort) {
                onStop()
            }
        }
    }, [])

    useEffect(() => {
        // 监听ai生成是否结束，如果结束则保存到数据库中
        if (end) {
            // 这里要置空处理，否则会一直进来导致重复提交
            setEnd('')
            saveBotMessage()
        }
    }, [end, chatAiList])

    /**
     *
     */
    function init() {
        dispatch(initChat(query.get('usedId')))
    }

    function saveBotMessage() {
        chatAiList.forEach(item => {
            if (item.usedId === query.get('usedId')) {
                dispatch(addMessage({
                    aiToolId: props.chatAi._id,
                    type: props.chatAi.type,
                    role: 'bot',
                    message: item.botMessage,
                    reasonMessage: item.reasonMessage,
                }))
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

    async function onStop() {
        abortControllerRef.current.abort()
        setStop(true)
        setEnd(parseInt(Date.now() + "") + Math.floor(Math.random() * 10000000))
    }

    // 重新生成回答
    async function onReStart(chat) {
        if (chat.botMessageId) {
            // 1、删除后台最后一条bot生成的聊天
            const res = await dispatch(deleteMessageById({
                id: chat.botMessageId
            }))
            console.log('deleteMessageById res =', res)
            if (res.payload.status === 0 && res.payload.data) {
                // 2、删除前端最后一条bot生成的聊天
                await dispatch(clearBotMessage())
                // 3、重新发送获取bot聊天记录，并显示到前端
                //创建新的AbortController
                abortControllerRef.current = new AbortController()
                getMessageByAi()
            }
        }
    }

    function onOpenHistory() {
        setHistoryDlg({
            show: true,
            title: '聊天记录',
            aiToolId: props.chatAi._id,
            botAvatar: props.chatAi.avatar,
            userAvatar: accountInfo.avatar
        })
    }

    function onCloseHistoryDlg() {
        setHistoryDlg({
            show: false,
            title: '聊天记录'
        })
    }

    function getFileIcon(file) {
        if (file) {
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                return <IconFont type={'icon-excel'} className='text-base'/>
            } else if (file.name.endsWith('.docx')) {
                return <IconFont type={'icon-word'} className='text-base'/>
            } else if (file.name.endsWith('.pdf')) {
                return <IconFont type={'icon-pdf'} className='text-base'/>
            } else if (file.name.endsWith('.txt')) {
                return <IconFont type={'icon-txt'} className='text-base'/>
            }
        }
        return <IconFont type={'icon-unknown'} className='text-base'/>
    }

    function renderBtn() {
        return <div className={'flex items-center justify-end gap-3 w-full px-2 pb-0 text-xl'}>
            {
                uploadFile?.name ? <Tooltip title="仅能识别文件中的文本">
                    <div className={' flex items-center gap-2'}>
                        {getFileIcon(uploadFile)}
                        <span className={'text-sm'}>
                            {uploadFile.name}
                        </span>
                        <span className={'text-sm text-[red] cursor-pointer'} onClick={() => {
                            setUploadFile(null)
                        }}>
                            <CloseOutlined/>
                        </span>
                    </div>
                </Tooltip> : null
            }

            <div className={'flex items-center gap-1'}>
                <Tooltip title="上传文件">
                    <Dropdown
                        menu={{
                            items: [{
                                key: 'local',
                                label: '上传本地文件',
                                icon: <FolderOutlined style={{fontSize: '20px'}}/>,
                                onClick: () => {
                                    if (inputRef.current) {
                                        inputRef.current.click();
                                    }
                                }
                            }, {
                                key: 'myFileSpace',
                                label: '从我的文件选择',
                                icon: <FolderOpenOutlined style={{fontSize: '20px'}}/>,
                                onClick: () => {
                                    setSelectFileDlg({
                                        title: '请选择文件',
                                        show: true,
                                        allowedExtensions: [
                                            'doc', 'docx',       // Word
                                            'xls', 'xlsx',       // Excel
                                            'pdf',                // PDF
                                            'txt'                 // Text
                                        ],
                                        onOk: async (d) => {
                                            console.log('d=', d)

                                            if (d?.url && d.name) {
                                                fetch(d.url)
                                                    .then(response => {
                                                        if (!response.ok) {
                                                            message.error("网络返回出错")
                                                        }
                                                        return response.blob();
                                                    })
                                                    .then(async res => {
                                                        console.log('-----------------r=', res)
                                                        const extension = d.name.split('.').pop().toLowerCase().split('?')[0];
                                                        console.log('-----------------extension=', extension);
                                                        let fileContent = ''
                                                        switch (extension) {
                                                            case "txt":
                                                                fileContent = await readText(res);
                                                                break;
                                                            case "pdf":
                                                                fileContent = await readPdf(res)
                                                                break;
                                                            case "docx":
                                                                fileContent = await readDocx(res)
                                                                break;
                                                            case "xls":
                                                            case "xlsx":
                                                                fileContent = await readExcel(res)
                                                                if (fileContent) {
                                                                    fileContent = JSON.stringify(fileContent)
                                                                }
                                                                break;
                                                            default:
                                                                return message.error("不支持此文件，请重新选择")
                                                        }
                                                        setUploadFile({
                                                            name: d.name,
                                                            size: d.size,
                                                            type: d.type,
                                                            content: fileContent,
                                                        })
                                                    })
                                                    .catch(error => {
                                                        message.error("获取文件出错：" + error)
                                                    });
                                            }
                                        }
                                    })
                                }

                            }],
                            onClick: (d) => {

                            }
                        }} trigger={'click'} placement="top">
                        <Button icon={<div className={'flex items-center justify-center'}>
                            <UploadOutlined style={{fontSize: '18px'}}/>
                        </div>}
                                type={'text'}
                                style={{backgroundColor: platFormTheme?.background === 'light' ? '#f3f4f5' : '#2E333D'}}></Button>
                    </Dropdown>
                </Tooltip>
                <Tooltip title="聊天记录">
                    <Button
                        onClick={onOpenHistory}
                        style={{backgroundColor: platFormTheme?.background === 'light' ? '#f3f4f5' : '#2E333D'}}
                        icon={<div className={'flex items-center justify-center'}>
                            <HistoryOutlined style={{fontSize: '18px'}}/>
                        </div>} type={'text'}></Button>
                </Tooltip>
            </div>
            {/*<Button icon={<UploadOutlined style={{ fontSize: '18px' }}/>} shape="circle"></Button>*/}
            {
                isStop ? <Button shape="circle"
                                 icon={<div className={'flex items-center justify-center'}>
                                     <ArrowUpOutlined style={{fontSize: '18px'}}/></div>}
                                 type={'primary'}
                                 onClick={onStart}>
                    </Button> :
                    <Button shape="circle" icon={<span className={'inline-block p-[4px] rounded-full align-middle'}>
                                <span className={'w-[10px] h-[10px] bg-white inline-block'}></span></span>}
                            type={'primary'}
                            onClick={onStop}>
                    </Button>
            }

        </div>
    }

    async function getMessageByAi() {
        setStop(false)
        let reader;

        if (abortControllerRef.current?.signal) {
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
                                            await dispatch(concatMessageForAi({
                                                botMessage: content,
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
    }

    async function handleKeyDown(e) {
        if (e.keyCode === 13) {
            if (e.shiftKey) {
                // 这里是回车换行
            } else {
                // 否则直接提交表单，并且阻止换行
                e.preventDefault();
                onStart()
            }
        }
    }

    //开始执行ai
    async function onStart() {
        if (!chatVal.replace(/(^\s+)|(\s+$)/g, '')) {
            setChatVal('')
            return message.warning('请先输入聊天内容')
        }
        if (!isStop) {
            return message.warning('正在生成聊天，请稍候再试')
        }
        // 清空文本框
        setChatVal('')
        console.log('------uploadFile------', uploadFile)
        // 合并用户的数据到前端
        await dispatch(setMessageByRole({
            aiToolId: props.chatAi._id,
            type: props.chatAi.type,
            userMessage: chatVal.trim(),
            botMessage: '',
            reasonMessage: '',
            file: uploadFile
        }))

        // 保存用户的数据到后台
        await dispatch(addMessage({
            // chatAiId: query.get('chatAiId'),
            aiToolId: props.chatAi._id,
            type: props.chatAi.type,
            role: 'user',
            message: chatVal.trim(),
            reasonMessage: '',
            file: uploadFile
        }))

        setUploadFile(null)
        // 发送完成之后调用千问api
        getMessageByAi()
    }

    function onCreateNote(chat) {
        console.log('f---', chat)
        if (chat.userMessage.trim() && chat.botMessage.trim()) {
            setDlg({
                title: '添加到我的笔记',
                show: true,
                input: chat.userMessage,
                // 使用marked把markdown格式转换成html格式供ckeditor富文本编辑器使用
                message: marked.parse(chat.botMessage)
            })
        }
    }

    async function onCopy(chat, type = 'bot') {
        try {
            await navigator.clipboard.writeText(type === 'bot' ? chat.botMessage : chat.userMessage)
            message.success("复制成功");
        } catch (error) {
            message.error("复制失败");
        }
    }

    function onReEdit(chat) {
        if (chat.userMessage.trim()) {
            setChatVal(chat.userMessage)
        }
    }

    async function handleFileChange(e) {
        const file = e.target.files[0];
        // 重置input值以允许重复选择同一文件
        if (e.target.files.length > 0) {
            e.target.value = '';
        }
        console.log('----------file=', file)
        if (file) {

            const maxSize = 10 * 1024 * 1024; // 10MB

            if (file && file.size > maxSize) {
                e.target.value = ''; // 清除选择
                return message.info('文件大小不能超过10MB')
            }
            const fileName = file.name.toLowerCase();

            try {
                let fileContent = ''
                if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                    fileContent = await readExcel(file);
                    if (fileContent) {
                        fileContent = JSON.stringify(fileContent)
                    }
                    console.log('Excel内容:', fileContent);
                } else if (fileName.endsWith('.docx')) {
                    fileContent = await readDocx(file);
                    console.log('Word内容:', fileContent);
                } else if (fileName.endsWith('.pdf')) {
                    fileContent = await readPdf(file);
                    console.log('PDF内容:', fileContent);
                } else if (fileName.endsWith('.txt')) {
                    fileContent = await readText(file);
                    console.log('文本内容:', fileContent);
                } else {
                    return message.info('仅支持Excel、Word、Pdf和文本文件')
                }
                let _file = {
                    name: file?.name || '',
                    content: fileContent,
                    size: file?.size || '',
                    type: file?.type || '',
                    lastModified: file?.lastModified || '',
                    lastModifiedDate: file?.lastModifiedDate || '',
                    webkitRelativePath: file?.webkitRelativePath || '',
                }
                setUploadFile(_file);
            } catch (err) {
                console.error('文件读取出错:', err);
                message.info('文件读取出错')
            }
        } else {
            message.info('文件不可用')
        }
    }


    const renderChatList = useCallback(() => {
        const fs = chatAiList.filter(f => f.usedId === query.get('usedId'))
        // 如果加载完成之后，列表数为0，则显示默认组件
        if (fs.length === 0) {
            return <div className={'h-full'}>
                <ChatNote name={props.chatAi.name} desc={props.chatAi.desc} avatar={props.chatAi.avatar}/>
            </div>
        }

        const chat = fs[0]

        if (!chat.userMessage) {
            return <div className={'h-full'}>
                <ChatNote name={props.chatAi.name} desc={props.chatAi.desc} avatar={props.chatAi.avatar}/>
            </div>
        }

        return <div className={'flex justify-center w-full h-full pt-[20px] overflow-y-auto'}>
            <div className={'flex flex-col gap-4 max-w-full lg:max-w-[60%] w-full h-full'}>
                <div className={'flex justify-end px-[12px]'}>
                    <div className={'flex flex-col gap-1 max-w-full lg:max-w-[80%] items-end'}>
                        {
                            chat.file ? <div
                                className={'px-[12px] leading-[28px] flex items-center gap-2 text-sm p-2 bg-[#F0F6FF] dark:bg-[#494f5a] break-all rounded-xl '}>
                                {getFileIcon(chat.file)}
                                {chat.file.name}
                            </div> : null
                        }
                        <div
                            className={'px-[12px] leading-[28px] bg-[#F0F6FF] dark:bg-[#494f5a] p-2 rounded-xl items-end break-all text-sm'}>{chat.userMessage.trim()}</div>
                        {
                            chat.userMessage.trim() ? <div
                                className={'w-full items-center justify-end px-[12px] text-[#333] dark:text-white flex'}>
                                <Space size={8}>
                                    <Tooltip title={'重新编辑'}>
                                        <EditOutlined className={'cursor-pointer pl-[4px] text-[16px]'}
                                                      onClick={() => onReEdit(chat)}/>
                                    </Tooltip>
                                    <Tooltip title={'复制'}>
                                        <CopyOutlined className={'cursor-pointer pl-[4px] text-[16px]'}
                                                      onClick={() => onCopy(chat, 'user')}/>
                                    </Tooltip>
                                </Space>
                            </div> : null
                        }
                    </div>
                </div>
                <div className={'flex gap-1 pb-[200px]'}>
                    <div className={'shrink-0 hidden lg:block '}>
                        <Avatar size={36} src={props.chatAi.avatar} style={{backgroundColor: '#fff'}}/>
                    </div>
                    <div className={'w-full flex flex-col gap-1 pt-1'}>
                        <div className={'px-[12px] text-base w-full text-[#333] dark:text-white leading-[28px]'}>
                            {!chat.botMessage.trim() && !chat.reasonMessage.trim() ?
                                <div className={'flex items-center gap-2'}><LoadingOutlined/>正在思考中...</div> : null}
                            {
                                chat.reasonMessage.trim() ? <div className={'flex flex-col'}>
                                    <div className={'font-bold text-base dark:text-white'}>思考过程：</div>
                                    <MarkdownMessage isDeepThink={true} content={chat.reasonMessage}/>
                                </div> : null
                            }
                            <MarkdownMessage isDeepThink={false} content={chat.botMessage}/>
                        </div>
                        {
                            (chat.botMessage.trim() || chat.reasonMessage.trim()) && isStop ? <div
                                className={'w-full items-center justify-start px-[12px] text-[#333] dark:text-white flex'}>
                                <Space size={8}>
                                    <Tooltip title={'重新生成'}>
                                        <SyncOutlined className={'cursor-pointer pl-[4px] text-[16px]'}
                                                      onClick={() => onReStart(chat)}/>
                                    </Tooltip>
                                    <Tooltip title={'复制'}>
                                        <CopyOutlined className={'cursor-pointer pl-[4px] text-[16px]'}
                                                      onClick={() => onCopy(chat)}/>
                                    </Tooltip>
                                    <Tooltip title={'添加到我的笔记'} onClick={() => onCreateNote(chat)}>
                                        <FormOutlined className={'cursor-pointer pl-[4px] text-[16px]'}/>
                                    </Tooltip>
                                </Space>
                            </div> : null
                        }

                    </div>
                </div>
            </div>
        </div>
    }, [chatAiList, isStop, query])

    return <div className={' bg-[#fff] dark:bg-[#292A2D] w-full h-full relative overflow-hidden'}
                onClick={globalUpdate}>
        <div className={'pl-0 lg:pl-[16px] h-full relative overflow-hidden'}>
            {renderChatList()}
            <div
                className={'flex items-center justify-center flex-col absolute bottom-0  left-3 right-3 bg-white dark:bg-[#292A2D]'}>
                <div
                    className={'w-full lg:w-[60%] py-2 rounded-xl flex flex-col items-center gap-2 border border-[#ddd] dark:border-[#404045] bg-[#f3f4f5] dark:bg-[#404045]'}>
                    <TextArea value={chatVal}
                              maxLength={5500}
                              size={'large'}
                              placeholder={'请输入聊天内容（Shift + Enter = 换行）'}
                              autoSize={{minRows: 1, maxRows: 7}}
                              variant={'borderless'}
                              style={{backgroundColor: platFormTheme?.background === 'light' ? '#f3f4f5' : '#404045'}}
                              onKeyDown={handleKeyDown}
                              addonAfter={<div><Button>停止</Button></div>}
                              onChange={(e) => {
                                  setChatVal(e.target.value)
                              }}/>
                    {/*{props.floatBtn ?? props.floatBtn}*/}
                    {renderBtn()}
                </div>
                {/*<Button>刷新</Button>*/}
                <div
                    className={'pt-[6px] pb-[6px] px-[20px] text-[#999] text-xs'}>服务生成的所有内容均由人工智能模型生成，其生成内容的准确性和完整性无法保证，不代表我们的态度或观点
                </div>

            </div>
        </div>
        <NoteCreateForAiDlg dlg={dlg}/>
        <ChatHistoryDlg dlg={historyDlg} close={onCloseHistoryDlg}/>
        <SelectFileDlg dlg={selectFileDlg}/>

        <input
            type="file"
            accept=".xlsx,.xls,.docx,.txt,.pdf"
            ref={inputRef}
            style={{display: 'none'}}
            onChange={handleFileChange}
        />
    </div>
}

export default NewChatList
