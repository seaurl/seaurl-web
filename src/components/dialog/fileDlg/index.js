'use client'
import {Modal, Input, message, TreeSelect} from 'antd'
import {useState, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
    addFileCategory,
    queryFileCategory,
    editFileCategory,
    editFileName,
    moveFileTo,
    // deleteNoteCategory,
    // getUrlByCategory,
    // setChoosedCategory,
    queryFileCategoryTreeList, createOfficeFile, queryFolderList
} from '@/lib/slices/fileSpaceSlice'
import {useRouter, useParams, usePathname, useSearchParams} from "next/navigation";

/**
 * 标准dialog对话框显示方式
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const FileCategoryDlg = (props) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [input, setInput] = useState('')
    const [dlg, setDlg] = useState(props.dlg)
    const [loading, setLoading] = useState(false)
    const [treeValue, setTreeValue] = useState(undefined);

    const {fileFolderTreeList} = useSelector(state => state.fileSpace)

    useEffect(() => {
        console.log('props.dlg=', props.dlg)
        setDlg(props.dlg)
        setInput(props.dlg.name)
        // setTreeValue(props.dlg.categoryId)
        if (props.dlg.show) {
            setTreeValue(undefined)
            dispatch(queryFolderList({
                files: props.dlg.files
            }))
        }

    }, [props.dlg])

    function handleCancel() {
        setDlg({
            show: false,
        })
    }

    async function handleOk() {
        setLoading(true)
        return new Promise(async (resolve, reject) => {
            if (dlg.action === 'new'){
                if (input) {
                    const res = await dispatch(createOfficeFile({
                        fileType: dlg.type,
                        fileName: input,
                        fullPath: dlg.fullPath
                    }))
                    if (res && res.payload.status === 0 && res.payload.data) {
                        message.success('创建成功');
                        setDlg({
                            show: false,
                        })
                        if (props.success) {
                            props.success(res.payload.data)
                        }
                    } else {
                        message.warning('创建失败');
                    }
                } else {
                    message.warning('请输入文件名')
                }
            }
            if (dlg.action === 'edit' && dlg.id) {
                if (input) {
                    const res = await dispatch(editFileName({
                        id: dlg.id,
                        name: input
                    }))
                    if (res && res.payload.status === 0) {
                        message.success('编辑成功');
                        setDlg({
                            show: false,
                        })
                        if (props.success) {
                            props.success()
                        }
                    } else {
                        message.warning('编辑失败');
                    }
                } else {
                    message.warning('请输入文件名')
                }
            }

            if (dlg.action === 'move') {
                const res = await dispatch(moveFileTo({
                    files: dlg.files,
                    fid: treeValue
                }))
                if (res && res.payload.status === 0) {
                    message.success('移动成功');
                    setDlg({
                        show: false,
                    })
                    if (props.success) {
                        props.success()
                    }
                } else {
                    message.warning('移动失败');
                }
            }

            setLoading(false)
            resolve()
        })
    }

    // 分类change事件
    function changeCategory(data) {
        if (data) {
            setTreeValue(data)
        }
    }

    // 添加/编辑弹出框
    function renderDlg() {
        return <Modal
            title={dlg.title}
            open={dlg.show}
            confirmLoading={loading}
            okText="保存"
            width={360}
            cancelText="取消"
            maskClosable={false}
            onOk={handleOk}
            onCancel={handleCancel}>
            {
                ['edit', 'new'].includes(dlg.action) ? <div>
                    <div className={'pb-2'}>
                        {dlg.type ==='folder'?'文件夹名称':'文件名'}：
                    </div>
                    <Input placeholder="请输入" value={input} onPressEnter={handleOk} onChange={(e) => {
                        // 限制输入非法字符
                        const illegalChars = /[<>:"\/\\|?*]/g;
                        setInput(e.target.value.replace(illegalChars, ''))
                    }
                    }/>
                </div> : null
            }

            {
                dlg.action === 'move' ? <div>
                    <div className={'pb-2'}>
                        移动到：
                    </div>
                    <TreeSelect
                        showSearch
                        treeDefaultExpandAll
                        style={{width: '100%'}}
                        value={treeValue}
                        dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                        treeDataSimpleMode={true}
                        placeholder="请选择分类"
                        treeNodeFilterProp="title"
                        onChange={changeCategory}
                        treeData={fileFolderTreeList}>
                    </TreeSelect>
                </div> : null
            }
        </Modal>
    }

    return <div className={''}>
        {renderDlg()}
    </div>
}

export default FileCategoryDlg;
