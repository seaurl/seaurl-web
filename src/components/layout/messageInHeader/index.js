'use client'
import React, {useState, useEffect} from 'react';
import {Menu, Dropdown, List, Badge, Space, Divider, Radio, Tabs, Tooltip} from 'antd';
import {
  MessageFilled,
  UserOutlined,
  SoundOutlined,
  BellFilled,
  PlusOutlined,
  UserAddOutlined,
  SettingOutlined,
  BarsOutlined,
  MailFilled,
  NotificationOutlined, MessageOutlined, CommentOutlined
} from "@ant-design/icons";
import {useRouter} from "next/navigation";
import {useSelector, shallowEqual} from "react-redux";
import {withRouter} from "@/hoc/withRouter";
import IconFont from "@/utils/iconFont";
const NoticeInHeader = ({routerPush}) => {
  const router = useRouter();

  const {isReadMessage} = useSelector(state => state.auth)
  function gotoMessage() {
    // router.push('/chatroom')
    routerPush('/chatroom')
  }

  return <div className={''}>
    <div className={'h-[56px] flex items-center'}>
      <Badge dot={!isReadMessage}>
        <Tooltip title="私信" placement={'bottom'}>
          <IconFont type="icon-xiaoxi" className={'flex items-center justify-center text-base w-[24px] h-[24px] cursor-pointer'}
                    onClick={() => {
                      gotoMessage();
                    }}/>
        </Tooltip>
      </Badge>
    </div>
  </div>
}
export default withRouter(NoticeInHeader);
