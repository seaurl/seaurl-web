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

const InputDlg = (props) => {
    const dispatch = useDispatch();
    const [input, setInput] = useState('')
    const [dlg, setDlg] = useState(props.dlg)

    useEffect(() => {
        setDlg(props.dlg)
        if (props.dlg.show) {
            setInput(props.dlg.data?.title)
        }
    }, [props.dlg])

    function handleCancel() {
        setDlg({
            show: false,
        })
    }

    // 移动笔记成功
    async function handleOk() {
        if (input.trim().length <= 0) {
            return message.warning('标题不能为空');
        }
        if (props.onOk){
            props.onOk(input.trim())
        }
        setDlg({
            show: false,
        })
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
                <Input placeholder="请输入"
                       suffix={props.dlg?.data?.suffix || ''}
                       value={input}
                       className={'w-full'}
                       onPressEnter={handleOk}
                       onChange={(e) => {
                           setInput(e.target.value)
                       }}/>
            </div>
        </Modal>
    }


    return <div className={'flex flex-col gap-x-[12px]'}>
        {renderDlg()}
    </div>
}

export default InputDlg;
