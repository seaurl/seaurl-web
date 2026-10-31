'use client'
import {Modal, Input, message, TreeSelect, Space, Button} from 'antd'
import {useState, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
    addNoteCategory,
    queryNoteCategoryTreeList,
    addNoteForAi
} from '@/lib/slices/noteSpaceSlice'
import {useRouter} from "next/navigation";
import {PlusOutlined} from "@ant-design/icons";

const NoteCreateForAiDlg = (props) => {
    const dispatch = useDispatch();
    const [input, setInput] = useState('')
    const [treeValue, setTreeValue] = useState([])
    const [dlg, setDlg] = useState(props.dlg)
    const [categoryName, setCategoryName] = useState('');

    const {noteCategoryTreeList} = useSelector(state => state.noteSpace)

    useEffect(() => {
        setDlg(props.dlg)
        if (props.dlg.show) {
            setInput(props.dlg.input)
            setCategoryName('');
            dispatch(queryNoteCategoryTreeList())
        }
    }, [props.dlg])

    function handleCancel() {
        setDlg({
            show: false,
        })
        setTreeValue([])
    }

    // 移动笔记成功
    async function handleOk() {
        console.log('treeValue=', treeValue)

        if (input.trim().length <= 0) {
            return message.warning('笔记标题不能为空');
        }
        if (props.dlg.message.trim().length <= 0) {
            return message.warning('笔记内容不能为空');
        }
        if (treeValue.length <= 0) {
            message.warning('笔记分类不能为空');
        } else {
            const res = await dispatch(addNoteForAi({
                title: input.trim(),
                categoryId: treeValue[0],
                content: props.dlg.message
            }))
            if (res.payload.status === 0) {
                message.success("添加成功")
                setDlg({
                    show: false,
                })
                setTreeValue([])
            }
        }
    }


    function changeCategory(data) {
        console.log('data=', data)
        setTreeValue([data])
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

        const res = await dispatch(addNoteCategory({
            name: categoryName,
            pid: treeValue[0] || '0'
        }))
        console.log('res===', res)
        if (res) {
            setCategoryName('');
            dispatch(queryNoteCategoryTreeList())
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
                <Input placeholder="请输入笔记标题" value={input} className={'w-full'} onChange={(e) => {
                    setInput(e.target.value)
                }}/>
                <TreeSelect
                    showSearch
                    treeDefaultExpandAll
                    style={{width: '100%'}}
                    value={treeValue}
                    dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                    dropdownRender={(props) => {
                        return <div style={{padding: '8px'}}>
                            {props}
                            <div className={'flex items-center border-0'}>
                                <Input
                                    value={categoryName}
                                    placeholder="请输入分类名称"
                                    onChange={onCategoryNameChange}
                                    suffix={null}
                                />
                                <Button type="link" icon={<PlusOutlined/>}
                                        onClick={btnAddCategory}>添加分类</Button>
                            </div>
                        </div>
                    }}
                    treeDataSimpleMode={true}
                    treeNodeFilterProp="title"
                    placeholder="请选择笔记分类"
                    onChange={changeCategory}
                    treeData={noteCategoryTreeList}>
                </TreeSelect>
            </div>
        </Modal>
    }


    return <div className={'flex flex-col gap-x-[12px]'}>
        {renderDlg()}
    </div>
}

export default NoteCreateForAiDlg;
