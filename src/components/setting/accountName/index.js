'use client'
import {useState, useContext, useEffect} from "react";
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
import {updateAccountName} from '@/lib/slices/settingSlice';
import {useDispatch, useSelector} from 'react-redux'
import {signOut} from "next-auth/react";
import {logout, logoutAll} from "@/lib/slices/authSlice";

const {Title, Paragraph, Text, Link} = Typography;

const AccountName = () => {
  const [showDlg, setShowDlg] = useState(false);
  const [newName, setNewName] = useState('');
  const [defaultName, setDefaultName] = useState('')
  const dispatch = useDispatch();
  const router = useRouter();

  function renderDlg() {
    return <Modal
      centered={false}
      title='修改用户名'
      width='378px'
      open={showDlg}
      onOk={onOk}
      onCancel={onCancel}
      maskClosable={false}
      // mask={dialog.mask}
      okText="确定"
      cancelText="取消"
      footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={onOk}>
          提交
        </Button>
      ]}
    >
      <Input placeholder="请输入新的用户名" value={newName}  maxLength={16} onChange={onChange}/>
    </Modal>
  }

  function onCancel() {
    setShowDlg(false)
  }

  function onChange(data) {
    console.log('data=>', data.target.value)
    // setDefaultName(data.target.value)
    setNewName(data.target.value)
  }

  async function onOk() {
    var testUsername = new RegExp(/^[a-zA-Z0-9]{4,16}$/);

    if(!newName){
      return message.warning("用户名不能为空")
    }
    // setShowDlg(false)
    if (!testUsername.test(newName)) {
      return message.warning('用户名为4-16个字符，包括字母和数字，不包含特殊字符或中文')
    } else {
      const res = await dispatch(updateAccountName({
        newName: newName
      }))
      console.log('onOk res=>', res)
      if (res.payload.errorMsg) {
        message.error(res.payload.errorMsg)
      }else{
        // 修改成功之后，要重新登录，并清除cookie所有数据
        setTimeout(async () => {
          const res = await dispatch(logoutAll())
          if (res.payload.status === 0 && res.payload.data){
            // signOut()
            signOut({callbackUrl: `/`})
          }
        }, 3000)
        message.success("修改成功，正在跳转到登录页面")
        setShowDlg(false)
      }
    }
  }

  return <div>
    <Popconfirm
      placement="rightTop"
      title="您确定修改用户名?"
      onConfirm={() => {
        // setDefaultName('')
        setNewName('')
        setShowDlg(true);
      }}
      // onCancel={cancel}
      okText="确定"
      cancelText="取消"
    >
      <Button>修改用户名</Button>
    </Popconfirm>
    {/* <div className={styles.tips}>
        <Help tip="您确定要修改用户名？修改用户名会导致之前的链接失效，请知晓！" />
      </div> */}
    <div className={'py-2'}>
      {/*<Stitle.Title title="请知悉：修改用户名将造成下列影响"/>*/}
      <div>请知悉：修改用户名将造成下列影响</div>
      <Paragraph>
        <ul>
          <li>
            我们不会为您的旧个人资料页面设置重定向。
          </li>
          <li>
            我们不会为Pages网站设置重定向。
          </li>
          <li>
            我们将为您的存储库创建重定向（Web访问）。
          </li>
          <li>
            重命名可能需要几分钟才能完成。
          </li>
        </ul>
      </Paragraph>
    </div>
    {renderDlg()}
  </div>
}

export default AccountName;
