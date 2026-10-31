'use client'
import styles from './index.module.scss'
import {useState, useContext, useEffect, useRef} from "react";
import {AppstoreOutlined, MailOutlined, SettingOutlined, EditOutlined, QuestionCircleOutlined} from '@ant-design/icons';
import Cropper from "react-cropper";

import {
  Result,
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
  message,
  Upload
} from 'antd'
import {updateAccountBaseInfo, uploadAvatar, getAccountBaseInfo} from '@/lib/slices/settingSlice';
import {useDispatch, useSelector} from 'react-redux'
import {createSelector} from "@reduxjs/toolkit";
import _ from "lodash";
import classNames from "classnames/bind";
import {useAppSelector} from "@/lib/hooks";
let cx = classNames.bind(styles);

const {Title, Paragraph, Text, Link} = Typography;

const Index = () => {
  const [form] = Form.useForm();
  const [cropper, setCropper] = useState();
  const cropperRef = useRef(null);

  const dispatch = useDispatch();
  const {accountInfo} = useAppSelector(state => state.auth)


  const [image, setImage] = useState('');
  const [showDlg, setShowDlg] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [avatarBtnLoading, setAvatarBtnLoading] = useState(false);

  function renderDlg() {
    return <Modal
      centered={false}
      title='修改头像'
      width='500px'
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
        <Button key="submit" type="primary" loading={avatarBtnLoading} onClick={onOk}>
          提交
        </Button>
      ]}
    >
      <div className={'flex items-center justify-center w-full h-full'}>
        <Cropper
            ref={cropperRef}
            src={image}
            style={{height: 300, width: '100%'}}
            // Cropper.js options
            initialAspectRatio={1}
            // autoCrop={false}
            // 不可变动box
            cropBoxResizable={false}
            dragMode='none'
            guides={false}
            // crop={onCrop}
            // ref={cropperRef}
            crop={onCrop}
        />
      </div>
    </Modal>
  }

  const onCrop = () => {
    const cropper = cropperRef.current?.cropper;
    setCropper(cropper)
  };

  const onBeforeUpload = async (file) => {
    console.log('info=>', file)

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      // 获取文件的 Base64 编码
      const base64 = reader.result;
        setImage(base64)
        setShowDlg(true)
    }
    return false
  };

  //修改头像
  async function onOk() {
    setAvatarBtnLoading(true)
    if (typeof cropper !== "undefined") {
      // console.log('cropper.getCroppedCanvas().toDataURL()=', )
      const base64Img = cropper.getCroppedCanvas().toDataURL();
      const res = await dispatch(uploadAvatar({
        avatar: base64Img
      }))
      setAvatarBtnLoading(false)

      if (res.payload.status === 0) {
        console.log('onOk res =>', res)
        setShowDlg(false);
        setAvatar(res.payload.data);
        message.success("修改成功");
      }
    }
  }

  function onCancel() {
    setShowDlg(false)
  }

  useEffect(() => {
    // 初始化数据
    console.log('accountInfo=>', accountInfo)
    if (accountInfo) {
      form.setFieldsValue({
        user: {
          nickName: accountInfo.nickName,
          school: accountInfo.school,
          company: accountInfo.company,
          website: accountInfo.website,
          location: accountInfo.location,
          signature: accountInfo.signature,
          introduction: accountInfo.introduction
        }
      })
      setAvatar(accountInfo.avatar || 'http://static.awbeci.com/img/avatar/20200131205259')
    }

  }, [accountInfo])

  const urlReg = new RegExp(
    '^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
    'i',
  );

  function hasHttpOrHttpsPrefix(url) {
    return url.startsWith("http://") || url.startsWith("https://");
  }

  // 提交表单
  const onFinish = async (formData) => {
    console.log('formData=>form', form)
    const {user} = formData;

    if (user.website && !hasHttpOrHttpsPrefix(user.website)){
      message.info('个人网站url开头必须包含http://或者https://，请重新输入');
      return
    }

    if(user.website && !user.website.match(urlReg)){
      message.info('网址不正确，请重新输入');
      return
    }

    const updateres = await dispatch(updateAccountBaseInfo({
      // userName: me.name,
      nickName: user.nickName || '',
      school: user.school || '',
      company: user.company || '',
      website: user.website || '',
      location: user.location || '',
      signature: user.signature || '',
      introduction: user.introduction || '',
    }));
    console.log('updateres=>', updateres)
    if (updateres.payload.status === 0) {
      message.success('更新成功');
      // await dispatch(getAccountBaseInfo());
    } else {
      message.info('更新失败');
    }
  }
  return <div className={'flex flex-col-reverse gap-6 xl:flex-row xl:gap-8 min-h-0'}>
    <div className={'flex-1 min-h-0'}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{remember: true}} style={{width: '100%'}}>
        <Form.Item name={['user', 'nickName']} label={<Text strong>昵称</Text>} rules={[{}]}>
          <Input maxLength={20}/>
        </Form.Item>

        <Form.Item name={['user', 'school']} label={<Text strong>学校</Text>}>
          <Input maxLength={100}/>
        </Form.Item>
        <Form.Item name={['user', 'company']} label={<Text strong>公司</Text>}>
          <Input maxLength={100}/>
        </Form.Item>
        <Form.Item name={['user', 'website']} label={<Text strong>个人网站</Text>}>
          <Input/>
        </Form.Item>
        <Form.Item name={['user', 'signature']} label={<Text strong>个性签名</Text>}>
          <Input maxLength={100}/>
        </Form.Item>
        <Form.Item name={['user', 'introduction']} label={<Text strong>个人简介</Text>}>
          <Input.TextArea maxLength={500} autoSize={{ minRows: 4, maxRows: 6 }}/>
        </Form.Item>
        <Form.Item>
          <Button type="default" htmlType="submit">
            更新
          </Button>
        </Form.Item>
      </Form>
    </div>
    <div className={'flex xl:hidden flex-col items-center gap-3'}>
      <Text strong>个人头像</Text>
      {avatar ? <Avatar
        size={120}
        className={styles.icon}
        src={`${avatar}?x-oss-process=style/300X300`}
      /> : null}
      <Upload showUploadList={false} beforeUpload={onBeforeUpload}>
        <Button type="default" className={styles.btn}>
          <EditOutlined />编辑
        </Button>
      </Upload>
    </div>
    <div className={'hidden xl:flex flex-col items-center gap-3 flex-shrink-0'}>
      <Text strong>个人头像</Text>
      {avatar ? <Avatar
        size={160}
        className={styles.icon}
        src={`${avatar}?x-oss-process=style/300X300`}
      /> : null}
      <Upload showUploadList={false} beforeUpload={onBeforeUpload}>
        <Button type="default" className={styles.btn}>
          <EditOutlined />编辑
        </Button>
      </Upload>
    </div>
    {renderDlg()}
  </div>
}

export default Index;
