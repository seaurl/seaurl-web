'use client'
import {useState, useEffect, memo, useRef, useCallback} from "react";
import {useRouter} from "next/navigation";
import {Form, Input, Button, Checkbox, message, Alert} from "antd";

import {register, rendAccountEmail, verifyCode} from '@/lib/slices/authSlice';
import RegisterSuccessAlert from "@/components/alert/registerSuccessAlert";
import {useAppDispatch} from "@/lib/hooks";

const layout = {
    labelCol: {span: 24},
    wrapperCol: {span: 24}
};

const Register = props => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();

    const router = useRouter();
    const [isloading, setIsloading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [error, setError] = useState({
        show: false,
        content: ""
    });
    const [isOnline, setOnline] = useState(true)

    const globalUserName = useRef("");

    const clickType = useRef("")
    const captchaVerifyParam = useRef("")

    useEffect(() => {
        window.addEventListener("offline", changeOffline);
        window.addEventListener('online', changeOnline);

        if (!captcha1){
            const sceneId = `${process.env.NEXT_PUBLIC_SCENE_ID}`

            // 注册时检验
            window.initAliyunCaptcha({
                SceneId: sceneId, // 场景ID。根据步骤二新建验证场景后，您可以在验证码场景列表，获取该场景的场景ID
                prefix: '7ccnze', // 身份标。开通阿里云验证码2.0后，您可以在控制台概览页面的实例基本信息卡片区域，获取身份标
                mode: 'popup', // 验证码模式。popup表示要集成的验证码模式为弹出式。无需修改
                // mode: 'embed', // 验证码模式。embed表示要集成的验证码模式为嵌入式。无需修改
                element: '#captcha-element', // 页面上预留的渲染验证码的元素，与原代码中预留的页面元素保持一致。
                button: '#captcha-button', // 触发验证码弹窗的元素。button表示单击登录按钮后，触发captchaVerifyCallback函数。您可以根据实际使用的元素修改element的值
                captchaVerifyCallback: (param)=>captchaVerifyCallback(param), // 业务请求(带验证码校验)回调函数，无需修改
                onBizResultCallback: ()=>onBizResultCallback(), // 业务请求结果回调函数，无需修改
                getInstance: getInstance, // 绑定验证码实例函数，无需修改
                slideStyle: {
                    width: 360,
                    height: 40,
                }, // 滑块验证码样式，支持自定义宽度和高度，单位为px。其中，width最小值为320 px
                language: 'cn', // 验证码语言类型，支持简体中文（cn）、繁体中文（tw）、英文（en）
            });
        }

        return () => {
            window.addEventListener("offline", () => {});
            window.addEventListener('online', () => {});

            // 必须删除相关元素，否则再次mount多次调用 initAliyunCaptcha 会导致多次回调 captchaVerifyCallback
            document.getElementById('aliyunCaptcha-mask')?.remove();
            document.getElementById('aliyunCaptcha-window-popup')?.remove();
        };
    }, [])

    // useEffect(() => {
    //   console.log("router=", router);
    // }, []);

    function changeOffline() {
        setOnline(false)
        setError({
            show: true,
            content: "你没有联网，请检查网络连接。"
        });
    }

    function changeOnline() {
        setOnline(true)
        setError({
            show: false
        });
    }

    function closeError() {
        setError({
            show: false,
            content: ""
        });
    }

    // 注册
    //1、注册成功跳转到验证邮箱页面
    //2、验证邮箱是否成功
    const onFinish = async ({username, email, password}) => {
        console.log('onFinish----',(new Date()).getDate())
        clickType.current = 'register'
        if (!isOnline) {
            return changeOffline()
        }
        if (!username) {
            setError({
                show: true,
                content: "请输入用户名"
            });
            return;
        } else {
            var testUsername = new RegExp(/^[a-zA-Z0-9]{4,16}$/);
            if (!testUsername.test(username)) {
                setError({
                    show: true,
                    content: "用户名不正确，用户名为4-16个字符，包括字母和数字，不包含特殊字符或中文"
                });
                return;
            }
        }
        if (!email) {
            setError({
                show: true,
                content: "请输入邮箱"
            });
            return;
        } else {
            var testEmail = new RegExp(/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/);
            if (!testEmail.test(email)) {
                setError({
                    show: true,
                    content: "邮箱不正确，请重新输入"
                });
                return;
            }
        }
        if (!password) {
            setError({
                show: true,
                content: "请输入密码"
            });
            return;
        } else {
            var testPwd = new RegExp(
                /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\W_!@#$%^&*`~()-+=]+$)(?![0-9\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\W_!@#$%^&*`~()-+=]{8,20}$/
            );
            if (!testPwd.test(password)) {
                setError({
                    show: true,
                    content: "密码不正确，密码格式为8-20个字符组成，包括字母、数字或特殊字符"
                });
                return;
            }
        }
        setError({
            show: false,
        });
        openVerifyDlg()
    }

    // _.debounce(, 10);

    function openVerifyDlg() {
        // 获取元素
        const captchaButton = document.getElementById('captcha-button');
        captchaButton.addEventListener('click', () => {
            console.log('Button clicked!');

        });
        // 触发校验点击事件
        captchaButton.click();
    }

    //真实提交表单
    async function submitForm() {
        if (isloading){
            return
        }
        setIsloading(true);
        // const headers = {
        //     "Content-Type": "application/json"
        // };

        const username = form.getFieldValue('username')
        const password = form.getFieldValue('password')
        const email = form.getFieldValue('email')
        // setGlobalUserName(username);
        globalUserName.current = username
        const res = await dispatch(register({
            username,
            password,
            email,
            // captchaVerifyParam: captchaVerifyParam.current
        }))
        console.log("res=>", res);
        if (res.payload.errorMsg || res.payload.status !== 0) {
            setError({
                show: true,
                content: res.payload.errorMsg || res.payload.message
            });
            // message.info(res.payload.errorMsg);
        } else {
            setShowAlert(true);
            form.resetFields();
        }
        setIsloading(false);
    }

    let captcha1;

    const getInstance = (instance) => {
        captcha1 = instance;
    };

    // 正在验证
    const captchaVerifyCallback = async (param) => {
        const sceneId = `${process.env.NEXT_PUBLIC_SCENE_ID}`

        const res = await dispatch(verifyCode({
            captchaVerifyParam: param,
            sceneId
        }))
        console.log('captchaVerifyCallback =', res)
        if (res.payload.status === 0){
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
        // console.log('onBizResultCallback=', clickType.current);
        // console.log('globalUserName=', globalUserName);
        if (clickType.current === 'register'){
            await submitForm()
        }
        if (clickType.current === 'resendEmail'){
            let res = await dispatch(rendAccountEmail({
                username: globalUserName.current,
                // captchaVerifyParam: captchaVerifyParam.current
            }))
            console.log("res=", res);
            if (res.payload.status === 0) {
                message.success("邮件已发送，请注意查收");
            } else {
                message.warning(res.payload.message);
            }
        }
    }

    return (
        <>
            {showAlert ? (
                <div>
                    <RegisterSuccessAlert resend={() => {
                        clickType.current = 'resendEmail'
                        openVerifyDlg()
                    }} close={() => {
                        setShowAlert(false)
                    }}/>
                </div>
            ) : null}

            <div className={'flex justify-center items-center'}>
                <div className={'2xl:w-[550px] xl:w-[550px] lg:w-[550px] md:w-[550px] sm:w-full w-full dark:bg-transparent dark:border-black p-6 rounded-md bg-white dark:bg-black dark:text-white'}>
                    <div className={'flex flex-col justify-center items-center gap-8 py-6'}>
                        <span className={'text-xl'}>加入 Seaurl</span>
                        <span className={'text-5xl font-bold'}>创建你的账号</span>
                    </div>
                    {error.show ? <Alert message={error.content} type="error" closable afterClose={closeError}/> : null}
                    <div className={'pt-8'}>
                        <Form
                            form={form}
                            {...layout}
                            name="basic"
                            layout="vertical"
                            onFinish={onFinish}>
                            <div className={'pb-2'}>
                                <b>用户名</b>
                            </div>
                            <Form.Item name="username">
                                <Input size="large"/>
                            </Form.Item>
                            <div className={'pb-2'}>
                                <b>邮箱</b>
                            </div>
                            <Form.Item name="email">
                                <Input size="large"/>
                            </Form.Item>
                            <div className={'pb-2'}>
                                <b>密码</b>
                            </div>
                            <Form.Item name="password" extra="密码格式为8-20个字符组成，包括字母、数字或特殊字符">
                                <Input.Password size="large"/>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" block size="large"
                                        loading={isloading}>
                                    {isloading ? "正在创建..." : "创建账号"}
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                    {/*<div className={styles.recordWrapper}>*/}
                    {/*  <Record/>*/}
                    {/*</div>*/}
                </div>
            </div>
            <div id="captcha-element"/>
            <div id="captcha-button"/>
        </>
    );
};
export default Register;
