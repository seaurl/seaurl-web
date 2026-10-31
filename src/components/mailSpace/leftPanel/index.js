'use client'
import React, {useEffect, useRef, useState} from "react";
import {useSession} from "next-auth/react";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch, useSelector} from "react-redux";
import classNames from "classnames/bind";
import {Button, Dropdown, Menu, message, Modal} from "antd";
import {
    AppstoreOutlined, CaretDownOutlined, CaretRightOutlined, CloseSquareOutlined, CopyOutlined, DeleteOutlined,
    EditOutlined, EllipsisOutlined, FileOutlined,
    GlobalOutlined, InboxOutlined,
    MailOutlined,
    PlusOutlined, SendOutlined,
    SettingOutlined, SyncOutlined, WalletOutlined
} from "@ant-design/icons";
import MailboxDlg from "@/components/dialog/mailboxDlg";
import {Tree} from "react-arborist";
import Empty from "@/components/empty";
import {
    deleteMailProvider,
    getMailMessages,
    getMailProvider,
    resetMailMessageList,
    startResyncMail,
    reSyncMail,
    setChooseMailMessage,
    setFoundSyncingMailbox,
    setMailMessage,
    setResyncMail,
    setServerData,
    setPagination,
    setMailLoading
} from "@/lib/slices/mailSpaceSlice";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import MenuAction from "@/components/menuAction";
import {sortFolderList} from "@/utils/help";
import MailLetterDlg from "@/components/dialog/mailLetterDlg";

const {confirm} = Modal;

