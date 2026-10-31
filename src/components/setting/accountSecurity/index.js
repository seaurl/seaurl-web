'use client'
import {useRouter} from "next/navigation";
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
import {updateAccountPassword} from "@/lib/slices/settingSlice";
import {signOut} from "next-auth/react";
import {logout, logoutAll} from "@/lib/slices/authSlice";

const {Title, Paragraph, Text, Link} = Typography;

const AccountSecurity = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const onFinish = async ({oldPwd, newPwd, newPwd2}) => {
    if (!oldPwd || !newPwd || !newPwd2) {
      return message.warning("原密码和新密码不能为空")
    }
    console.log('oldPwd', oldPwd)
    console.log('newPwd', newPwd)
    console.log('newPwd2', newPwd2)
    // if (oldPwd.length !== newPwd.length || oldPwd.length !== newPwd2.length || newPwd.length !== newPwd2.length) {
    //   return message.warning('密码输入不一致，请重新输入');
    // }
    if (newPwd2 !== newPwd) {
      return message.warning('新密码输入不一致，请重新输入');
    }
    const testPwd = new RegExp(
      /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\W_!@#$%^&*`~()-+=]+$)(?![0-9\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\W_!@#$%^&*`~()-+=]{8,20}$/
    );
    if (!testPwd.test(oldPwd)) {
      return message.warning("原密码格式不正确，密码格式为8-20个字符组成，包括字母、数字或特殊字符")
    }
    if (!testPwd.test(newPwd)) {
      return message.warning("新密码格式不正确，密码格式为8-20个字符组成，包括字母、数字或特殊字符")
    }
    if (oldPwd === newPwd) {
      return message.warning("新密码和原密码不能相同")
    }
    const res = await dispatch(updateAccountPassword({
      oldPwd: oldPwd,
      newPwd: newPwd
    }));
    if (res.payload.status === 0) {
      setTimeout(async () => {
        const res = await dispatch(logoutAll())
        if (res.payload.status === 0 && res.payload.data){
          // signOut()
          signOut({callbackUrl: `/`})

        }
      }, 3000)
      message.success("修改成功，正在跳转到登录页面")
    } else {
      message.warning(res.payload.errorMsg);
    }
    console.log('onFinish res => ', res)
  }
  return <Row>
    <Col xs={24} sm={24} md={24} lg={15} xl={15} xxl={15}>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="oldPwd" label={<Text strong>原密码</Text>} rules={[{}]}>
          <Input.Password/>
        </Form.Item>
        <Form.Item name="newPwd" label={<Text strong>新密码</Text>}>
          <Input.Password/>
        </Form.Item>
        <Form.Item name="newPwd2" label={<Text strong>确认新密码</Text>}>
          <Input.Password/>
        </Form.Item>
        <Form.Item>
          <Button type="default" htmlType="submit">
            更新密码
          </Button>
        </Form.Item>
      </Form>
    </Col>
  </Row>
}

export default AccountSecurity;
