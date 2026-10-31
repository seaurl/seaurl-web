'use client'
import {Modal, Input, message, TreeSelect} from 'antd'
import {useState, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
    addNoteCategory,
    queryNoteCategory,
    editNoteCategory,
    queryNoteCategoryTreeList
} from '@/lib/slices/noteSpaceSlice'
import {useRouter, useParams, useSearchParams} from "next/navigation";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";

/**
 * 标准dialog对话框显示方式
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const NoteCategoryDlg = (props) => {
    const dispatch = useDispatch();
    const query = useSearchParams()
    // const {query} = router;
    const [input, setInput] = useState('')
    const [dlg, setDlg] = useState(props.dlg)
    const [treeValue, setTreeValue] = useState(undefined);


    const {noteCategoryTreeList, noteCategories} = useSelector(state => state.noteSpace)

    useEffect(() => {
        setTreeValue('0')
        setDlg(props.dlg)
        setInput(props.dlg.input)
        dispatch(queryNoteCategoryTreeList())

        if (props.dlg.action === 'add' && query.get('cid')) {
            // const fs = noteCategories.filter(f => f.id === query.get('cid'))
            // if (fs.length > 0 && fs[0].pid) {
            //     setTreeValue(fs[0].pid)
            // }
            setTreeValue(query.get('cid'))
        }
        if (props.dlg.action === 'edit'){
            const fs = noteCategories.filter(f => f.id === query.get('cid'))
            if (fs.length > 0){
                setTreeValue(fs[0].pid)
            }
        }
        // if (props.dlg.action === 'add' && query.get('vid')) {
        //     setTreeValue(query.get('vid'))
        // }
    }, [props.dlg])

    function handleCancel() {
        setDlg({
            show: false,
        })
    }

    async function handleOk() {
        if (input) {
            let res = null;
            if (dlg.action === 'add') {
                // 添加主分类
                res = await dispatch(addNoteCategory({
                    name: input,
                    pid: treeValue
                }))
            }
            if (dlg.action === 'edit' && dlg.id) {
                if (treeValue === query.get('cid')) {

                } else {
                    res = await dispatch(editNoteCategory({
                        id: dlg.id,
                        name: input,
                        pid: treeValue
                    }))
                }

            }
            console.log('add category res =', res)
            if (res?.payload?.status === 0) {
                message.success(dlg.action === 'add' ? "添加成功" : '编辑成功');
                // 添加成功，重新获取主分类列表
                // dispatch(queryNoteCategory())
                setDlg({
                    show: false,
                })
                // 只有添加才变cid

                if (dlg.action === 'add') {
                    if (res?.payload?.data?.id) {
                        dispatch(queryNoteCategory())
                        // let str = 'cid=' + res?.payload?.data?.id
                        // if (treeValue && treeValue !== '0') {
                        //     str += '&vid=' + treeValue
                        // } else if (query.get('vid')) {
                        //     str += '&vid=' + query.get('vid')
                        // }
                        // shallowUpdateRouterParams(str)
                    }
                } else {
                    // 编辑情况下只需要查询即可
                    dispatch(queryNoteCategory())
                }
            } else {
                message.warning(dlg.action === 'add' ? "添加失败" : '编辑失败');
            }
        } else {
            message.warning('请输入分类名称')
        }

    }

    // 分类change事件
    function changeCategory(data) {
        console.log('dddd=', data)
        if (data) {
            setTreeValue(data)
        }
    }

    function getTeeData() {
        let treeData = [{
            id: '0',
            title: '全部分类',
            pId: '-1',
            value: '0'
        }]

        return treeData.concat(noteCategoryTreeList)
    }

    // 添加/编辑弹出框
    function renderDlg() {
        return <Modal
            title={dlg.title}
            open={dlg.show}
            confirmLoading={dlg.loading}
            okText="保存"
            cancelText="取消"
            maskClosable={false}
            width={360}
            onOk={handleOk}
            onCancel={handleCancel}>
            <div className={'flex flex-col gap-2'}>
                分类名：
                <Input placeholder="请输入分类名称" value={input} onPressEnter={handleOk} onChange={(e) => {
                    setInput(e.target.value)
                }
                }/>
            </div>
            {
                dlg.action === 'edit' || dlg.action === 'add' ? <div className={'flex flex-col gap-2 pt-2'}>
                    {dlg.action === 'add' ? '添加到：' : '移动到：'}
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
                        treeData={getTeeData()}
                    >
                    </TreeSelect>
                </div> : null
            }
        </Modal>
    }


    return <div className={''}>
        {renderDlg()}
    </div>
}

export default NoteCategoryDlg;
