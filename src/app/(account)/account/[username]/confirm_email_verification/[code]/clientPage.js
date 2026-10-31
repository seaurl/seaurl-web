'use client'
import {memo, useState, useEffect, useRef} from "react";

import {useRouter} from "next/navigation";
import {Result, Button, Alert, message} from "antd";
import {useSelector, useDispatch} from 'react-redux'
import {rendAccountEmail} from '@/lib/slices/authSlice';


const ConfirmVerification = ({show, query}) => {
  const router = useRouter();
  // const {query} = router;
  const [showAlert, setShowAlert] = useState(false);
  const dispatch = useDispatch();
  const captchaVerifyParam = useRef("")

  let captcha;
  const getInstance = (instance) => {
    captcha = instance;
  };

  //
  const captchaVerifyCallback = async (param) => {
    captchaVerifyParam.current = param
    return {
      captchaResult: true,
      bizResult: true,
    }
  }
  // 验证通过后调用
  const onBizResultCallback = async ()  => {
    console.log('onBizResultCallback', );
    let username = query.username;
    let res = await dispatch(rendAccountEmail({
      username,
      captchaVerifyParam: captchaVerifyParam.current
    }))
    console.log("res=", res);
    if (res.payload.status === 0) {
      setShowAlert(true);
    } else {
      message.info(res.payload.message);
    }
    console.log(captchaVerifyParam);
  }

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
    }
  }, []);

  function openVerifyDlg() {
    // 获取元素
    const captchaButton = document.getElementById('captcha-button');
    captchaButton.addEventListener('click', () => {
      console.log('Button clicked!');

    });
    // 触发校验点击事件
    captchaButton.click();
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

  // 重新发送
  function resend() {
    return (
      <Button
        onClick={async () => {
          openVerifyDlg()
        }}>
        重新发送
      </Button>
    );
  }

  // 登录
  function login() {
    return (
      <Button
        type="primary"
        key="console"
        onClick={() => {
          // router.push("/login");
          location.href = '/login'
        }}
      >
        去登录
      </Button>
    );
  }

  //渲染结果
  function renderResult() {
    switch (show) {
      case "verified":
        return <Result title="温馨提示：您的邮箱已经验证通过" subTitle="" extra={reback()}/>;
      case "404":
        return <Result status="404" title="404" subTitle="对不起，没有找到您要的页面" extra={reback()}/>;
      case "invalid":
        return <Result title="验证无效或者过期，请点击重新发送" subTitle="" extra={[reback(), resend()]}/>;
      case "success":
        return <Result status="success" title="恭喜您，邮箱验证成功，请重新登录！" subTitle="" extra={login()}/>;
    }
  }

  return (
    <>
      {showAlert ? (
        <div>
          <Alert onClose={() => {
            setShowAlert(false);
          }} message="我们发送了一封验证邮件，一小时后失效，请您及时查收并验证！" description="" type="info" showIcon banner closable/>
        </div>
      ) : null}
      {renderResult()}
      <div id="captcha-button"/>
      <div id="captcha-element"/>
    </>
  );
};

export default memo(ConfirmVerification);
