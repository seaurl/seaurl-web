'use client'
import React, {useState, useEffect} from 'react';
import {Menu, Dropdown, List, Badge, Space, Avatar, Radio, Tabs, Skeleton, Divider, Spin, Tooltip} from 'antd';
import {
    MessageFilled,
    UserOutlined,
    SoundOutlined,
    BellFilled,
    BellOutlined,
    PlusOutlined,
    UserAddOutlined,
    SettingOutlined,
    BarsOutlined,
    TeamOutlined,
    NotificationOutlined, LoadingOutlined
} from "@ant-design/icons";
import {useRouter} from "next/navigation";
import classNames from "classnames/bind";
import {getRemindList, setReadRemind} from '@/lib/slices/notifySlice'
import {useSelector, useDispatch} from "react-redux";
import dayjs from "dayjs";
import InfiniteScroll from 'react-infinite-scroll-component';
import {isReadNotify} from "@/lib/slices/authSlice";
import Loading from "@/components/loading";
import Empty from "@/components/empty";
import {useSession} from "next-auth/react";
import {withRouter} from "@/hoc/withRouter";

// let cx = classNames.bind(styles);
const RemindInHeader = ({routerPush}) => {
    const dispatch = useDispatch();
    const {data: session} = useSession()
    const {remindList, remindListTotal} = useSelector(state => state.notify)
    const {platFormTheme} = useSelector(state => state.system)
    const {isReadRemind} = useSelector(state => state.auth)

    // const { remindList, remindListTotal, isReadRemind, isMobile} = useSelector((state) => {
    //   const {me, isLogin, userInfo} = state.auth
    //   const {isReadRemind} = state.user
    //   return {
    //     isReadRemind,
    //     ...state.notify,
    //     isMobile: state.layout.isMobile,
    //     hydrate: state.system.currentHydrate
    //   }
    // }, shallowEqual);
    // const { isMobile } = useSelector((state) => state.layout);

    const [showNotice, setShowNotice] = useState(false);
    const router = useRouter();
    const [page, setPage] = useState({
        pageSize: 10,
        pageNum: 1
    })
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     // 显示时禁止滚动条滚动
    //     if (showNotice) {
    //         const top = document.documentElement.scrollTop || document.body.scrollTop;
    //         document.body.style.cssText += `
    //         position: fixed;
    //         width: 100%;
    //         left: 0;
    //         top: ${-top}px;
    //     `
    //     } else {
    //         const top = document.body.style.top;
    //         document.body.style.cssText += `
    //         position: static;
    //     `;
    //         window.scrollTo(0, Math.abs(parseFloat(top)))
    //     }
    // }, [showNotice])

    function renderDesc(item) {
        // console.log('renderDesc item=', item)
        let desc = "";
        switch (item.objectType) {
            case "url":
                const objectOthers = item.objectOthers
                desc = (
                    <div className={'flex items-start flex-col'}>
                        {/*<span><img src={objectOthers.icon}/></span>*/}
                        <a href={objectOthers.url} style={{color: platFormTheme.color}} target="_blank"
                           className={'flex items-center font-medium'}>
                            {item.object}
                        </a>
                        <span className={'text-xs text-[#808080] pt-1 dark:text-white'}>
              {dayjs(dayjs.utc(item.createdDt).local()).fromNow()}
            </span>
                    </div>
                );
                break;
            case "file":
                desc = (
                    <div className={'flex items-start flex-col'}>
                        {/*<span><img src={objectOthers.icon}/></span>*/}
                        <span onClick={() => {
                            setShowNotice(false);
                            routerPush(`/fileSpace?type=sharingout`)
                        }} style={{color: platFormTheme.color}} className={'flex items-center font-medium cursor-pointer'}>
                            {item.object}
                        </span>
                        <span className={'text-xs text-[#808080] pt-1 dark:text-white'}>
                          {dayjs(dayjs.utc(item.createdDt).local()).fromNow()}
                        </span>
                    </div>
                );
                break;
            case "system":
                desc = <span>{item.desc}</span>;
                break;
            case "follwing":
                desc = <span>{item.desc}</span>;
                break;
            case "user":
                desc = <span className={'text-[#808080] pt-1'}>
              {dayjs(dayjs.utc(item.createdDt).local()).fromNow()}
            </span>;
                break;
            default:
                break;
        }
        return (
            <div className={'text-black flex flex-col'}>
                {desc}
            </div>
        );
    }

    // loadMoreData是点击打开还有滚动加载，如果是点击打开则pageNum=1
    const loadMoreData = async (isOpen = false) => {
        try {
            setLoading(true)
            const res = await dispatch(getRemindList({
                // userName: session?.user?.name,
                pageSize: page.pageSize,
                pageNum: isOpen ? 1 : page.pageNum,
            }));
            setLoading(false)
            if (res?.payload?.data?.length > 0 && res.payload.data[0].rows?.length > 0) {
                setPage({
                    ...page,
                    pageNum: page.pageNum + 1
                })
            }
        }catch (e) {
            setShowNotice(false);
        }
    }

    function gotoUser(name) {
        setShowNotice(false);
        setPage({
            ...page,
            pageNum: 1
        })
        // router.push(`/${name}`)
        routerPush(`/${name}`)
    }

    return <div className={'relative'} id={'remindInHeader2'}>
        <Dropdown
            open={showNotice}
            onOpenChange={async visible => {
                setShowNotice(visible);
                if (visible) {
                    // 重新打开的话分页应该从第1页开始
                    loadMoreData(true)
                    // setLoading(true)
                    try {
                        await dispatch(setReadRemind())
                        // dispatch(isReadNotify())
                    }catch (e) {
                        setShowNotice(false);
                    }
                }
            }}
            dropdownRender={(menus) => <div
                className={'relative m-0 text-left list-none bg-clip-padding rounded outline-0 shadow-2xl bg-white dark:bg-[#1f1f1f]'}>
                <div className={'overflow-auto relative flex flex-col justify-start overflow-y-hidden h-[460px]'}>
                    <div
                        className={'p-[12px] relative border-b border-[#eee] dark:border-[#474747] flex items-center justify-between'}>
                        <div className={'flex items-center gap-1'}>
                            <BellOutlined className={'flex items-center text-md cursor-pointer'}/>
                            <span className={'text-md'}>通知</span>
                        </div>
                        <SettingOutlined
                            className={'text-md cursor-pointer'}
                            onClick={() => {
                                setShowNotice(false);
                                // router.push("/setting/notice");
                                routerPush("/setting/notice")
                            }}
                        />
                    </div>
                    <div id="scrollableDiv" className={'relative overflow-y-auto h-[calc(460px-46px)] pl-2'}>
                        {
                            loading && page.pageNum === 1 ? <div className={'flex items-center justify-center w-full'}>
                                <Loading/>
                            </div> : remindList.length > 0 ? <InfiniteScroll
                                //注意：dataLength={remindList.length}要写remindList.length不能写成remindListTotal,切记！
                                dataLength={remindList.length}
                                next={loadMoreData}
                                height={413}
                                hasMore={remindList.length < remindListTotal}
                                loader={<div className={'flex items-center justify-center w-full'}>
                                    <Loading/>
                                </div>}
                                scrollableTarget="scrollableDiv">
                                <List
                                    split={false}
                                    itemLayout="horizontal"
                                    dataSource={remindList}
                                    renderItem={item => (
                                        <List.Item className={'px-[6px] py-[12px]'}>
                                            <List.Item.Meta
                                                avatar={
                                                    <div className={'pb-[8px]'}>
                                                        <Avatar src={item.senderAvatar} size={40}
                                                                className={'cursor-pointer'} onClick={() => {
                                                            gotoUser(item.senderName)
                                                        }}/>
                                                    </div>
                                                }
                                                title={<div className={'pt-0 text-sm flex gap-1'}>
                                      <span className={'cursor-pointer font-medium'}
                                            style={{color: platFormTheme.color}} onClick={() => {
                                          gotoUser(item.senderName)
                                      }}>{item.senderName}</span>
                                                    {item.count > 1 ? ` 等${item.count}个人 ` : ''}
                                                    {item.senderAction}</div>}
                                                description={renderDesc(item)}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </InfiniteScroll> : <Empty/>
                        }
                    </div>
                </div>
            </div>
            }
            trigger="click"
            // 挂载到指定位置，否则页面有滚动条的话，下拉列表也跟着动影响用户体验
            getPopupContainer={() => document.getElementById('remindInHeader2')}
            overlayStyle={{width: "380px"}}>
            <div className={'flex items-center h-[56px]'}>
                <Badge dot={!isReadRemind}>
                    <Tooltip title="提醒" placement={'bottom'}>
                        <BellFilled style={{color: 'white'}}
                                    className={'flex items-center justify-center w-[24px] h-[24px] text-white'}
                                    onClick={() => {
                                        setShowNotice(!showNotice);
                                    }}
                        />
                    </Tooltip>

                </Badge>
            </div>
        </Dropdown>
    </div>
}
export default withRouter(RemindInHeader);
