'use client'
import {Modal, Input, message, TreeSelect, Space, Button, Table} from 'antd'
import {useState, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {useRouter} from "next/navigation";
import {PlusOutlined} from "@ant-design/icons";
import {
    addFileCategory,
    addFileForQrcode,
    getFileListByPid,
    queryFileCategoryTreeList, queryFolderTreeList
} from "@/lib/slices/fileSpaceSlice";
import dayjs from "dayjs";
import {uploadFileAndReadByUrl} from "@/lib/slices/aiSpaceSlice";
import {convertSize} from "@/utils/help";

const SelectFileDlg = (props) => {
    const dispatch = useDispatch();
    const [input, setInput] = useState('')
    const [treeValue, setTreeValue] = useState(undefined)
    const [dlg, setDlg] = useState(props.dlg)
    const [categoryName, setCategoryName] = useState('');

    // const {noteCategoryTreeList} = useSelector(state => state.noteSpace)
    const {fileCategoryTreeList} = useSelector(state => state.fileSpace)
    const [fileList, setFileList] = useState([])
    const [chooseFile, setChooseFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [defaultSelectedRowKeys, setDefaultSelectedRowKeys] = useState([])
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);


    useEffect(() => {
        setDlg(props.dlg)
        if (props.dlg.show) {
            // setInput(props.dlg.data?.name)
            // setCategoryName('');
            setTreeValue(undefined)
            dispatch(queryFolderTreeList())
            setChooseFile(null)
            setFileList([])
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

        console.log('chooseFile=', chooseFile)
        if (!chooseFile) {
            message.warning('请先选择文件');
        } else {
            if (props.dlg.onOk) {
                // 将选中的文件传给父组件
                props.dlg.onOk(chooseFile)
                setTreeValue(undefined)
                setDlg({
                    show: false,
                })
            }
        }
    }


    async function changeCategory(data) {
        setTreeValue(data)
        // 查询该分类下的所有文件列表
        const res = await dispatch(getFileListByPid({
            pid: data
        }))
        console.log('res =', res)
        if (res.payload.status === 0) {
            const rs = res.payload.data.map(item => {
                return {
                    key: item.id,
                    name: item.name,
                    type: item.type,
                    url: item.url,
                    size: item.size,
                    createdDt: dayjs(item.createdDt).format('YYYY-MM-DD')
                }
            })
            setFileList(rs || [])
        } else {
            setFileList([])
        }
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            setSelectedRowKeys(selectedRowKeys);
            if (selectedRows.length > 0) {
                if (selectedRows.length === 1) {
                    setChooseFile(selectedRows[0])
                } else {
                    setChooseFile(selectedRows)
                }
            }
        },
        // getCheckboxProps: (record) => ({
        //     disabled: props.dlg.disableFileType && record.type !== props.dlg.disableFileType,
        //     // Column configuration not to be checked
        //     id: record.id,
        // }),
        getCheckboxProps: (record) => {
            // 获取文件后缀名（转换为小写）
            const fileName = record.name || '';
            const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';

            // 允许的文件类型，如：
            // allowedExtensions: [
            //     'doc', 'docx',       // Word
            //     'xls', 'xlsx',       // Excel
            //     'pdf',                // PDF
            //     'txt'                 // Text
            // ],
            if (props.dlg?.allowedExtensions?.length > 0) {
                // 如果后缀不在允许列表中，则禁用该行
                const isDisabled = !props.dlg?.allowedExtensions.includes(fileExtension);
                return {disabled: isDisabled};
            } else {

                return {disabled: false};
            }
        },
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
                <span>文件分类：</span>
                <TreeSelect
                    value={treeValue}
                    showSearch
                    treeDefaultExpandAll
                    style={{width: '100%'}}
                    dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                    treeDataSimpleMode={true}
                    placeholder="请选择文件分类"
                    treeNodeFilterProp="title"
                    onChange={changeCategory}
                    treeData={fileCategoryTreeList}>
                </TreeSelect>
                <span>文件列表：</span>
                <Table
                    bordered
                    size={'middle'}
                    rowSelection={{
                        type: props.multiple ? 'checkbox' : 'radio',
                        ...rowSelection,
                    }}
                    scroll={{
                        y: 300,
                    }}
                    pagination={false}
                    columns={[
                        {
                            title: '文件名',
                            dataIndex: 'name'
                        },
                        {
                            title: '创建时间',
                            width: 100,
                            dataIndex: 'createdDt'
                        },
                        {
                            title: '大小',
                            dataIndex: 'size',
                            width: 100,
                            render: (val) => {
                                return <span>{val !== 0 ? convertSize(val) : '0KB'}</span>
                            }
                        },
                        {
                            title: '预览',
                            dataIndex: 'name',
                            align: 'center',
                            width: 80,
                            render: (_, record) => <div className={'flex items-center justify-center'}>
                                {record.type === 'image' ?
                                    <img src={encodeURI(record.url)} width={50} height={50}/> : null}
                            </div>,
                        },
                    ]}
                    dataSource={fileList}
                />
            </div>
        </Modal>
    }


    return <div className={'flex flex-col gap-x-[12px]'}>
        {renderDlg()}
    </div>
}

export default SelectFileDlg;
