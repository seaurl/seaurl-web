'use client'
import {Modal, Input, message, TreeSelect, Space, Button, Table} from 'antd'
import {useState, useEffect, useRef} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {useRouter} from "next/navigation";
import {PlusOutlined} from "@ant-design/icons";
import {
    addFileCategory,
    addFileForQrcode,
    getFileListByCid,
    queryFileCategoryTreeList
} from "@/lib/slices/fileSpaceSlice";
import dayjs from "dayjs";
import {uploadFileAndReadByUrl} from "@/lib/slices/aiSpaceSlice";
import {convertSize} from "@/utils/help";
import {getNoteListByCategoryId, queryNoteCategoryTreeList} from "@/lib/slices/noteSpaceSlice";

const SelectNoteDlg = (props) => {
    const dispatch = useDispatch();
    const [input, setInput] = useState('')
    const [treeValue, setTreeValue] = useState(undefined)
    const [dlg, setDlg] = useState(props.dlg)
    const [categoryName, setCategoryName] = useState('');
    const [noteList, setNoteList] = useState([])
    const [chooseNote, setChooseNote] = useState(null)
    const [loading, setLoading] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const {noteCategoryTreeList} = useSelector(state => state.noteSpace)
    const abortControllerRef = useRef(null)


    useEffect(() => {
        setDlg(props.dlg)
        if (props.dlg.show) {
            // setInput(props.dlg.data?.name)
            // setCategoryName('');
            setTreeValue(undefined)
            dispatch(queryNoteCategoryTreeList())
            setChooseNote(null)
            setNoteList([])
            setSelectedRowKeys([])
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
        console.log('chooseNote=', chooseNote)
        if (!chooseNote) {
            message.warning('请先选择文件');
        } else {
            if (props.dlg.onOk) {
                // 将选中的文件传给父组件
                props.dlg.onOk(chooseNote)
                setTreeValue(undefined)
                setDlg({
                    show: false,
                })
            }
        }
    }

    function removeHtmlTags(html) {
        // 创建一个临时的DOM元素
        var tempElement = document.createElement("div");
        // 设置其innerHTML为富文本内容
        tempElement.innerHTML = html;
        // 使用textContent或innerText获取纯文本内容
        return tempElement.textContent || tempElement.innerText || "";
    }
    async function changeCategory(data) {
        setTreeValue(data)
        if (abortControllerRef.current?.abort) {
            abortControllerRef.current.abort();
        }
        // 创建新的 AbortController
        abortControllerRef.current = new AbortController();
        // 查询该分类下的文件列表
        const res = await dispatch(getNoteListByCategoryId({
            categoryId: data,
            abortController: abortControllerRef.current

        }))
        console.log('res =', res)
        if (res.payload.status === 0) {
            const rs = res.payload.data.map(item => {

                return {
                    key: item.id,
                    name: item.title,
                    categoryId: item.categoryId,
                    content: removeHtmlTags(item.content),
                    createdDt: dayjs(item.createdDt).format('YYYY-MM-DD')
                }
            })
            setNoteList(rs || [])
        } else {
            setNoteList([])
        }
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            setSelectedRowKeys(selectedRowKeys);

            if (selectedRows.length > 0) {
                setChooseNote(selectedRows[0])
            }
        },
        getCheckboxProps: (record) => ({
            disabled: props.dlg.disableFileType && record.type !== props.dlg.disableFileType,
            // Column configuration not to be checked
            id: record.id,
        }),
    };

    // 添加/编辑弹出框
    function renderDlg() {
        return <Modal
            title={dlg.title}
            open={dlg.show}
            width={650}
            okText="确定"
            cancelText="取消"
            okButtonProps={{
                loading: loading
            }}
            maskClosable={false}
            onOk={handleOk}
            onCancel={handleCancel}>
            <div className={'flex flex-col gap-2'}>
                <span>笔记分类：</span>
                <TreeSelect
                    value={treeValue}
                    showSearch
                    treeDefaultExpandAll
                    style={{width: '100%'}}
                    dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                    treeDataSimpleMode={true}
                    placeholder="请选择笔记分类"
                    treeNodeFilterProp="title"
                    onChange={changeCategory}
                    treeData={noteCategoryTreeList}>
                </TreeSelect>
                <span>笔记列表：</span>
                <Table
                    bordered
                    size={'middle'}
                    rowSelection={{
                        type: 'radio',
                        ...rowSelection,
                    }}
                    scroll={{
                        y: 300,
                    }}
                    pagination={false}
                    columns={[
                        {
                            title: '笔记标题',
                            dataIndex: 'name'
                        },
                        {
                            title: '内容',
                            dataIndex: 'content'
                        },
                        {
                            title: '创建时间',
                            width: 100,
                            dataIndex: 'createdDt'
                        },

                    ]}
                    dataSource={noteList}
                />
            </div>
        </Modal>
    }


    return <div className={'flex flex-col gap-x-[12px]'}>
        {renderDlg()}
    </div>
}

export default SelectNoteDlg;
