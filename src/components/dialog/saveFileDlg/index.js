'use client'
import {Modal, Input, message, TreeSelect, Space, Button} from 'antd'
import {useState, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {useRouter} from "next/navigation";
import {PlusOutlined} from "@ant-design/icons";
import {
    addFileCategory,
    addFileForQrcode,
    queryFileCategoryTreeList,
    addFileForQrcodeAndRead,
    queryFolderTreeList
} from "@/lib/slices/fileSpaceSlice";

const SaveFileDlg = (props) => {
    const dispatch = useDispatch();
    const [input, setInput] = useState('')
    const [treeValue, setTreeValue] = useState(undefined)
    const [dlg, setDlg] = useState(props.dlg)
    const [categoryName, setCategoryName] = useState('');

    // const {noteCategoryTreeList} = useSelector(state => state.noteSpace)
    const {fileCategoryTreeList} = useSelector(state => state.fileSpace)

    useEffect(() => {
        setDlg(props.dlg)
        if (props.dlg.show) {
            setInput(props.dlg.data?.name)
            setCategoryName('');
            setTreeValue(undefined)
            dispatch(queryFolderTreeList())
        }
    }, [props.dlg])

    function handleCancel() {
        setDlg({
            show: false,
        })
        setTreeValue('')
    }

    // 移动笔记成功
    async function handleOk() {
        console.log('treeValue=', treeValue)

        if (input.trim().length <= 0) {
            return message.warning('文件标题不能为空');
        }
        if (!treeValue) {
            message.warning('请选择文件夹');
        } else {
            if (props.dlg.onOk){
                props.dlg.onOk({
                    fileName: input.trim(),
                    pid: treeValue
                })
            }
            setDlg({
                show: false,
            })
            setTreeValue(undefined)
            // let res = null
            // if (props.dlg.type === 'save'){
            //     res = await dispatch(addFileForQrcode({
            //         fileName: input.trim(),
            //         categoryId: treeValue,
            //         qrcodeImg: props.dlg.data.image
            //     }))
            // }
            // if (props.dlg.type === 'saveAndRead'){
            //     res = await dispatch(addFileForQrcodeAndRead({
            //         fileName: input.trim(),
            //         categoryId: treeValue,
            //         file: props.dlg.data.file
            //     }))
            // }
            // if (res){
            //     if (res.payload.status === 0 && res.payload.data) {
            //         if (props.dlg.onOk){
            //             props.dlg.onOk(res.payload.data)
            //         }
            //         if (props.dlg.type === 'save'){
            //             message.success("添加成功")
            //         }
            //
            //     }else{
            //         if (props.dlg.type === 'save'){
            //             message.info("添加失败")
            //         }
            //         if (props.dlg.type === 'saveAndRead'){
            //             message.info("解析失败")
            //         }
            //     }
            //     setDlg({
            //         show: false,
            //     })
            //     setTreeValue(undefined)
            // }
        }
    }


    function changeCategory(data) {
        setTreeValue(data)
    }

    const onCategoryNameChange = event => {
        setCategoryName(event.target.value);
    };

    async function btnAddCategory(e) {
        if (!categoryName) {
            message.warning('请输入分类名称');
            return
        }
        console.log('treeValue=', treeValue)
        // if (treeValue.length<=0) {
        //   message.warning('请先选择分类');
        //   return
        // }
        const res = await dispatch(addFileCategory({
            name: categoryName,
            pid: treeValue || '0'
        }))
        console.log('res===', res)
        if (res) {
            setCategoryName('');
            dispatch(queryFileCategoryTreeList())
            message.success('添加成功');
        }
    }

    // 添加/编辑弹出框
    function renderDlg() {
        return <Modal
            title={dlg.title}
            open={dlg.show}
            width={400}
            okText="保存"
            cancelText="取消"
            maskClosable={false}
            onOk={handleOk}
            onCancel={handleCancel}>
            <div className={'flex flex-col gap-4'}>
                <Input placeholder="请输入文件名"
                       suffix={props.dlg?.data?.suffix || ''}
                       value={input}
                       className={'w-full'}
                       onChange={(e) => {
                    setInput(e.target.value)
                }}/>
                <TreeSelect
                    value={treeValue}
                    showSearch
                    treeDefaultExpandAll
                    style={{width: '100%'}}
                    dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                    // dropdownRender={(props) => {
                    //     return <div style={{padding: '8px'}}>
                    //         {props}
                    //         <div className={'flex items-center border-0'}>
                    //             <Input
                    //                 value={categoryName}
                    //                 placeholder="请输入分类名称"
                    //                 onChange={onCategoryNameChange}
                    //                 suffix={null}
                    //             />
                    //             <Button type="link" icon={<PlusOutlined/>}
                    //                     onClick={btnAddCategory}>添加分类</Button>
                    //         </div>
                    //     </div>
                    // }}
                    treeDataSimpleMode={true}
                    placeholder="请选择文件分类"
                    treeNodeFilterProp="title"
                    onChange={changeCategory}
                    treeData={fileCategoryTreeList}>
                </TreeSelect>
            </div>
        </Modal>
    }


    return <div className={'flex flex-col gap-x-[12px]'}>
        {renderDlg()}
    </div>
}

export default SaveFileDlg;
