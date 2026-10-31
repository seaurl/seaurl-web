'use client'
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch} from "react-redux";
import {Button, Checkbox, Form, Input, message, Modal, Select, Switch} from "antd";
import classNames from "classnames/bind";
import {addMailProvider, updateMailProvider} from "@/lib/slices/mailSpaceSlice";

const MailboxDlg = ({dlg, onClose, onAddSuccess, onEditSuccess}) => {
    const {data: session} = useSession()
    const router = useRouter();
    const dispatch = useDispatch()

    const [form] = Form.useForm();
    const [formLayout, setFormLayout] = useState('horizontal');
    const [title, setTitle] = useState('')
    const [protocol, setProtocol] = useState('imaps')
    const [isAdvance, setAdvance] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        protocol: 'imaps',
        pullHost: '',
        pushHost: ''
    })
    const formItemLayout = {
        labelCol: {
            span: 6,
        },
        wrapperCol: {
            span: 18,
        },
    };
    useEffect(() => {
        if (dlg?.title) {
            setTitle(dlg.title)
        }
        if (!dlg?.show){
            form.resetFields()
        }
    }, [dlg?.show])

    const onFinish = (data) => {
        console.log('onFinish ---- data=', data)
    };

    function getEmailDomain(email) {
        // 提取 '@' 后面的域名部分
        const domain = email.split('@')[1];

        // 获取域名的主域名部分（去掉可能的子域名）
        const mainDomain = domain.split('.')[0];

        return mainDomain;
    }

    async function onSave() {

        const name = form.getFieldValue('name')
        const email = form.getFieldValue('email')
        const password = form.getFieldValue('password')

        if (!name) {
            return message.info("昵称不能为空")
        }

        if (dlg?.action === 'add'){
            if (!email) {
                return message.info("邮箱地址不能为空")
            }
            let testEmail = new RegExp(/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/);
            if (!testEmail.test(email)) {
                return message.info('邮箱账号不正确');
            }
            if (!password) {
                return message.info("密码或授权码不能为空")
            }
            console.log('------ getEmailDomain -----', getEmailDomain(email))
            const emailDomain = getEmailDomain(email)
            let params = {
                name,
                email,
                password
            }

            if (isAdvance) {
                const protocol = form.getFieldValue('protocol')
                const pullHost = form.getFieldValue('pullHost')
                const pushHost = form.getFieldValue('pushHost')
                if (!pullHost) {
                    return message.info("收件服务器不能为空")
                }
                if (!pushHost) {
                    return message.info("发件服务器不能为空")
                }
                console.log("protocol=", protocol)
                console.log("pullHost=", pullHost)
                console.log("pushHost=", pushHost)

                params.provider = emailDomain
                params.protocol = protocol

                if (protocol === 'imaps') {
                    params.imapHost = pullHost
                    params.imapPort = '993'
                    params.imapSslEnable = true
                }
                if (protocol === 'pop3s') {
                    params.popHost = pullHost
                    params.popPort = '995'
                    params.popSslEnable = true
                }
                params.smtpHost = pushHost
                params.smtpPort = '465'
                params.smtpSslEnable = true

                console.log('---params ---', params)
                setIsLoading(true)
                const res = await dispatch(addMailProvider(params))
                console.log('---res ---', res)
                setIsLoading(false)

                if (res.payload.status === 0) {
                    // message.success("添加邮箱成功，正在同步邮件...")
                    if (onAddSuccess) {
                        onAddSuccess(res.payload.data)
                    }
                } else {
                    message.error(res.payload.message || '添加失败，请检查您的账号、密码/授权码是否正确')
                }
            } else {
                params.protocol = `imaps`
                params.provider = emailDomain

                params.imapHost = `imap.${emailDomain}.com`
                params.imapPort = '993'
                params.imapSslEnable = true

                params.smtpHost = `smtp.${emailDomain}.com`
                params.smtpPort = '465'
                params.smtpSslEnable = true

                console.log('---params ---', params)
                setIsLoading(true)
                const res = await dispatch(addMailProvider(params))
                console.log('---res ---', res)
                setIsLoading(false)
                if (res.payload.status === 0) {
                    // message.success("添加邮箱成功，正在获取邮件...")
                    if (onAddSuccess) {
                        onAddSuccess(res.payload.data)
                    }
                } else {
                    message.error(res.payload.message || '添加失败，请检查您的账号、密码/授权码是否正确')
                }
            }
        }
        if (dlg?.action === 'edit' && dlg?.data?.email){
            const res = await dispatch(updateMailProvider({
                email: dlg.data.email,
                name: name
            }))
            if (res.payload.status === 0) {
                message.success("编辑昵称成功")
                if (onEditSuccess) {
                    onEditSuccess()
                }
            }else{
                message.error(res.payload.message || '编辑失败')
            }
        }
    }

    function handleOk() {
        form.submit()
        // if (onClose) {
        //     onClose()
        // }
    }

    function handleCancel() {
        if (onClose) {
            onClose()
        }
    }

    function onChangeProtocol(d) {
        console.log('onChangeProtocol -d -', d)
        // const protocol = form.getFieldValue('protocol')
        // console.log('protocol===', protocol)
        setProtocol(d)
    }

    return <div className={'flex flex-col gap-2'}>
        <Modal
            title={title}
            open={dlg?.show}
            maskClosable={false}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={<div className={classNames({
                'w-full flex items-center': true,
                'justify-end': isAdvance || dlg?.action === 'edit',
                'justify-between': !isAdvance && dlg?.action === 'add'
            })}>
                {
                    !isAdvance && dlg?.action === 'add' ? <div>
                        <Button onClick={() => {
                            setAdvance(true)
                            setTitle('高级设置')
                            // form.setFieldsValue({protocol: 'imap'});
                            setProtocol('imaps');
                        }}>高级设置</Button>
                    </div> : null
                }
                <div className={'flex items-center gap-1 '}>
                    <Button onClick={() => {
                        if (isAdvance) {
                            setAdvance(false)
                            setTitle(dlg?.title || '添加新邮箱')
                        } else {
                            handleCancel()
                        }
                    }}>{isAdvance?'返回':'关闭'}</Button>
                    <Button type={"primary"} onClick={onSave} loading={isLoading}>保存</Button>
                </div>
            </div>}>
            <div className={'py-6'}>
                <Form
                    layout={'horizontal'}
                    form={form}
                    initialValues={formData}
                    onFinish={onFinish}>
                    <Form.Item
                        {...formItemLayout}
                        name="name"
                        label="昵称">
                        <Input placeholder="请输入昵称"/>
                    </Form.Item>
                    {
                        dlg?.action === 'add'?<>
                            <Form.Item
                                {...formItemLayout}
                                name='email'
                                label="邮箱账号">
                                <Input placeholder="请输入邮箱账号"/>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                name='password'
                                label="密码/授权码">
                                <Input.Password placeholder="请输入密码或授权码"/>
                            </Form.Item>
                            {
                                isAdvance ? <>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="protocol"
                                        label="服务器协议">
                                        <Select
                                            placeholder="请选择协议"
                                            onChange={onChangeProtocol}>
                                            <Option value="imaps">IMAP</Option>
                                            <Option value="pop3s">POP</Option>
                                            {/*<Option value="exchange">Exchange</Option>*/}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        label="收件服务器"
                                        name="pullHost">
                                        <Input placeholder={protocol === 'imaps'?'imap.xxx.com':'pop.xxx.com'}/>
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        label="发件服务器"
                                        name="pushHost">
                                        <Input placeholder="smtp.xxx.com"/>
                                    </Form.Item>
                                </> : null}
                        </>:null
                    }
                </Form>
            </div>
        </Modal>
    </div>
};

export default withRouter(MailboxDlg);