'use client'
import {memo, useState} from "react";

// import {useRouter} from "next/navigation";
import {Result, Button, Alert, message} from "antd";
import {useDispatch} from "react-redux";
// import {verifyAccountUpdateEmail} from '@/lib/slices/settingSlice';
import {logout, logoutAll} from '@/lib/slices/authSlice'
// import {logoutAll} from "@/lib/slices/authSlice";
import {signOut} from "next-auth/react";

const ClientPage = props => {
  const dispatch = useDispatch();
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

  // 登录
  function login() {
    return (
      <Button
        type="primary"
        key="console"
        onClick={async () => {

          const res = await dispatch(logoutAll())
          if (res.payload.status === 0 && res.payload.data){
              signOut({callbackUrl: `/login`})
            // location.href = '/login'
          }
        }}>
        重新登录
      </Button>
    );
  }

  //渲染结果
  function renderResult() {
    switch (props.show) {
      case "404":
        return <Result status="404" title="404" subTitle="对不起，没有找到您要的页面" extra={reback()}/>;
      case "invalid":
        return <Result title="无效链接" subTitle="" extra={[reback()]}/>;
      case "success":
        return <Result status="success" title="恭喜您，邮箱验证成功，请重新登录！" subTitle="" extra={login()}/>;
    }
  }

  return renderResult()
};

export default ClientPage;
