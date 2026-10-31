// 'use client'
// import {Button, Modal, Input, message} from 'antd';
// import {useCallback, useEffect, useState} from 'react'
// import {useDispatch} from "react-redux";
// import {useRouter, usePathname, useParams, useSearchParams} from "next/navigation";
// import {
//     addCategory,
//     queryCategory,
//     updateCategory
// } from '@/lib/slices/chatAiSpaceSlice'
//
// const ChartAiDlg = (props) => {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [input, setInput] = useState('')
//     const dispatch = useDispatch();
//     const router = useRouter();
//
//     useEffect(() => {
//         setIsModalOpen(props.show);
//         setInput(props.data && props.data.val || "")
//     }, [props.show])
//     const showModal = () => {
//         setIsModalOpen(true);
//     };
//     const handleOk = useCallback(async () => {
//         // setIsModalOpen(false);
//         if (input) {
//             let res = null;
//             if (props.action === 'add') {
//                 // 添加主分类
//                 res = await dispatch(addCategory({
//                     title: input
//                 }))
//             }
//             if (props.action === 'edit') {
//                 // 添加主分类
//                 res = await dispatch(updateCategory({
//                     title: input,
//                     cid: props.data.id
//                 }))
//             }
//             if (res && res.payload.status === 0) {
//                 message.success(props.action === 'add' ? "添加成功" : '编辑成功');
//                 // 添加成功，重新获取主分类列表
//                 // dispatch(queryFileCategory())
//                 if (props.ok) {
//                     props.ok(res?.payload?.data)
//                 }
//             } else {
//                 message.warning(props.action === 'add' ? "添加失败" : '编辑失败');
//             }
//
//         } else {
//             message.warning('请输入标题')
//         }
//     }, [input])
//     const handleCancel = () => {
//         // setIsModalOpen(false);
//         if (props.close) {
//             props.close()
//         }
//     };
//
//     return <div className={''}>
//         <Modal title="聊天标题"
//                width={360}
//                open={isModalOpen}
//                cancelText={'取消'}
//                okText={'确定'}
//                onOk={handleOk}
//                onCancel={handleCancel}>
//             <div className={'py-[12px]'}>
//                 <Input placeholder="请输入标题" value={input} onPressEnter={handleOk} onChange={(e) => {
//                     setInput(e.target.value)
//                 }}/>
//             </div>
//         </Modal>
//     </div>
// }
//
// export default ChartAiDlg