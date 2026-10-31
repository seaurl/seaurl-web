'use client'
import {useState, useContext, useEffect, useRef} from "react";

import {
    Result,
    Row,
    Col,
    Menu,
    Tabs,
    Form,
    Input,
    InputNumber,
    Button,
    Avatar,
    Modal,
    Typography,
    Popconfirm,
    Checkbox,
    message
} from 'antd'

import {useDispatch, useSelector} from 'react-redux'
import {sendUpdateAccountEmail} from "@/lib/slices/settingSlice";
import {verifyCode} from '@/lib/slices/authSlice';
import {useAppSelector} from "@/lib/hooks";


const {Title, Paragraph, Text, Link} = Typography;

const AccountEmail = () => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const captchaVerifyParam = useRef("")
    const {accountInfo} = useAppSelector(state => state.auth)

    // const {accountUserInfo} = useSelector(state => state.setting)

    const [defaultEmail, setDefaultEmail] = useState((accountInfo && accountInfo.email) || '');
    const [loading, setLoading] = useState(false)

    let captcha;
    const getInstance = (instance) => {
        captcha = instance;
    };

    useEffect(() => {
        const sceneId = `${process.env.NEXT_PUBLIC_SCENE_ID}`
        if (sceneId){
            window.initAliyunCaptcha({
                SceneId: sceneId, // 场景ID。根据步骤二新建验证场景后，您可以在验证码场景列表，获取该场景的场景ID
                prefix: '7ccnze', // 身份标。开通阿里云验证码2.0后，您可以在控制台概览页面的实例基本信息卡片区域，获取身份标
                mode: 'popup', // 验证码模式。popup表示要集成的验证码模式为弹出式。无需修改
                element: '#captcha-element', // 页面上预留的渲染验证码的元素，与原代码中预留的页面元素保持一致。
                button: '#captcha-button', // 触发验证码弹窗的元素。button表示单击登录按钮后，触发captchaVerifyCallback函数。您可以根据实际使用的元素修改element的值
                captchaVerifyCallback: captchaVerifyCallback, // 业务请求(带验证码校验)回调函数，无需修改
                onBizResultCallback: onBizResultCallback, // 业务请求结果回调函数，无需修改
                getInstance: getInstance, // 绑定验证码实例函数，无需修改
                slideStyle: {
                    width: 360,
                    height: 40,
                }, // 滑块验证码样式，支持自定义宽度和高度，单位为px。其中，width最小值为320 px
                language: 'cn', // 验证码语言类型，支持简体中文（cn）、繁体中文（tw）、英文（en）
            });
        }

        return () => {
            // 必须删除相关元素，否则再次mount多次调用 initAliyunCaptcha 会导致多次回调 captchaVerifyCallback
            document.getElementById('aliyunCaptcha-mask')?.remove();
            document.getElementById('aliyunCaptcha-window-popup')?.remove();
        }
    }, []);


    const onFinish = async ({newEmail}) => {
        console.log('newEmail=>', newEmail)
        if (newEmail) {
            const testEmail = new RegExp(/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/);
            if (!testEmail.test(newEmail)) {
                return message.warning("新邮箱格式不正确，请重新输入")
            }
        } else {
            message.warning("请输入新邮箱")
            return
        }
        openVerifyDlg()
    }

    function openVerifyDlg() {
        // 获取元素
        const captchaButton = document.getElementById('captcha-button');
        captchaButton.addEventListener('click', () => {
            console.log('Button clicked!');

        });
        // 触发校验点击事件
        captchaButton.click();
    }

    const captchaVerifyCallback = async (param) => {
        const sceneId = `${process.env.NEXT_PUBLIC_SCENE_ID}`

        const res = await dispatch(verifyCode({
            captchaVerifyParam: param,
            sceneId
        }))
        console.log('sssss=', res)
        if (res.payload.status === 0) {
            return {
                captchaResult: res.payload.data
            }
        }
        return {
            captchaResult: false
        }
    }

    // 验证通过后调用
    const onBizResultCallback = async () => {
        console.log('onBizResultCallback',);
        await submitForm()
    }

    async function submitForm() {
        const newEmail = form.getFieldValue('newEmail')

        setLoading(true)
        const res = await dispatch(sendUpdateAccountEmail({
            newEmail,
            // captchaVerifyParam: captchaVerifyParam.current
        }))
        console.log('onFinish res=>', res)
        if (res.payload.status === 0) {
            message.success("我们已发送了一封验证邮件到您的新邮箱，请您及时查收并验证！")
        } else {
            message.warning(res.payload.errorMsg)
        }
        setLoading(false)
    }

    return <Row>
        <Col xs={24} sm={24} md={24} lg={15} xl={15} xxl={15}>
            {
                accountInfo ? <Form form={form} layout="vertical" initialValues={{
                    email: accountInfo && accountInfo.email
                }} onFinish={onFinish}>
                    <Form.Item name="email" label={<Text strong>当前邮箱</Text>} rules={[{}]}>
                        <Input disabled/>
                    </Form.Item>
                    <Form.Item name="newEmail" label={<Text strong>新的邮箱</Text>}>
                        <Input placeholder={'请输入新的邮箱'}/>
                    </Form.Item>
                    <Form.Item>
                        <Button type="default" htmlType="submit" loading={loading}>
                            更新邮箱
                        </Button>
                    </Form.Item>
                </Form> : null
            }
        </Col>
        <div id="captcha-button"/>
        <div id="captcha-element"/>
    </Row>
}

export default AccountEmail;
