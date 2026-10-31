'use client'
import React, {useState} from 'react';
// import styles from './index.module.scss'

import {useRouter} from "next/navigation";
import {Avatar, Popover, Drawer, Menu, Dropdown, List, Badge, Button, Space, Divider, Typography, Tag} from "antd";
import {
    HomeOutlined,
    FolderOutlined,
    UserOutlined,
    MenuOutlined,
    MailOutlined,
    PictureOutlined,
    ClusterOutlined,
    SettingOutlined,
    ShareAltOutlined,
    RobotOutlined,
    GlobalOutlined,
    FormOutlined,
    CloseOutlined,
    MailFilled,
    CrownOutlined,
    EllipsisOutlined,
    DownOutlined,
    CaretDownOutlined,
    OpenAIOutlined, MessageOutlined
} from "@ant-design/icons";
import IconFont from "@/utils/iconFont";
import classNames from "classnames/bind";
import {useSelector, useDispatch, shallowEqual} from 'react-redux'
import {useSession, signIn, signOut} from "next-auth/react";
import {logout, logoutAll} from '@/lib/slices/authSlice'
import {withRouter} from "@/hoc/withRouter";
import {setPlatFormTheme} from "@/lib/slices/systemSlice";
import Empty from "@/components/empty";
import {queryUserAiTools} from "@/lib/slices/aiSpaceSlice";

