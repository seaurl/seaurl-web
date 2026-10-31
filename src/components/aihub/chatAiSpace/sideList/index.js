// 'use client'
// import {Button, Space, List, Avatar, Dropdown, message, Modal, Segmented} from 'antd';
// import {
//     MessageOutlined,
//     CloseOutlined,
//     EditOutlined,
//     PlusOutlined,
//     EllipsisOutlined,
//     LeftOutlined, RightOutlined, ToTopOutlined, PictureOutlined, CommentOutlined
// } from "@ant-design/icons";
// import React, {useEffect, useState} from "react";
// import {
//     setShowPanel,
//     queryCategory,
//     deleteCategory,
//     setTopCategory,
//     clearChatList
// } from '@/lib/slices/chatAiSpaceSlice'
// import {useDispatch, useSelector} from "react-redux";
// import {useRouter, useSearchParams, usePathname, useParams} from "next/navigation";
// import ChatAiDlg from "@/components/dialog/chatAiDlg";
// import Loading from "@/components/loading";
// import Empty from "@/components/empty";
// import classNames from "classnames/bind";
// import {shallowUpdateRouterParams} from "@/utils/routerHelp";
// import {withRouter} from "@/hoc/withRouter";
//
// const {confirm} = Modal;
// const SideList = (props) => {
//     const dispatch = useDispatch();
//     const router = useRouter();
//     // const {query} = router;
//     const query = useSearchParams()
//     const routerParams = useParams()
//
//     const {platFormTheme} = useSelector(state => state.system)
//
//     const [showFloatBtn, setFloatBtn] = useState(false)
//     // const [chatList, setChatList] = useState([])
//     const [showAction, setAction] = useState(false)
//     const [isLoading, setLoading] = useState(false)
//     const [dlg, setDlg] = useState({
//         show: false,
//         title: '聊天标题',
//         action: '',
//         input: ''
//     })
//
//     const {showPanel, chatCategoryList} = useSelector(state => state.chatAiSpace)
//
//     async function getCategoryList(data, action) {
//         setLoading(true)
//         const res = await dispatch(queryCategory())
//         setLoading(false)
//
//         // 只有添加才变cid
//         if (dlg.action === 'add' && data?.chatAiId) {
//             shallowUpdateRouterParams('chatAiId=' + data?.chatAiId)
//         }
//         if (action === 'delete') {
//             if (res?.payload?.data?.length > 0) {
//                 shallowUpdateRouterParams('chatAiId=' + res?.payload?.data[0].chatAiId)
//             }
//         }
//     }
//
//     function getMenus(item) {
//         return [
//             {
//                 key: 'edit',
//                 label: '编辑',
//                 icon: <EditOutlined/>
//             },
//             {
//                 key: 'delete',
//                 label: '删除',
//                 icon: <CloseOutlined/>
//             },
//             {
//                 key: 'top',
//                 label: item.isTop ? '取消置顶' : '置顶',
//                 icon: <ToTopOutlined/>
//             },
//         ]
//     }
//
//     async function chooseChat(item) {
//         await dispatch(clearChatList())
//         // dispatch(setChooseChat(item))
//         // router.push(`/aiSpace/chatAi?chatAiId=${item.chatAiId}`)
//         shallowUpdateRouterParams(`chatAiId=${item.chatAiId}`)
//     }
//
//     return <>
//         <div className={'border-r border-[#e5eaee] dark:border-[#474747] w-full relative z-30'} onMouseEnter={() => {
//             setFloatBtn(true)
//         }} onMouseLeave={() => {
//             setFloatBtn(false)
//         }}>
//             <div className={'p-[20px] relative bg-white dark:bg-[#141414]'}>
//                 <Button block type={'dashed'} icon={<PlusOutlined/>} onClick={() => {
//                     setDlg({
//                         action: 'add',
//                         show: true
//                     })
//                 }}>新建聊天</Button>
//             </div>
//             <div className={classNames({
//                 'overflow-y-auto bg-white dark:bg-[#141414]': true,
//                 'h-[calc(100vh-72px)]': props.isDrawer,
//                 'h-[calc(100vh-128px)]': !props.isDrawer,
//             })}>
//                 {
//                     isLoading ? <div className={'flex items-center justify-center'}>
//                         <Loading/>
//                     </div> : chatCategoryList.length > 0 ? chatCategoryList.map((item, index) => {
//                         return <div key={index} style={{borderColor: item.isTop ? platFormTheme?.color : 'transparent'}}
//                                     className={classNames({
//                                         'w-full py-[10px] px-[calc(12px-0.25rem)] flex items-center justify-between cursor-pointer border-l-[0.25rem] hover:bg-[#f4f6f7] dark:hover:bg-[#2D333B]': true,
//                                         'bg-[#f4f6f7] dark:bg-[#2D333B] hover:bg-[#ececff] dark:hover:bg-[#2D333B]': query.get('chatAiId') === item.chatAiId,
//                                         'border-[transparent]': !item.isTop
//                                     })} onClick={async () => {
//                             if (props.onClickCategory) {
//                                 props.onClickCategory()
//                             }
//                             setAction(true)
//                             if (query.get('chatAiId')) {
//                                 if (query.get('chatAiId') !== item.chatAiId) {
//                                     chooseChat(item)
//                                 }
//                             } else {
//                                 chooseChat(item)
//                             }
//                         }} onMouseEnter={() => {
//                             if (query.get('chatAiId') === item.chatAiId) {
//                                 setAction(true)
//                             }
//                         }} onMouseLeave={() => {
//                             if (query.get('chatAiId') === item.chatAiId) {
//                                 setAction(false)
//                             }
//                         }}>
//                             <div className={'flex items-center justify-between w-full'}>
//                                 <div className={'flex items-center gap-1 truncate'}>
//                                     <MessageOutlined className={'text-md'}/>
//                                     <div className={'truncate text-sm'}>{item.title}</div>
//                                 </div>
//                                 {
//                                     showAction && query.get('chatAiId') === item.chatAiId ?
//                                         <div className={'flex items-center'}>
//                                             <Dropdown
//                                                 menu={{
//                                                     items: getMenus(item),
//                                                     onClick: async (d) => {
//                                                         if (d.key === 'delete') {
//                                                             confirm({
//                                                                 title: `您确定要删除该聊天所有记录？`,
//                                                                 okText: '确定',
//                                                                 cancelText: '取消',
//                                                                 onOk: async () => {
//                                                                     const res = await dispatch(deleteCategory({
//                                                                         chatAiId: item.chatAiId
//                                                                     }))
//                                                                     if (res.payload.status === 0 && res.payload.data) {
//                                                                         message.success('删除成功');
//                                                                         if (item.chatAiId === query.get('chatAiId')) {
//                                                                             dispatch(clearChatList())
//                                                                             //说明删除的是当前的聊天记录
//                                                                             // router.push(`/aiSpace/chatAi`, undefined, {shallow: true})
//                                                                             // props.routerPush('/aiSpace/chatAi')
//                                                                         }
//                                                                         getCategoryList(null, 'delete')
//                                                                     } else {
//                                                                         message.warning('删除失败')
//                                                                     }
//                                                                 }
//                                                             });
//                                                         }
//                                                         if (d.key === 'edit') {
//                                                             setDlg({
//                                                                 action: 'edit',
//                                                                 show: true,
//                                                                 data: {
//                                                                     val: item.title,
//                                                                     id: item.id
//                                                                 }
//                                                             })
//                                                         }
//                                                         if (d.key === 'top') {
//                                                             const res = await dispatch(setTopCategory({
//                                                                 cid: item.id,
//                                                                 isTop: !item.isTop
//                                                             }))
//                                                             if (res.payload.status === 0 && res.payload.data) {
//                                                                 message.success('设置成功');
//                                                                 getCategoryList()
//                                                             } else {
//                                                                 message.warning(res.payload.message)
//                                                             }
//                                                         }
//                                                     }
//                                                 }} placement="bottomRight">
//                                                 <EllipsisOutlined className={'text-sm'}/>
//                                             </Dropdown>
//                                         </div> : null
//                                 }
//                             </div>
//                         </div>
//                     }) : <Empty/>
//                 }
//
//             </div>
//         </div>
//         {
//             showFloatBtn || !showPanel ? <div
//                 className={'hidden fixed lg:flex hover:bg-[#797A7F] dark:bg-[#797A7F] hover:text-white left-[-40px] top-[48%] w-[60px] h-[71px] text-base bg-[#ccc] items-center justify-end rounded-tr-xl rounded-br-xl cursor-pointer pr-[4px] z-10'}
//                 style={{
//                     left: !showPanel ? '20px' : '280px'
//                 }}
//                 onClick={() => {
//                     dispatch(setShowPanel(!showPanel))
//                 }}
//                 onMouseLeave={() => {
//                     setFloatBtn(false)
//                 }}
//                 onMouseEnter={() => {
//                     setFloatBtn(true)
//                 }}>
//                 {showPanel ? <LeftOutlined className={'text-[#6B778C] text-base '} onMouseLeave={() => {
//                         setFloatBtn(false)
//                     }}/>
//                     : <RightOutlined className={'text-[#6B778C] text-base '}/>}
//             </div> : null
//         }
//         <ChatAiDlg show={dlg.show} action={dlg.action} data={dlg.data}
//                    ok={(res) => {
//                        setDlg({
//                            show: false
//                        })
//                        getCategoryList(res)
//                    }}
//                    close={() => {
//                        setDlg({
//                            show: false
//                        })
//                    }}/>
//     </>
// }
//
// export default withRouter(SideList)
