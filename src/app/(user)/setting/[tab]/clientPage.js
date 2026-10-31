'use client'
import {usePathname, useRouter} from 'next/navigation'

import {
  Result,
  Row,
  Col,
  Menu,
  Tabs,
  Drawer,
  Input,
  InputNumber,
  Button,
  Avatar,
  Modal,
  Typography,
  Popconfirm,
  Checkbox
} from 'antd'
import {AppstoreOutlined, MailOutlined, MenuFoldOutlined, MenuOutlined, PicRightOutlined} from '@ant-design/icons';
import NavMenus from "@/components/navMenus";
import {useState, useContext, useEffect, memo} from "react";
import AccountInfo from "@/components/setting/accountInfo";
import AccountName from "@/components/setting/accountName";
import AccountSecurity from "@/components/setting/accountSecurity";
import AccountEmail from "@/components/setting/accountEmail";
import AccountNotice from "@/components/setting/accountNotice";
import {useSelector, useDispatch} from 'react-redux'
import AccountAppearance from "@/components/setting/accountAppearance";
import classNames from "classnames/bind";
import {getAccountBaseInfo} from "@/lib/slices/authSlice";
import {setOpenMobileDrawer, setOpenSidebar} from "@/lib/slices/fileSpaceSlice";
const {Title, Paragraph, Text, Link} = Typography;

const {SubMenu} = Menu;
const {TabPane} = Tabs;

const ClientPage = ({tab, userInfo}) => {

  const pathname = usePathname()

  const router = useRouter()
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const {tabs} = useSelector(state => state.setting)
  const [isServer, setServer] = useState(false)

  useEffect(()=>{
    // console.log('userinfo =', userInfo)
    // if (userInfo){
    //   // user信息不为空，则重新设置主题，防止用户修改storage
    //   localStorage.setItem('theme.background', userInfo?.background || 'light')
    //   localStorage.setItem('theme.color', userInfo?.color || '#54458A')
    //   dispatch(setPlatFormTheme({
    //     background: userInfo?.background,
    //     color: userInfo?.color
    //   }))
    // }
    getUserInfo()
  }, [])

  async function getUserInfo() {
    const res = await dispatch(getAccountBaseInfo())
    // if (res.payload.status === 0){
    //   if (res.payload.data){
    //     localStorage.setItem('theme.background', res?.payload?.data?.background || 'light')
    //     localStorage.setItem('theme.color', res?.payload?.data?.color || '#54458A')
    //       dispatch(setPlatFormTheme({
    //         background: userInfo?.background,
    //         color: userInfo?.color
    //       }))
    //   }
    // }
  }

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  // const {tab} = router.query;
  console.log(tab);
  // const { resize, setResize } = useContext(LayoutContext);

  const [height, setHeight] = useState(0);
  const [showDlg, setShowDlg] = useState(false);
  const [tabContent, setTabContent] = useState()
  const [dialog, setDialog] = useState({
    show: false,
    title: '',
    width: 300,
    content: null,
    mask: true,
    onOk: () => {

    },
    onCancel: () => {

    }
  })


  function handleClick(e) {
    console.log('click ', e);
  };

  function renderDlg() {
    return <Modal
      centered={dialog.centered}
      title={dialog.title}
      width={dialog.width}
      open={showDlg}
      onOk={dialog.onOk}
      onCancel={dialog.onCancel}
      mask={dialog.mask}
      okText="确定"
      cancelText="取消">
      {dialog.content}
    </Modal>
  }

  // 用户基本信息设置
  function renderUserInfo(contentDom) {
    return <div className={'w-full'}>
      <Title level={4} className={'flex items-center gap-2'}>{contentDom}基本信息</Title>
      <AccountInfo/>
    </div>
  }

  // 账户名设置
  function renderAccount(contentDom) {
    return <div>
      <Title level={4} className={'flex items-center gap-2'}>{contentDom}修改用户名</Title>
      <AccountName/>
    </div>
  }

  // 账户密码设置
  function renderAccountSecurity(contentDom) {
    return <div>
      <Title level={4} className={'flex items-center gap-2'}>{contentDom}修改密码</Title>
      <AccountSecurity/>
    </div>
  }

  // 账户邮箱设置
  function renderEmail(contentDom) {
    return <div>
      <Title level={4} className={'flex items-center gap-2'}>{contentDom}邮箱</Title>
      <AccountEmail/>
    </div>
  }

  // 账户通知设置
  function renderNotice(contentDom) {
    return <div>
      <Title level={4} className={'flex items-center gap-2'}>{contentDom}消息</Title>
      <AccountNotice/>
    </div>
  }

  function renderAppearance(contentDom) {
    return <div>
      <Title level={4} className={'flex items-center gap-2'}>{contentDom}外观</Title>
      <AccountAppearance/>
    </div>
  }

  function renderTabContent(contentDom) {
    switch (tab) {
      case "profile":
        return renderUserInfo(contentDom)
      case "account":
        return renderAccount(contentDom)
      case "security":
        return renderAccountSecurity(contentDom)
      case "email":
        return renderEmail(contentDom)
      // case "notice":
      //  return renderNotice(contentDom)
      case "appearance":
        return renderAppearance(contentDom)
      default:
        return null;
    }
  }

  function renderDom() {
    let dom = ['profile', 'account', 'security', 'email', 'appearance'].includes(tab) ?
      <div className={'flex flex-row h-full'}>
        {
          <div className={classNames({
            'w-[240px] p-2 py-4 flex-shrink-0 border-r border-[#e5e5e5] dark:border-[#474747]': true,
            'hidden': true,
            'xl:flex': !open
          })}>
            <NavMenus menus={tabs} tab={tab}/>
          </div>
        }
        <div className={'w-full px-[16px] py-[12px] overflow-y-auto h-full xl:max-w-[700px]'}>
          {renderTabContent(
              <div
                  className={classNames({
                    'cursor-pointer hover:bg-[#eee] dark:hover:bg-[#2E333C] w-[36px] h-[36px] rounded-full flex items-center justify-center': true,
                    'hidden xl:flex': open,
                    'flex xl:hidden': !open
                  })}
                  onClick={() => {
                    setOpen(true)
                  }}>
                <MenuOutlined/>
              </div>
        )}
      </div>
  </div> :
    <Result
        status="404"
        title="404"
        subTitle="对不起, 没有找到您想要访问的页面."
    />
    return <>
      {dom}
      <Drawer styles={{
        body: {
          padding: '0',
        },
      }} closable={false} title="" width={320} placement="left" onClose={onClose} open={open}>
        <div className={'p-2'}>
          <NavMenus menus={tabs}/>
        </div>
      </Drawer>
    </>
  }

  return renderDom()
};

export default ClientPage;