const UserInHeader = ({routerPush}) => {
    const [visible, setVisible] = useState(false);
    const {data: session} = useSession()
    const {platFormTheme} = useSelector(state => state.system)
    const {chooseUserAiTool, userAiToolsList} = useSelector(state => state.aiSpace)

    const showDrawer = () => {
        setVisible(true);
        // getData()
    };
    const hideDrawer = () => {
        setVisible(false);
    };

    const dispatch = useDispatch();
    const router = useRouter();

    function getData() {
        dispatch(queryUserAiTools())
    }

    // 显示下拉菜单头像
    function renderDropdownAvatar() {
        if (session) {
            return <Avatar src={session.user.image} size={48} className={'rounded-full cursor-pointer'}/>;
        } else {
            return <Avatar icon={<UserOutlined style={{fontSize: '22px'}}/>}
                           className={'rounded-full cursor-pointer'}/>;
        }
    }

    // 显示头部头像
    function renderHeaderAvatar() {
        if (session && session.user.image) {
            return <img src={`${session.user.image}?x-oss-process=style/30X30`}
                        className={'rounded-full bg-white cursor-pointer w-[32px] h-[32px]'} onClick={() => {
                showDrawer()
            }
            }/>
        } else {
            return <Avatar icon={<UserOutlined/>} className={'rounded-full cursor-pointer'} onClick={() => {
                showDrawer()
            }
            }/>
        }
    }

    function getAiToolList() {
        if (userAiToolsList.length > 0) {
            return userAiToolsList.map((item, index) => {
                return {
                    key: item.usedId,
                    label: item.name,
                    icon: <Avatar src={item.avatar}/>
                }
            })
        }
        return []
    }

    function onMenuClick(key, item, index){
        if (key){
            routerPush(`/aiSpace/aiUsed?usedId=${key}`)
        }
    }

    function getMenus() {
        if (session && session.user.image) {
            let menus = [
                {
                    label: '我的主页',
                    key: '1',
                    icon: <HomeOutlined className={'text-xl'}/>,
                    url: `/${session.user.name}`
                },
                // {
                //     label: '我的ImageAI',
                //     key: '7',
                //     icon: <PictureOutlined className={'text-base'}/>,
                //     url: `/${session.user.name}/aiSpace/imageAi`
                // },
                {
                    label: '网址空间',
                    key: '2',
                    icon: <GlobalOutlined className={'text-base'}/>,
                    url: `/${session.user.name}/urlSpace`
                }, {
                    label: <div className={'flex items-center justify-between w-full'}>
                        <div className={'flex items-center gap-1 '}>
                            工具
                            <Tag color="magenta">火</Tag>
                        </div>
                        {/*{*/}
                        {/*    userAiToolsList.length > 0 ?*/}
                        {/*        <Dropdown*/}
                        {/*            menu={{*/}
                        {/*                items: getAiToolList(),*/}
                        {/*                onClick: (e) => {*/}
                        {/*                    // console.log('e=',e)*/}
                        {/*                    // console.log('data=',data)*/}
                        {/*                    e.domEvent.stopPropagation()*/}
                        {/*                    onMenuClick(e.key)*/}
                        {/*                    hideDrawer()*/}
                        {/*                },*/}
                        {/*            }}>*/}
                        {/*            <CaretDownOutlined/>*/}
                        {/*        </Dropdown> : null*/}
                        {/*}*/}

                    </div>,
                    key: '5',
                    icon: <OpenAIOutlined style={{fontSize: '16px'}}/>,
                    url: `/aiSpace/aiUsed`
                }
            ]

            // if (!isMobile) {
            menus = menus.concat([{
                label: '我的笔记',
                key: '3',
                icon: <FormOutlined className={'text-base'}/>,
                url: `/noteSpace`
            },
                {
                    label: '我的文件',
                    key: '4',
                    icon: <FolderOutlined className={'text-base'}/>,
                    url: `/fileSpace`
                },
                {
                    label: <div className={'flex items-center justify-between w-full'}>
                        <div className={'flex items-center gap-1 '}>
                            我的邮箱
                            {/*<Tag color="blue">新</Tag>*/}
                        </div>
                        {/*{*/}
                        {/*    userAiToolsList.length > 0 ?*/}
                        {/*        <Dropdown*/}
                        {/*            menu={{*/}
                        {/*                items: getAiToolList(),*/}
                        {/*                onClick: (e) => {*/}
                        {/*                    // console.log('e=',e)*/}
                        {/*                    // console.log('data=',data)*/}
                        {/*                    e.domEvent.stopPropagation()*/}
                        {/*                    onMenuClick(e.key)*/}
                        {/*                    hideDrawer()*/}
                        {/*                },*/}
                        {/*            }}>*/}
                        {/*            <CaretDownOutlined/>*/}
                        {/*        </Dropdown> : null*/}
                        {/*}*/}

                    </div>,
                    key: '7',
                    icon: <MailOutlined className={'text-base'}/>,
                    url: `/mailSpace`
                },
                // {
                //     type: 'divider',
                //     key: 'divider'
                // }
            ])
            // }
            menus = menus.concat([{
                label: '设置',
                key: '6',
                icon: <SettingOutlined className={'text-base'}/>,
                url: `/setting/profile`
            },
                {
                    label: '退出',
                    key: 'logout',
                    icon: <IconFont type={"icon-tuichu1"} className={'text-base'}/>,
                }])
            return menus
        }
        return []
    }

    async function onClickMenuItem({item, key, keyPath, domEvent}) {
        hideDrawer()
        if (key === 'logout') {
            // // await dispatch(logout())
            // // 清除完之后立马跳转到登录页面
            // location.href = '/login'
            const res = await dispatch(logoutAll())
            if (res.payload.status === 0 && res.payload.data) {
                await signOut({callbackUrl: `/`})
                // 把黑色主题色删除
                localStorage.removeItem('theme.background')
                localStorage.removeItem('theme.color')
                // dispatch(setPlatFormTheme({
                //     background: 'light',
                //     color: '#54458a'
                // }))
            }
        } else if (key !== 'divider') {
            // router.push(item.props.url);
            routerPush(item.props.url)
        }
    }

    const {isReadMessage} = useSelector(state => state.auth)

    function gotoMessage() {
        // router.push('/chatroom')
        routerPush('/chatroom')
    }

    function gotoMyMember() {
        hideDrawer()
        routerPush('/member')
    }

    function onChooseTool() {

    }

    function renderAiTools() {
        return userAiToolsList.map((item, index) => {
            return <div className={classNames({
                'flex items-center flex-row gap-2 p-2 cursor-pointer rounded-xl hover:bg-[#eee] dark:hover:bg-[#2E333C]': true
            })} key={index} onClick={() => onChooseTool(item)}>
                <div className={'flex items-center justify-between gap-2 w-full'}>
                    <div
                        className={'flex items-center justify-center rounded-full shrink-0 w-[32px] h-[32px] shadow bg-white'}>
                        <img src={item.avatar} className={'w-[24px] h-[24px] rounded-full'}/>
                    </div>
                    <div className={'flex flex-col truncate w-full'}>
                        <div className={'text-sm'}>{item.name}</div>
                        {/*<span className={'text-sm truncate text-[#959598]'}>{item.desc}</span>*/}
                    </div>
                </div>
            </div>
        })
    }


    return <div>
        <div className={'box-border flex items-center justify-center'}>
            {renderHeaderAvatar()}
        </div>
        <Drawer
            styles={{
                body: {
                    padding: '0'
                },
                header: {
                    padding: '0'
                }
            }}
            title={<div className={'flex items-center justify-between'}>
                <div className={'flex items-center gap-2 px-3 py-3'}>
                    <div>
                        {renderDropdownAvatar()}
                    </div>
                    <div className={'flex items-center justify-between'}>
                        <div className={'flex items-center flex-col'}>
                            <span className={'text-base'}>{session && session.user.name}</span>
                            <span className={'text-sm font-normal'}>{session && session.user.nickName}</span>
                        </div>
                        <div className={'pl-4 block lg:hidden'}>
                            <Badge dot={!isReadMessage}>
                                <MessageOutlined
                                    style={{color: platFormTheme?.background === 'light' ? '#666' : 'white'}}
                                    className={'flex items-center justify-center w-[32px] h-[32px] dark:bg-[#141414] bg-[#eee] rounded-full cursor-pointer'}
                                    onClick={() => {
                                        hideDrawer()
                                        gotoMessage();
                                    }}
                                />
                            </Badge>
                        </div>
                    </div>
                </div>
                <div
                    className={'dark:bg-[#141414] dark:text-white dark:hover:bg-[#2A3037] bg-[#eee] h-[28px] w-[28px] flex items-center justify-center rounded mr-2 cursor-pointer text-[#aaa]'}
                    onClick={() => {
                        hideDrawer()
                    }}>
                    <CloseOutlined className={'text-sm '}/>
                </div>
            </div>}
            placement="right"
            closable={false}
            onClose={hideDrawer}
            open={visible}
            width={320}>
            <div>
                <Menu
                    onClick={onClickMenuItem}
                    selectable={false}
                    style={{
                        width: '100%',
                        border: 'none'
                        // background:'transparent'
                    }}
                    mode="inline"
                    // theme={platFormTheme.background === 'light'?'light':'dark'}
                    items={getMenus()}
                />
                {/*<div className={'py-2 px-4'}>*/}
                {/*    /!*<div className={' font-medium text-sm'}>常用工具</div>*!/*/}
                {/*    {userAiToolsList.length > 0 ? <div className={'pt-2 px-2'}>*/}
                {/*        {renderAiTools()}*/}
                {/*    </div> : <div>*/}
                {/*        <Empty/>*/}
                {/*    </div>}*/}
                {/*</div>*/}
                {/*<div className={'absolute bottom-4 left-4 right-4'}>*/}
                {/*    <Button block icon={<CrownOutlined style={{color: '#fff'}}/>} size={'large'} style={{*/}
                {/*        backgroundImage: 'linear-gradient(135deg, rgb(98, 83, 225), rgb(4, 190, 254))',*/}
                {/*        border: 'none',*/}
                {/*        color: '#fff'*/}
                {/*    }} onClick={() => gotoMyMember()}>我的会员</Button>*/}
                {/*</div>*/}
            </div>
        </Drawer>
    </div>
}

export default withRouter(UserInHeader);
