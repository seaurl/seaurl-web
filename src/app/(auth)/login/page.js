'use client'
import React, {useState, useEffect, memo} from "react";
import {Form, Input, Button, Checkbox, message, Alert, Typography, theme} from "antd";
import {useRouter} from 'next/navigation'
import {signIn, useSession} from "next-auth/react";
import {useAppDispatch} from "@/lib/hooks";


const {Text, Link} = Typography;
const layout = {
    labelCol: {span: 24},
    wrapperCol: {span: 24}
};
const Login = props => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    // const {data: session} = useSession()
    // console.log('session data =', session)


    // const {loading, me, errorMsg} = useSelector((state) => state.auth);
    const [isLoding, setIsLoading] = useState(false);
    const [error, setError] = useState({
        show: false,
        content: ""
    });
    const {token} = theme.useToken();
    const [mounted, setMounted] = useState(false)
    const [isChecked, setChecked] = useState('')
    const [isOnline, setOnline] = useState(true)

    useEffect(() => {
        setMounted(true)
        // console.log('token-', token)
        // 没有登录的页面不能有颜色和背景
        localStorage.removeItem("theme.color")
        localStorage.removeItem("theme.background")

        window.addEventListener("offline", changeOffline);
        window.addEventListener('online',  changeOnline);

        return () => {
            window.addEventListener("offline", () => {});
            window.addEventListener('online',  () => {});
        };
    },[])

    function changeOffline(){
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

    const onFinish = async ({username, password}) => {
        if (!isOnline){
            return changeOffline()
        }
        if (!username) {
            setError({
                show: true,
                content: "请输入用户名"
            });
            return;
        }
        if (!password) {
            setError({
                show: true,
                content: "请输入密码"
            });
            return;
        }
        if (!isChecked) {
            setError({
                show: true,
                content: "请阅读并勾选同意《服务条款》和《隐私协议》"
            });
            return;
        }
        setError({
            show: false
        });
        setIsLoading(true);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/users/web/login`, {
            method: 'POST',
            body: JSON.stringify({ userName: username, password }),
            headers: { "Content-Type": "application/json" }
        })
        const resData = await res.json()
        console.log('login res user = ', JSON.stringify(resData))
        if (resData && resData.status === 0 && resData.data.name) {
            signIn("credentials", { session: JSON.stringify(resData.data),  redirect: false},)
                .then(async res => {
                console.log('rreess =', JSON.stringify(res))
                // 获取background和color
                // await dispatch(setPlatFormTheme({
                //     background: resData?.data?.background || '',
                //     color: resData?.data?.color  || ''
                // }))
                localStorage.setItem("theme.color", resData?.data?.color  || '')
                localStorage.setItem("theme.background", resData?.data?.background  || 'light')

                if (res.ok && !res.error && res.status === 200){
                    location.href = '/'
                }
            })
        } else {
            setError({
                show: true,
                content: resData.message
            });
        }
        setIsLoading(false);
    };

    function onChange(v) {
        console.log('ischeck', v.target.checked)
        setChecked(v.target.checked)
    }

    function render() {
        return <div className={'bg-[#f4f6f8] h-dvh dark:bg-black dark:text-white'}>
            <div className={'flex justify-center px-[16px]'}>
                <div className={'w-full'}>
                    <div className={'flex justify-center flex-col items-center pt-16 pb-4'}>
                      <span className={'cursor-pointer'}>
                        <img
                            src="https://cdn.awbeci.com/seaurl/logo/seaurl_logo.png"
                            width="56"
                            height="56"
                            alt=""
                            onClick={() => {
                                // router.push("/");
                                window.location = '/'
                            }}
                        />
                      </span>
                        <span className={'text-2xl font-medium py-6'}>登录Seaurl</span>
                    </div>
                    <div className={'flex flex-col items-center'}>
                        <div className={'pb-4'}>{error.show ?
                            <Alert message={error.content} type="error" closable afterClose={closeError}/> : null}</div>
                        <div className={'w-full sm:w-96 border border-[#ddd] dark:border-black p-6 rounded-xl bg-white dark:bg-[#2D333B] dark:text-white'}>
                            <Form
                                {...layout}
                                name="basic"
                                initialValues={{remember: true}}
                                layout="vertical"
                                onFinish={onFinish}
                                // onFinishFailed={onFinishFailed}
                            >
                                <div className={'pb-2'}>
                                    <b>用户名或邮箱</b>
                                </div>
                                <Form.Item name="username">
                                    <Input size="large"/>
                                </Form.Item>
                                <div className={'pb-2 flex justify-between'}>
                                    <b>密码</b>
                                    <Button onClick={() => {
                                        location.href = '/account/password_reset'
                                    }} type="link" size={'small'} style={{color: token?.colorPrimary || '#54458a' }}>
                                        忘记密码
                                    </Button>
                                </div>
                                <Form.Item name="password">
                                    <Input.Password size="large"/>
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" block size="large"  loading={isLoding}>
                                        {isLoding ? "正在登录..." : "登录"}
                                    </Button>
                                </Form.Item>
                            </Form>
                            <div >
                            <div className={'flex justify-center items-center'}>
                                <Button onClick={()=>{
                                    location.href = '/register'
                                }} type="link" size={'small'} style={{color: token?.colorPrimary || '#54458a' }}>
                                    <span className={'text-sm'}>还没有账号吗？点击注册新账号</span>
                                </Button>

                          </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className={'flex justify-center items-center gap-2 py-4 text-sm'}>
                            <Checkbox onChange={onChange}/>
                            <span>我已阅读并同意
                                <span className={'cursor-pointer px-1 font-medium hover:underline'} style={{color: token?.colorPrimary || '#54458a'}} onClick={()=>{
                                    window.open('/license', '_blank')
                                }}>服务协议</span>
                                和
                                <span className={'cursor-pointer px-1 font-medium hover:underline'} style={{color: token?.colorPrimary || '#54458a'}} onClick={()=>{
                                    window.open('/privacy', '_blank')
                                }}>隐私政策</span></span>
                        </div>
                    </div>
                    {/*<div className={styles.recordWrapper}>*/}
                    {/*  <Record/>*/}
                    {/*</div>*/}
                </div>
            </div>
        </div>
    }

    return render();
};

export default Login

// Login.getLayout = function getLayout(page){
//     return <LogoutLayout>{page}12eqwqdqdqdqwed</LogoutLayout>
// }
//
