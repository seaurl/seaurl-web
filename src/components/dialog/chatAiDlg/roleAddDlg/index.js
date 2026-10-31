'use client'
import {Button, Modal, Input, message, Avatar, Upload, Select, ColorPicker} from 'antd';
import {useCallback, useEffect, useState} from 'react'
import {useDispatch} from "react-redux";
import {useRouter, usePathname, useParams, useSearchParams} from "next/navigation";
import {PlusOutlined, UploadOutlined, UserOutlined} from "@ant-design/icons";
import {addAiRole, editAiRole} from "@/lib/slices/aiSpaceSlice";

const {TextArea} = Input;

const ChartAiDlg = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roleName, setRoleName] = useState('')
    const [roleDesc, setRoleDesc] = useState('')
    const [roleCommand, setRoleCommand] = useState('')
    const dispatch = useDispatch();
    const router = useRouter();
    const [rdm, setRdm] = useState('1')
    const [color, setColor] = useState('#1677ff')
    const [chooseAvatar, setChooseAvatar] = useState('')

    useEffect(() => {
        setIsModalOpen(props.dlg.show);

        if (props.dlg.action === 'add') {
            setRoleName('')
            setRoleDesc('')
            setRoleCommand('')
            setColor('#1677ff')
        }
        if (props.dlg.action === 'edit' && props.dlg.data) {
            console.log('-----------props.dlg.data------------', props.dlg.data)

            // 创建 URL 对象
            const urlObj = new URL(props.dlg.data.avatar);

            // 使用 URLSearchParams 获取参数
            const params = new URLSearchParams(urlObj.search);
            const seed = params.get("seed");
            setRoleName(props.dlg.data.name)
            setRoleDesc(props.dlg.data.desc)
            setRoleCommand(props.dlg.data.command)
            setColor(props.dlg.data.background)
            setRdm(seed)
        }
    }, [props.dlg.show])

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        // setIsModalOpen(false);

        if (!roleName.trim()) {
            return message.warning('请输入角色名称')
        }
        if (!roleDesc.trim()) {
            return message.warning('请输入签名')
        }
        if (!roleCommand.trim()) {
            return message.warning('请输入指令')
        }

        let res = null
        if (props.dlg.action === 'add') {
            // 添加主分类
            res = await dispatch(addAiRole({
                groupId: props.dlg.groupId,
                name: roleName,
                desc: roleDesc,
                command: roleCommand,
                avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${rdm}`,
                background: color
            }))
        }
        if (props.dlg.action === 'edit') {
            // 添加主分类
            res = await dispatch(editAiRole({
                id: props.dlg.data.id,
                name: roleName,
                desc: roleDesc,
                command: roleCommand,
                avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${rdm}`,
                background: color
            }))
        }


        if (res && res.payload.status === 0) {
            message.success(props.dlg.action === 'add' ? "添加成功" : '编辑成功');
            if (props.ok) {
                props.ok(true)
            }
        } else {
            message.warning(props.dlg.action === 'add' ? "添加失败" : '编辑失败');
        }
        // if (input) {
        //     let res = null;
        //     if (props.action === 'add') {
        //         // 添加主分类
        //         res = await dispatch(addAiRole({
        //             title: input
        //         }))
        //     }
        //     if (props.action === 'edit') {
        //         // 添加主分类
        //         res = await dispatch(updateCategory({
        //             title: input,
        //             cid: props.data.id
        //         }))
        //     }
        //     if (res && res.payload.status === 0) {
        //         message.success(props.action === 'add' ? "添加成功" : '编辑成功');
        //         // 添加成功，重新获取主分类列表
        //         // dispatch(queryFileCategory())
        //         if (props.ok) {
        //             props.ok(res?.payload?.data)
        //         }
        //     } else {
        //         message.warning(props.action === 'add' ? "添加失败" : '编辑失败');
        //     }
        //
        // } else {
        //     message.warning('请输入标题')
        // }
    }

    const handleCancel = () => {
        // setIsModalOpen(false);
        if (props.close) {
            props.close()
        }
    };

    function onChooseAvatar(d) {
        setChooseAvatar(`https://api.dicebear.com/7.x/miniavs/svg?seed=${d}`)
    }


    return <div className={''}>
        <Modal title={props.dlg.title || ''}
               width={500}
               open={isModalOpen}
               cancelText={'取消'}
               okText={'确定'}
               onOk={handleOk}
               onCancel={handleCancel}>
            <div className={'py-[12px] flex gap-6 flex-col'}>
                <div className={'flex items-center gap-6'}>
                    <div className={'flex flex-col gap-4 w-[80px]'}>
                        {/*<div className={'flex items-center justify-between'}>头像：</div>*/}
                        <div className={'flex flex-col items-center justify-center gap-2'}>
                            <div className={'cursor-pointer rounded-full border border-[#ddd] p-1'} onClick={() => {
                                const randomNumber = Math.floor(Math.random() * 1000) + 1;
                                setRdm(randomNumber)
                            }}>
                                <Avatar size={60}
                                        src={chooseAvatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${rdm}`}/>
                            </div>
                            {/*<div>*/}
                            {/*    <Button icon={<PlusOutlined />} >上传头像</Button>*/}
                            {/*</div>*/}
                        </div>
                    </div>
                    <div className={'flex flex-col gap-2 w-full'}>
                        <span>角色名：</span>
                        <Input placeholder="请输入" maxLength={20} value={roleName} onChange={(e) => {
                            setRoleName(e.target.value)
                        }}/>
                    </div>
                </div>

                <div className={'flex flex-col gap-2'}>
                    <span>签名：</span>
                    <TextArea minRows={6} placeholder="介绍下该角色"
                              showCount
                              maxLength={1200}
                              value={roleDesc} onChange={(e) => {
                        setRoleDesc(e.target.value)
                    }}/>
                </div>
                <div className={'flex flex-col gap-2'}>
                    <span>指令：</span>
                    <TextArea minRows={6} placeholder="在这里输入指令"
                              showCount
                              maxLength={1200}
                              value={roleCommand} onChange={(e) => {
                        setRoleCommand(e.target.value)
                    }}/>
                </div>
                <div className={'flex flex-colpb-4'}>
                    <span>背景色：</span>
                    <ColorPicker value={color} onChange={(d) => {
                        console.log('-----d------', d.toHexString())
                        setColor(d.toHexString())
                    }}/>
                </div>
                {/*<div className={'flex flex-col gap-2'}>*/}
                {/*    <span>模型：</span>*/}
                {/*    <Select*/}
                {/*        defaultValue="lucy"*/}
                {/*        style={{ width: '100%' }}*/}
                {/*        options={[*/}
                {/*            { value: 'jack', label: 'DeepSeek-V3' },*/}
                {/*            { value: 'lucy', label: 'DeepSeek-R1' },*/}
                {/*            { value: 'Yiminghe', label: '通义千问' },*/}
                {/*            { value: 'disabled', label: '文心一言' },*/}
                {/*            { value: 'disabled', label: '豆包' },*/}
                {/*        ]}*/}
                {/*    />*/}
                {/*</div>*/}

            </div>
        </Modal>
    </div>
}

export default ChartAiDlg
