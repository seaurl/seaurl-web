'use client'
// import styles from './index.module.scss'
import {Input, Button, Space, message, Form, Alert, Result} from 'antd';
import React, {memo, useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {useDispatch, useSelector} from 'react-redux';
import {resetPassword, sendResetPasswordEmail, verifyCode} from '@/lib/slices/authSlice'
const ClientPage = ({user, res}) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const [email, setEmail] = useState('');
  const [isloading, setIsloading] = useState(false);

  const newPwd = useRef('')


  const [error, setError] = useState({
    show: false,
    content: ""
  });

  const layout = {
    labelCol: {span: 24},
    wrapperCol: {span: 24}
  };

  useEffect(() => {
    const sceneId = `${process.env.NEXT_PUBLIC_SCENE_ID}`

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
    return () => {
      // 必须删除相关元素，否则再次mount多次调用 initAliyunCaptcha 会导致多次回调 captchaVerifyCallback
      document.getElementById('aliyunCaptcha-mask')?.remove();
      document.getElementById('aliyunCaptcha-window-popup')?.remove();
    };
  }, []);

  let captcha;
  const getInstance = (instance) => {
    captcha = instance;
  };

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
    setIsloading(true);
    let res = await dispatch(resetPassword({
      userName: user.userName,
      newPwd: newPwd.current,
      email: user.email
    }))
    console.log("res=", res);
    if (res.payload.status === 0) {
      // form.resetFields();
      message.success("修改密码成功！", 3);
      // router.push("/login");
      location.href = '/login'
    } else {
      message.info(res.payload.message);
    }
    setIsloading(false);
  }

  // 回到首页
  function reback() {
    return (
        <Button
            type="primary"
            onClick={() => {
              // router.push("/");
              location.href = '/'
            }}
        >
          回到首页
        </Button>
    );
  }

  if (res){
    return <Result title={res?.message || '链接已失效'} subTitle="" extra={[reback()]}/>;
  }

  const onFinish = async ({new_password, confirm_password}) => {
    console.log('---new_password', new_password)
    console.log('---confirm_password', confirm_password)
    if (!new_password) {
      setError({
        show: true,
        content: "请输入密码"
      });
      return;
    }
    if (!confirm_password) {
      setError({
        show: true,
        content: "请输入确认密码"
      });
      return;
    }
    if (new_password !== confirm_password) {
      setError({
        show: true,
        content: "两次密码不一致"
      });
      return;
    }
    var testPwd = new RegExp(
      /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\W_!@#$%^&*`~()-+=]+$)(?![0-9\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\W_!@#$%^&*`~()-+=]{8,20}$/
    );
    if (!testPwd.test(new_password)) {
      setError({
        show: true,
        content: "密码不正确，密码格式为8-20个字符组成，包括字母、数字或特殊字符"
      });
      return;
    }
    setError({
      show: false,
      content: ''
    })
    newPwd.current = confirm_password
    openVerifyDlg()
  }

  function renderBody() {
    return <Form
      form={form}
      {...layout}
      name="basic"
      layout="vertical"
      onFinish={onFinish}>
      <div className={'pb-2'}>
        <b>新密码</b>
      </div>
      <Form.Item name="new_password">
        <Input.Password size="large"/>
      </Form.Item>
      <div className={'pb-2'}>
        <b>确认新密码</b>
      </div>
      <Form.Item name="confirm_password" extra="密码格式为8-20个字符组成，包括字母、数字或特殊字符">
        <Input.Password size="large"/>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block size="large" className="submit" loading={isloading}>
          {isloading ? "正在提交..." : "修改密码"}
        </Button>
      </Form.Item>
    </Form>
  }

  return <div className={''}>
    <div className={''}>
      <div className={'pt-8'}>
        <div className={'flex flex-col items-center justify-center gap-3'}>
          <span className={''}>
            <img
                src="https://cdn.awbeci.com/seaurl/logo/seaurl_logo.png"
                width="56"
                height="56"
                alt=""
                className={''}
                onClick={() => {
                  // router.push("/");
                  location.href = '/'
                }}
            />
          </span>
          <span className={'font-medium text-2xl'}>修改 <span style={{color: '#54458a'}}>@{user.userName}</span> 的密码</span>
        </div>
        <div className={'flex flex-col items-center justify-center pt-8'}>
          <div className={''}>{error.show ?
              <Alert message={error.content} type="error" closable afterClose={() => {
                setError({
                  show: false,
                  content: ''
                })
              }
              }/> : null}</div>
          <div className={''}>
            {renderBody()}
          </div>
        </div>
      </div>
    </div>
    <div id="captcha-button"/>
    <div id="captcha-element"/>
  </div>
}

export default ClientPage;