const LeftPanel = ({rounded}) => {
    const {data: session} = useSession()
    const dispatch = useDispatch();
    const router = useRouter();
    // const {query} = router;
    const query = useSearchParams()
    const routerParams = useParams()
    const [mailboxDlg, setMailboxDlg] = useState(null)
    const [mailLetterDlg, setMailLetterDlg] = useState(null)
    const [treeHeight, setTreeHeight] = useState(0)
    const {mailProviders, foundSyncingMailbox, isResyncing} = useSelector(state => state.mailSpace)
    const inter = useRef(null)
    const abortControllerRef1 = useRef(null)
    const abortControllerRef2 = useRef(null)
    const treeRef = useRef(null);

    useEffect(() => {
        changeResize()
        window.addEventListener('resize', changeResize);
        return () => {
            window.removeEventListener('resize', changeResize);
            if (inter) {
                clearInterval(inter.current)
            }
            if (abortControllerRef1.current?.abort) {
                abortControllerRef1.current.abort();
            }
            if (abortControllerRef2.current?.abort) {
                abortControllerRef2.current.abort();
            }
        }
    }, [])

    useEffect(() => {
        changeResize()
    }, [rounded]);

    function changeResize() {
        const screenHeight = window.innerHeight
        // console.log('--- rounded ----', rounded)
        if (!rounded) {
            setTreeHeight(screenHeight - 140 + 56)
        } else {
            setTreeHeight(screenHeight - 140)
        }
    }

    useEffect(() => {
        if (foundSyncingMailbox || isResyncing) {
            if (inter.current) {
                clearInterval(inter.current)
            }
            addCallback()
            // 刷新页面时，根据foundSyncingMailbox值监听邮箱是否同步邮件完成
            // 监听是否同步完成，有两种场景入口：1、刷新页面，2、添加新邮箱
            inter.current = setInterval(async () => {
                addCallback()
            }, 3000)
        } else {
            if (inter.current) {
                clearInterval(inter.current)
            }
        }
    }, [foundSyncingMailbox, isResyncing])

    function onAddMailbox() {
        const fs = mailProviders.filter(f => f.status === '2')
        if (fs.length > 0) {
            message.info("正在同步邮件，请稍候！")
        } else {
            setMailboxDlg({
                title: '添加新邮箱',
                show: true,
                action: 'add'
            })
        }
    }

    async function onEditSuccessDlg() {
        setMailboxDlg({
            show: false
        })
        if (abortControllerRef1.current?.abort) {
            abortControllerRef1.current.abort();
        }
        // 创建新的 AbortController
        abortControllerRef1.current = new AbortController();

        const res = await dispatch(getMailProvider({
            abortController: abortControllerRef1.current
        }))
    }

    /**
     * 1、设置收件箱选中，并且显示正在同步进度条
     * 2、每隔周期时间进行查询是否同步结束：同步状态，0：未同步，1：同步完成，2：正在同步,-1：同步失败
     * 3、如果同步完成，查询邮件列表并选中第1条邮件,并且清除定时器
     * @param data
     */
    async function onAddSuccessDlg(res) {
        console.log('onSuccessDlg =====', res)
        setMailboxDlg({
            show: false
        })
        // 清空一下
        await dispatch(resetMailMessageList())

        if (res?.mailFolderList?.length > 0) {
            shallowUpdateRouterParams(`fid=${res?.mailFolderList[0]?.id}`)

            console.log('-----treeRef.current-----', treeRef.current)
            // 选中并打开树节点
            if (treeRef.current) {
                // 这里open的是 parent id
                treeRef.current.open(res?.id)
            }
        }

        addCallback()
        // 监听是否同步完成，有两种场景入口：1、刷新页面，2、添加新邮箱
        inter.current = setInterval(async () => {
            addCallback()
        }, 3000)
    }

    function onCloseDlg() {
        setMailboxDlg({
            show: false
        })
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

    const onClick = (e) => {
        console.log('click ', e);
    };

    function renderPrevIcon(node) {
        console.log('node', node)
        if (node.data.id === '0') {
            return <span className={'text-xs'}>
                            <GlobalOutlined/>
                        </span>
        } else if (node.isLeaf) {
            if (node.data.name === '收件箱'){
                return <span className={'text-base'}><InboxOutlined /></span>
            }
            if (node.data.name === '草稿箱'){
                return <span className={'text-sm'}><FileOutlined /></span>
            }
            if (node.data.name === '已发送'){
                return <span className={'text-sm'}><SendOutlined /></span>
            }
            if (node.data.name === '已删除'){
                return <span className={'text-base'}><CloseSquareOutlined /></span>
            }
            if (node.data.name === '垃圾邮件'){
                return <span className={'text-base'}><DeleteOutlined /></span>

            }
            if (node.data.name === '已归档'){

            }
            if (node.data.name === '病毒邮件'){

            }
            if (node.data.name === '广告邮件'){

            }
            if (node.data.name === '订阅邮件'){

            }
            if (node.data.name === '其他文件夹'){

            }
            if (node.data.name === 'Deleted Items'){

            }
            return <span className={'text-sm'}><WalletOutlined /></span>
        } else {
            if (node.isOpen) {
                return <span className={'text-xs'}>
                    <CaretDownOutlined onClick={(e) => {
                    e.stopPropagation()
                    node.toggle()
                    }}/></span>
            } else {
                return <span className={'text-xs'}>
                    <CaretRightOutlined onClick={(e) => {
                    e.stopPropagation()
                    node.toggle()
                }}/></span>
            }
        }
    }

    function onEdit(node) {
        console.log('------------ onEdit')

    }

    function onDelete(node) {
        console.log('------------ onDelete')

    }

    function onSync() {
        console.log('------------ onSync')
    }

    function renderMenus(dom) {
        return <MenuAction data={[]}
                           edit={onEdit}
                           delete={onDelete}
                           sync={onSync}
                           action={['sync', 'edit', 'delete']}>
            {dom}
        </MenuAction>
    }

    // 添加邮箱时调用
    async function addCallback() {
        const fid = query.get('fid')
        if (abortControllerRef1.current?.abort) {
            abortControllerRef1.current.abort();
        }
        // 创建新的 AbortController
        abortControllerRef1.current = new AbortController();

        const res = await dispatch(getMailProvider({
            abortController: abortControllerRef1.current
        }))

        const resData = res.payload.data
        if (res.payload.status === 0 && resData?.length > 0) {
            const fs = resData.filter(item => item.status === '2')
            if (fs?.length > 0) {
                // 此时：正在同步，2
                const firstFolder = fs[0].mailFolderList[0]
                // 没有fid才做处理
                if (!fid && firstFolder?.id) {
                    shallowUpdateRouterParams(`fid=${firstFolder?.id}`)
                }
            } else {
                message.success("同步邮件完成")
                // 设置刷新页面，监听完毕
                dispatch(setFoundSyncingMailbox(false))
                // 定时完成之后，重置
                dispatch(setResyncMail(false))
                // 没有找到状态是2的，说明已经同步结束
                if (inter.current) {
                    console.log('--- clear interval ---')
                    clearInterval(inter.current)
                }
                // 默认选用第1个,因为后台查询的时候把正在同步的邮箱置顶了
                let firstFolder = resData[0].mailFolderList[0]
                // 同步完成如果fid有值，则设置当前邮箱目录为firstFolder
                // resData.forEach(item => {
                //     const fs = item.mailFolderList.filter(f => f.id === fid)
                //     if (fs?.length > 0) {
                //         firstFolder = fs[0]
                //     }
                // })

                if (abortControllerRef2.current?.abort) {
                    abortControllerRef2.current.abort();
                }
                // 创建新的 AbortController
                abortControllerRef2.current = new AbortController();

                // 此时：同步状态，0：未同步，1：同步完成，,-1：同步失败
                const res2 = await dispatch(getMailMessages({
                    data: {
                        email: firstFolder.email,
                        folderName: firstFolder.realName,
                        pageNum: 1,
                        pageSize: 20,
                    },
                    abortController: abortControllerRef2.current
                }))
                const resData2 = res2.payload.data
                if (resData2?.rows?.length > 0) {
                    dispatch(setChooseMailMessage(resData2?.rows[0]))
                    shallowUpdateRouterParams(`fid=${firstFolder.id}&eid=${resData2?.rows[0].id}`)
                    // 设置邮件为已读
                    await dispatch(setMailMessage({
                        messageId: resData2?.rows[0].id
                    }))
                } else {
                    shallowUpdateRouterParams(`fid=${firstFolder.id}`)
                }
            }

        }
    }

    // 删除邮箱调用
    async function deleteCallback() {
        if (abortControllerRef1.current?.abort) {
            abortControllerRef1.current.abort();
        }
        // 创建新的 AbortController
        abortControllerRef1.current = new AbortController();

        const res = await dispatch(getMailProvider({
            abortController: abortControllerRef1.current
        }))
        const mailProviders = res.payload.data
        if (mailProviders?.length > 0 && mailProviders[0].mailFolderList?.length > 0) {
            let firstFolder = mailProviders[0].mailFolderList[0]
            // if (query.get('fid')) {
            //     const fs = mailProviders[0].mailFolderList.filter(f => f.id === query.get('fid'))
            //     if (fs?.length > 0) {
            //         firstFolder = fs[0]
            //     }
            // } else {
            //
            // }
            console.log('firstFolder ========', firstFolder)

            if (mailProviders[0].status === '1') {
                if (firstFolder?.id) {

                    if (abortControllerRef2.current?.abort) {
                        abortControllerRef2.current.abort();
                    }
                    // 创建新的 AbortController
                    abortControllerRef2.current = new AbortController();

                    // await dispatch(resetMailMessageList())
                    const res = await dispatch(getMailMessages({
                        data: {
                            email: firstFolder.email,
                            folderName: firstFolder.realName,
                            pageNum: 1,
                            pageSize: 20,
                        },
                        abortController: abortControllerRef2.current
                    }))
                    const resData = res.payload.data
                    if (resData) {
                        const rows = resData.rows
                        if (rows?.length > 0) {
                            console.log('----------rows----------', rows)
                            dispatch(setChooseMailMessage(rows[0]))
                            shallowUpdateRouterParams(`fid=${firstFolder.id}&eid=${rows[0].id}`)
                            // 设置邮件为已读
                            await dispatch(setMailMessage({
                                messageId: rows[0].id
                            }))
                        }
                    } else {
                        shallowUpdateRouterParams(`fid=${firstFolder.id}`)
                    }
                }
            } else {
                if (firstFolder?.id && query.get('fid') !== firstFolder?.id) {
                    shallowUpdateRouterParams(`fid=${firstFolder?.id}`)
                }
            }
        } else {
            dispatch(setMailLoading(false))
            // 没有任何数据时，将url也要清空
            shallowUpdateRouterParams(``)
        }
    }

    function getIsSyncing(node) {
        let isSyncing = false

        if (node.data.realName) {
            mailProviders.forEach(provider => {
                const fs = provider.mailFolderList.filter((folder) => folder.id === node.data.id && provider.status === '2')
                if (fs && fs.length > 0) {
                    isSyncing = true
                }
            })
        } else {
            mailProviders.forEach(provider => {
                if (provider.id === node.data.id && provider.status === '2') {
                    isSyncing = true
                }
            })
        }
        return isSyncing
    }

    function renderTreeNode({node, style, dragHandle}) {
        /* This node instance can do many things. See the API reference. */

        return <Dropdown
            menu={{
                items: [
                    {
                        label: '同步邮件',
                        key: 'sync',
                        icon: <SyncOutlined/>,
                        onClick: async () => {
                            if (getIsSyncing(node)) {
                                message.info("正在同步邮件，请稍候！")
                            } else {
                                const res = await dispatch(reSyncMail({
                                    email: node.data?.email || '',
                                }))
                                if (res.payload.status === 0 && res.payload.data) {
                                    await dispatch(startResyncMail())
                                    // addCallback()
                                    // // 监听是否同步完成，有两种场景入口：1、刷新页面，2、添加新邮箱
                                    // inter.current = setInterval(async () => {
                                    //     addCallback()
                                    // }, 10000)
                                }
                            }
                        }
                    },
                    {
                        label: '编辑邮箱',
                        key: 'edit',
                        icon: <EditOutlined/>,
                        onClick: async () => {
                            if (getIsSyncing(node)) {
                                message.info("正在同步邮件，请稍候！")
                            } else {
                                setMailboxDlg({
                                    title: '编辑邮箱',
                                    show: true,
                                    action: 'edit',
                                    data: node.data
                                })
                            }
                        }
                    },
                    {
                        label: '复制邮箱',
                        key: 'copy',
                        icon: <CopyOutlined/>,
                        onClick: async () => {
                            const permission = await navigator.permissions.query({name: "clipboard-write"});
                            if (permission.state === "denied") {
                                throw new Error("没有剪贴板写入权限");
                            }
                            await navigator.clipboard.writeText(node.data.email);
                            message.success('复制邮箱成功')
                        }
                    },
                    {
                        label: '删除',
                        key: 'delete',
                        danger: true,
                        icon: <DeleteOutlined/>,
                        onClick: async () => {
                            if (getIsSyncing(node)) {
                                message.info("正在同步邮件，请稍候！")
                            } else {
                                confirm({
                                    title: `您确定要删除该邮箱？`,
                                    okText: '确定',
                                    cancelText: '取消',
                                    onOk: async () => {
                                        const fs = mailProviders.filter(f => f.email === node.data.email)
                                        if (fs?.length > 0) {
                                            const res = await dispatch(deleteMailProvider({
                                                id: fs[0].id || ''
                                            }))
                                            if (res.payload.status === 0) {
                                                // 清空message list
                                                await dispatch(resetMailMessageList())
                                                deleteCallback()
                                            }
                                        }
                                    }
                                })
                            }

                        }
                    },
                ],
            }}
            trigger={['contextMenu']}>
            <div style={style} className={classNames({
                'mx-2': true,
                'bg-[#D4CEF1] dark:bg-[#1C2126] rounded-md': node.data?.id === query.get('fid') && node.data.realName
            })} ref={dragHandle} onClick={async () => {
                console.log('---- node ----', node)
                // const fs = mailProviders.filter(f => f.email === node.data.email && f.status === '2')
                // if (fs.length > 0) {
                //     alert(node.data.id)
                //     // message.info("正在同步邮件，请等待...")
                //     shallowUpdateRouterParams(`fid=${node.data.id}`)
                // } else {
                if (node.data.realName) {
                    shallowUpdateRouterParams(`fid=${node.data.id}`)
                    await dispatch(resetMailMessageList())

                    if (abortControllerRef2.current?.abort) {
                        abortControllerRef2.current.abort();
                    }
                    // 创建新的 AbortController
                    abortControllerRef2.current = new AbortController();

                    const res = await dispatch(getMailMessages({
                        data: {
                            email: node.data.email,
                            folderName: node.data.realName,
                            pageNum: 1,
                            pageSize: 20,
                        },
                        abortController: abortControllerRef2.current
                    }))
                    const resData = res.payload.data
                    if (resData) {
                        const rows = resData.rows
                        if (rows?.length > 0) {
                            console.log('----------rows----------', rows)
                            dispatch(setChooseMailMessage(rows[0]))
                            shallowUpdateRouterParams(`fid=${node.data.id}&eid=${rows[0].id}`)
                            // 设置邮件为已读
                            await dispatch(setMailMessage({
                                messageId: rows[0].id
                            }))
                        }
                    }
                } else {
                    node.toggle()
                }
                // }
            }}>
                <div className={'py-2 text-sm pl-2 flex items-center gap-1'}>
                    <div className={'w-[20px] flex items-center justify-center'}>
                        {renderPrevIcon(node)}
                    </div>
                    {node.data.icon ? node.data.icon : null}
                    <div className={'inline-flex items-center justify-between w-full'}>
                        {node.data.name}
                    </div>
                </div>
            </div>
        </Dropdown>
    }

    return <div className={classNames({
        'h-full': true,
        'rounded-ss-2xl dark:rounded-ss-none': false
    })}>
        <div className={'p-3 flex items-center gap-3'}>
            <Button block icon={<PlusOutlined/>} onClick={onAddMailbox}>添加邮箱</Button>
            <Button block icon={<EditOutlined/>} type={"default"} onClick={() => {
                setMailLetterDlg({
                    title: '写信',
                    show: true,
                    action: 'add'
                })
            }}>写邮件</Button>
        </div>
        <div className={'text-sm font-medium px-3 py-1'}>邮箱列表</div>
        <div>
            {
                mailProviders?.length > 0 ?
                    <Tree data={mailProviders}
                          ref={treeRef}
                          width={'100%'}
                          height={treeHeight}
                          selection={query.get('fid')}
                          rowHeight={36}
                          indent={12}
                          openByDefault={false}
                          disableDrop={true}
                          childrenAccessor={(d) => d.mailFolderList}
                          disableMultiSelection={true}>
                        {renderTreeNode}
                    </Tree> : <Empty/>
            }
        </div>
        <MailboxDlg dlg={mailboxDlg} onClose={onCloseDlg} onAddSuccess={onAddSuccessDlg}
                    onEditSuccess={onEditSuccessDlg}/>
        <MailLetterDlg dlg={mailLetterDlg} onClose={onSendClose} onSuccess={onSendSuccess}/>
    </div>
};

export default withRouter(LeftPanel);
