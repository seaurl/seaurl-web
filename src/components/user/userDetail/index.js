'use client'
import {useState, useEffect, useContext} from "react";
import {useRouter} from "next/navigation";

import {Avatar, Button, Divider, Space, Typography, Row, Col} from "antd";
import {
    LinkOutlined,
    EnvironmentOutlined,
    MailOutlined, IdcardOutlined
} from "@ant-design/icons";
import {useSelector, useDispatch, shallowEqual} from 'react-redux'

import IconFont from "@/utils/iconFont";
import {followUser} from "@/lib/slices/userSlice";
import {useSession} from "next-auth/react";
import {withRouter} from "@/hoc/withRouter";

const {Title} = Typography;

const UserDetail = ({guysInfo, userInfo, routerPush}) => {
    const router = useRouter();
    // const {data: session} = useSession()

    const dispatch = useDispatch();
    const {isFollowed} = useSelector(state => state.user)
    // const {me, isLogin, userInfo, isFollowed, isMobile} = useSelector((state) => {
    //     const {isFollowed} = state.user
    //     const {isMobile} = state.layout
    //     return {
    //         isMobile,
    //         isFollowed,
    //         ...state.auth,
    //         hydrate: state.system.currentHydrate
    //     }
    // },(_old, _new)=> {
    //     return _old.hydrate !== _new.hydrate
    // })

    function gotoFollow() {
        // const { history } = this.props;
        // history.push(path);
    }

    function isMe() {
        if (userInfo && guysInfo) {
            return userInfo?.name === guysInfo.userName
        } else {
            return false;
        }
    }

    function gotoSetting() {
        // router.push(`/setting/profile`)
        routerPush(`/setting/profile`)
    }

    async function btnFollowing(followedUserName) {
        if (userInfo) {
            // onClick('following')
            const res = await dispatch(followUser({
                status: !isFollowed,
                followedUserName
            }));
            if (res.payload) {
                // message.success("关注成功")
            }
        } else {
            // router.push('/login')
            routerPush(`/login`)
        }

    }

    function gotoMessage() {
        if (userInfo)
            routerPush(`/chatroom?fid=${guysInfo.uid}`)
            // router.push(`/chatroom?fid=${guysInfo.uid}`)
        else {
            routerPush(`/login`)
            // router.push('/login')
        }
    }

    // 获取ip地址
    function getIpAddr() {
        if (guysInfo.ipAddr) {
            const s = guysInfo.ipAddr.split('|')
            if (s.length > 0) {
                if (s[2] === 0) {
                    return '内网IP'
                } else {
                    return s[2]
                }
            }
        }
        return '未知'
    }

    return (
        <div className={'flex flex-col gap-4'}>
            <div className={'flex flex-row items-center xl:flex-col xl:items-start gap-4'}>


                {
                    guysInfo ?
                        <div className={'w-[120px] h-[120px] xl:w-[280px] xl:h-[280px]'}>
                            <img className={'w-full h-full rounded-full shrink-0'}
                                                                    src={`${guysInfo?.avatar}?x-oss-process=style/300X300`}/>
                        </div> :
                        null
                }
                <div className={'flex flex-col'}>
                    <span className={'font-bold text-xl'}>{guysInfo && guysInfo.nickName || ''}</span>
                    <span className={'text-sm'}>{(guysInfo && guysInfo.userName) || ''}</span>
                </div>
            </div>

            <div className={'xl:block hidden'}>
                {
                    isMe() ? <Button block onClick={gotoSetting}>设置</Button>
                        :
                        <div className={'flex flex-col gap-2'}>
                            <Button type={isFollowed?'primary':'default'} onClick={() => {
                                btnFollowing(guysInfo.userName)
                            }} block>{isFollowed ? '取消关注' : '关注'}</Button>
                            <Button type='text' block onClick={gotoMessage}>私信</Button>
                        </div>
                }


            </div>
            {/*<Title title="基本信息"></Title>*/}
            <div className={'font-bold text-md'}>基本信息</div>
            <div className={'flex flex-col gap-2'}>
                <div className={'flex flex-row gap-2 text-[#1f2328] text-sm dark:text-white'}>
                    <EnvironmentOutlined className={''}/>
                    <span className={'text-[#666] dark:text-white'}>IP属地：{getIpAddr()}</span>
                </div>

                {
                    guysInfo && guysInfo.email ?
                        <div className={'flex flex-row gap-2 text-[#1f2328] dark:text-white text-sm'}>
                            <MailOutlined className={''}/>
                            <span className={''}>{guysInfo ? guysInfo.email : ''}</span>
                        </div> : null
                }
                {
                    guysInfo && guysInfo.website ?
                        <div className={'flex flex-row gap-2 text-[#1f2328] dark:text-white text-sm'}>
                            <LinkOutlined className={''}/>
                            {/* <CalendarOutlined className={styles.iconDt} /> */}
                            <a className={''}
                               href={guysInfo ? guysInfo.website : ''}>{guysInfo ? guysInfo.website : ''}</a>
                        </div> : null
                }
                {
                    guysInfo && guysInfo.school ?
                        <div className={'flex flex-row gap-2 text-[#1f2328] dark:text-white text-sm'}>
                            <IdcardOutlined/>

                            <span className={''}>{guysInfo ? guysInfo.school : ''}</span>
                        </div> : null
                }

                {
                    guysInfo && guysInfo.company ?
                        <div className={'flex flex-row gap-2 text-[#1f2328] dark:text-white text-sm'}>
                            <IconFont type="icon-gongsi" className={''}/>
                            <span className={''}>{guysInfo ? guysInfo.company : ''}</span>
                        </div> : null
                }

                {/*<div className={styles.birthday}>*/}
                {/*  <ClockCircleOutlined className={styles.iconClock} />*/}
                {/*  <span className={styles.title}>{userInfo.createdDt} 加入</span>*/}
                {/*</div>*/}
            </div>
        </div>
    );
};

export default withRouter(UserDetail);
