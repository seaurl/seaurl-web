'use client'
import {Input, message, Modal, TreeSelect} from 'antd'
import {useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {addUrlCategory, editUrlCategory, queryUrlCategory, queryUrlCategoryTreeList} from '@/lib/slices/urlSpaceSlice'
import {useRouter, useSearchParams, useParams} from "next/navigation";
import {queryNoteCategory} from "@/lib/slices/noteSpaceSlice";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";

/**
 * 标准dialog对话框显示方式
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const UrlCategoryDlg = (props) => {
    const dispatch = useDispatch();
    const router = useRouter();
    // const {query} = router;
    const query = useSearchParams()
    const routerParams = useParams()
    const [input, setInput] = useState('')
    const [dlg, setDlg] = useState(props.dlg)
    const [treeValue, setTreeValue] = useState(undefined);

    const {categoryTreeList, urlCategories} = useSelector(state => state.urlSpace)


    useEffect(() => {
        setTreeValue('0')
        setDlg(props.dlg)
        setInput(props.dlg.input)
        dispatch(queryUrlCategoryTreeList())

        if (props.dlg.action === 'add' && query.get('cid')) {
            console.log('---- cid ----', query.get('cid'))
            setTreeValue(query.get('cid'))
        }
        if (props.dlg.action === 'edit'){
            const fs = urlCategories.filter(f => f.id === query.get('cid'))
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
                res = await dispatch(addUrlCategory({
                    name: input,
                    pid: treeValue
                }))
            }
            if (dlg.action === 'edit' && dlg.id) {
                if (treeValue === query.get('cid')) {

                } else {
                    res = await dispatch(editUrlCategory({
                        id: dlg.id,
                        name: input,
                        pid: treeValue
                    }))
                }

            }

            if (res && res.payload.status === 0) {
                message.success(dlg.action === 'add' ? "添加成功" : '编辑成功');
                setDlg({
                    show: false,
                })
                // 添加成功，重新获取主分类列表
                dispatch(queryUrlCategory())

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

        return treeData.concat(categoryTreeList)
    }

    // 添加/编辑弹出框
    function renderDlg() {
        return <Modal
            title={dlg.title}
            open={dlg.show}
            confirmLoading={dlg.loading}
            width={360}
            okText="保存"
            cancelText="取消"
            maskClosable={false}
            onOk={handleOk}
            onCancel={handleCancel}>
            <div className={'flex flex-col gap-1'}>
                <div>
                    分类名：
                </div>
                <Input placeholder="请输入分类名称" value={input} onPressEnter={handleOk} onChange={(e) => {
                    setInput(e.target.value)
                }
                }/>
            </div>
            {
                dlg.action === 'edit' || dlg.action === 'add' ? <div className={'flex flex-col gap-1'}>
                    <div className={'pt-2'}>
                        {dlg.action === 'add' ? '添加到：' : '移动到：'}
                    </div>
                    <TreeSelect
                        showSearch
                        treeDefaultExpandAll
                        style={{width: '100%'}}
                        value={treeValue}
                        dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                        treeDataSimpleMode={true}
                        treeNodeFilterProp="title"
                        placeholder="请选择分类"
                        onChange={changeCategory}
                        treeData={getTeeData()}>
                    </TreeSelect>
                </div> : null
            }
        </Modal>
    }


    return <div className={''}>
        {renderDlg()}
    </div>
}

export default UrlCategoryDlg;
