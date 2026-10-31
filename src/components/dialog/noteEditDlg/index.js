'use client'
import {Modal, Input, message, TreeSelect} from 'antd'
import {useState, useEffect, useRef} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
    getNoteListByCategoryId,
    queryNoteCategoryTreeList,
    editNoteCategoryId, getMyRecentlyNotes
} from '@/lib/slices/noteSpaceSlice'
import {useRouter, useParams, useSearchParams} from "next/navigation";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";

const NoteEditDlg = (props) => {
    const dispatch = useDispatch();
    const router = useRouter();
    // const {query} = router;
    const routerParams = useParams()
    const query = useSearchParams()
    const [input, setInput] = useState('')
    const [treeValue, setTreeValue] = useState(undefined)
    const [dlg, setDlg] = useState(props.dlg)

    const { noteCategoryTreeList, notes} = useSelector(state => state.noteSpace)
    const abortControllerRef = useRef(null)


    useEffect(() => {
        setDlg(props.dlg)
        if (props.dlg.show) {
            dispatch(queryNoteCategoryTreeList())
        }
        return (() => {
            setTreeValue(undefined)
        })
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
        setTreeValue('')
        if (!treeValue) {
            message.warning('笔记分类不能为空');
        } else {
            const res1 = await dispatch(editNoteCategoryId({
                noteId: query.get('nid'),
                categoryId: treeValue
            }))
            setDlg({
                show: false,
            })
            if (res1.payload?.status === 0) {
                let cid = query.get('cid')
                let vid = query.get('vid')

                let noteRes = []
                // 判断有无cid，没有则查询最近的笔记列表
                if (cid){
                    if (abortControllerRef.current?.abort) {
                        abortControllerRef.current.abort();
                    }
                    // 创建新的 AbortController
                    abortControllerRef.current = new AbortController();
                    noteRes =  await dispatch(getNoteListByCategoryId({
                        categoryId: cid,
                        abortController: abortControllerRef.current
                    }))
                }else{
                    noteRes =  await dispatch(getMyRecentlyNotes())
                }

                console.log('move noteRes=', noteRes)
                let params = []
                if (cid) {
                    params.push(`cid=${cid}`)
                }
                if (vid) {
                    params.push(`vid=${vid}`)
                }
                if (noteRes?.payload?.status === 0&& noteRes?.payload?.data?.length>0){
                    params.push(`nid=${noteRes?.payload?.data[0].id}`)
                }
                shallowUpdateRouterParams(`${params.join('&')}`)
            }
        }
    }


    function changeCategory(data) {
        console.log('data=', data)
        setTreeValue(data)
    }

    // 添加/编辑弹出框
    function renderDlg() {
        return <Modal
            title={dlg.title}
            open={dlg.show}
            okText="保存"
            cancelText="取消"
            maskClosable={false}
            width={360}
            onOk={handleOk}
            onCancel={handleCancel}>
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
                treeData={noteCategoryTreeList}
            >
            </TreeSelect>
        </Modal>
    }


    return <div className={''}>
        {renderDlg()}
    </div>
}

export default NoteEditDlg;
