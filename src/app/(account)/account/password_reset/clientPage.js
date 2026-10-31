'use client'
import {Input, Button, Space, message, Alert} from 'antd';
import {memo, useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {useDispatch, useSelector} from 'react-redux';
import {sendResetPasswordEmail, verifyCode} from '@/lib/slices/authSlice'

const ClientPage = ({}) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const emailVal = useRef('')
  const [showAlert, setShowAlert] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [mounted, setMounted] = useState(false)

  const [isOnline, setOnline] = useState(true)
  const captchaVerifyParam = useRef("")

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

    // setMounted(true)

    window.addEventListener("offline", changeOffline);
    window.addEventListener('online', changeOnline);

    return () => {
      window.addEventListener("offline", changeOffline);
      window.addEventListener('online', changeOnline);
      // 必须删除相关元素，否则再次mount多次调用 initAliyunCaptcha 会导致多次回调 captchaVerifyCallback
      document.getElementById('aliyunCaptcha-mask')?.remove();
      document.getElementById('aliyunCaptcha-window-popup')?.remove();
    };
  }, [])


  let captcha;
  const getInstance = (instance) => {
    captcha = instance;
  };

  function changeOffline() {
    setOnline(false)
    return message.info('你没有联网，请检查网络连接。');
  }

  function changeOnline() {
    setOnline(true)
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
    setIsSubmit(true);
    // 发送重置密码邮件
    let result = await dispatch(sendResetPasswordEmail({
        email: emailVal.current
        // captchaVerifyParam: captchaVerifyParam.current
      }
    ))
    console.log('---result ---', result)
    if (result.payload.status === 0) {
      setShowAlert(true);
    } else {
      message.info(result.payload.message);
    }
    setIsSubmit(false);
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


  function renderBody() {
    return <div className={'flex items-center justify-center flex-col gap-4'}>
      <p>请输入您的帐户经过验证的电子邮件地址，我们将向您发送密码重置链接。</p>
      <Input placeholder="请输入您注册时的邮箱地址" size="large" onChange={(e) => {
        setEmail(e.target.value)
        emailVal.current = e.target.value
      }
      }/>
      <Button type="primary" loading={isSubmit} disabled={email.length <= 0} onClick={async () => {
        if (!isOnline) {
          return changeOffline()
        }
        let testEmail = new RegExp(/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/);
        if (!testEmail.test(email)) {
          return message.info('邮箱不正确');
        } else {
          openVerifyDlg()
        }
      }
      }>立即发送</Button>
    </div>
  }

  return <>
    <div className={''}>
      {showAlert ? <Alert
        onClose={() => {
          setShowAlert(false);
        }}
        message="温馨提示"
        description="我们发送了一封重置密码的邮件，请您及时查收！"
        type="success"
        showIcon
        banner
        closable
      /> : null}

      <div className={'flex justify-center bg-[#f4f6f8] h-[calc(100vh-56px)] pt-12'}>
        <div className={'flex flex-col gap-6 px-[16px]'}>
          <div className={'flex flex-col items-center justify-center gap-4'}>
            <span className={'cursor-pointer'}>
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
            <span className={'font-bold text-2xl'}>重置密码</span>
          </div>
          <div className={'bg-[#fff]  max-w-[640px] p-6 rounded-xl shadow'}>
            {renderBody()}
          </div>
        </div>
      </div>
    </div>
    <div id="captcha-button"/>
    <div id="captcha-element"/>
  </>
}
export default ClientPage;
