'use client'
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation'
import {Form, Select, InputNumber, Switch, Divider, Menu, Drawer, Typography, Segmented} from 'antd'
import Logo from '../logo'
import {useDispatch, useSelector, shallowEqual} from "react-redux";
import {
    LikeOutlined,
    FireOutlined,
    InfoCircleOutlined,
    MenuOutlined,
    HomeOutlined,
    BuildOutlined,
    DownloadOutlined,
    ReadOutlined,
    CloseOutlined,
    BookOutlined,
    FormOutlined,
    PhoneOutlined,
    VideoCameraOutlined
} from "@ant-design/icons";
import Loading from "@/components/loading";
import Empty from "@/components/empty";
import _ from 'lodash'

import {getUserMostClickUrlList, getUserHistoryUrlList} from "@/lib/slices/systemSlice";
import {useSession} from "next-auth/react";
import {withRouter} from "@/hoc/withRouter";
import classNames from "classnames/bind";
import {userClickUrl} from "@/lib/slices/urlSpaceSlice";
import {buildFaviconUrl} from "@/utils/favicon";
import styles from './index.module.scss'

const {Title, Paragraph, Text, Link} = Typography;

const LogoInHeader = ({routerPush}) => {
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [userClickUrls, setUserClickUrls] = useState([])
    const [loading, setLoading] = useState(true)
    const dispatch = useDispatch();
    const {data: session} = useSession()

    const {loginMenus, logoutMenus, topUrls, historyUrls} = useSelector(state => state.system)
    const {platFormTheme} = useSelector(state => state.system)
    const [isFirst, setFirst] = useState(true)
    const [tab, setTab] = useState('top')
    const [urlList, setUrlList] = useState([])
    const divRef = useRef(null);

    const showDrawer = () => {
        setVisible(true);
    };
    const hideDrawer = () => {
        setVisible(false);
    };

    async function goto() {
        if (session) {
            routerPush('/')
        } else {
            window.location = '/'
        }
    }

    function onClickMenuItem({item, key, keyPath, domEvent}) {
        if (session) {
            loginMenus.forEach(async d => {
                if (d.key === key) {
                    if (key === '0') {
                        routerPush('/')
                    } else {
                        // router.push(d.url);
                        routerPush(d.url)
                    }
                }
            })
        } else {
            logoutMenus.forEach(d => {
                if (d.key === key) {
                    window.location = d.url
                }
            })
        }
        hideDrawer()
    }

    function onClickUrlItem({item, key, keyPath, domEvent}) {
        console.log('key=', key)
        if (tab === 'top') {
            topUrls.forEach(d => {
                if (d.key === key) {
                    console.log('ddd-', d)
                    dispatch(userClickUrl(d?.key))
                    window.open(d.url, '_blank')
                }
            })
        }
        if (tab === 'history') {
            historyUrls.forEach(d => {
                if (d.key === key) {
                    dispatch(userClickUrl(d?.key))
                    window.open(d.url, '_blank')
                }
            })
        }

        hideDrawer()
    }

    function getMenuList() {
        if (session) {
            let newLoginMenus = JSON.parse(JSON.stringify(loginMenus))
            return newLoginMenus.map(item => {
                if (item.type === 'drawer-menus') {
                    if (item.key === '0') {
                        item.icon = <HomeOutlined/>
                    }
                    if (item.key === '1') {
                        item.icon = <LikeOutlined/>
                    }
                    if (item.key === '3') {
                        item.icon = <DownloadOutlined/>
                    }
                    if (item.key === '4') {
                        item.icon = <InfoCircleOutlined/>
                    }
                    if (item.key === '5') {
                        item.icon = <FireOutlined/>
                    }
                    if (item.key === '6') {
                        item.icon = <ReadOutlined/>
                    }
                    if (item.key === '7') {
                        item.icon = <BookOutlined/>
                    }
                    if (item.key === '8') {
                        item.icon = <PhoneOutlined/>
                    }
                    if (item.key === '9') {
                        item.icon = <VideoCameraOutlined/>
                    }
                    return item;
                }
            })
        } else {
            let newLogoutMenus = JSON.parse(JSON.stringify(logoutMenus))
            return newLogoutMenus.map(item => {
                if (item.type === 'drawer-menus') {
                    if (item.key === '0') {
                        item.icon = <HomeOutlined/>
                    }
                    if (item.key === '1') {
                        item.icon = <LikeOutlined/>
                    }
                    if (item.key === '3') {
                        item.icon = <DownloadOutlined/>
                    }
                    if (item.key === '4') {
                        item.icon = <InfoCircleOutlined/>
                    }
                    if (item.key === '5') {
                        item.icon = <FireOutlined/>
                    }
                    if (item.key === '6') {
                        item.icon = <ReadOutlined/>
                    }
                    if (item.key === '7') {
                        item.icon = <BookOutlined/>
                    }
                    if (item.key === '8') {
                        item.icon = <PhoneOutlined/>
                    }
                    if (item.key === '9') {
                        item.icon = <VideoCameraOutlined/>
                    }
                    return item;
                }
            })
        }
    }

    // 添加防抖
    // const debouncedGetUserClickUrls = useCallback(_.debounce(getUserClickUrls, 500), []); // 这里的300是延迟时间，单位是毫秒

    useEffect(() => {
        if (visible && isFirst) {
            // debouncedGetUserClickUrls()
            getUserUrls('top')
            getUserUrls('history')
            setFirst(false)
        }
    }, [visible])

    async function getUserUrls(val) {
        setLoading(true)
        if (val === 'top') {
            await dispatch(getUserMostClickUrlList())
        }
        if (val === 'history') {
            await dispatch(getUserHistoryUrlList())
        }
        setTimeout(() => {
            setLoading(false)
        }, 1000)
    }

    function getUserUrlMenus() {
        if (tab === 'top') {
            return topUrls.map((item, index) => {
                return {
                    icon: <div key={index}>
                        <img src={buildFaviconUrl(item)} className={'w-[16px] h-[16px]'}/>
                    </div>,
                    ...item
                }
            })
        }
        if (tab === 'history') {
            return historyUrls.map((item, index) => {
                return {
                    icon: <div key={index}>
                        <img src={buildFaviconUrl(item)} className={'w-[16px] h-[16px]'}/>
                    </div>,
                    ...item
                }
            })
        }
        return []
    }

    function onChangeType(e) {
        setTab(e)
        console.log('e-', e)
        if (divRef.current) {
            divRef.current.scrollTop = 270;
        }
    }

    return <div className={'flex gap-4 items-center'}>
        {/*//只有登录和移动端才显示*/}
        {
            session ? <div
                className={'flex text-white dark:bg-[#1C2127] dark:text-white border border-solid border-white rounded w-[30px] h-[30px] items-center justify-center'}><MenuOutlined/></div> : null
        }
        <Logo isLogin={!!session} clickLogo={() => {
            showDrawer()
        }}/>
        <Drawer
            // className={styles.drawer}
            styles={{
                body: {
                    padding: '0',
                    overflow: 'hidden'
                },
                header: {
                    padding: '0'
                }
            }}
            title={
                <div className={'flex items-center justify-between px-3 py-3 pl-4'}>
                    <div className={'flex items-center gap-2'}>
                        <Logo clickLogo={() => {
                            // goto()
                            // hideDrawer()
                        }}/>
                        {/*<span className={'text-2xl'}>Seaurl</span>*/}
                    </div>
                    <div
                        className={'dark:bg-[#141414] dark:text-white dark:hover:bg-[#2A3037] bg-[#eee] h-[28px] w-[28px] flex items-center justify-center rounded mr-2 cursor-pointer text-[#aaa]'}
                        onClick={() => {
                            hideDrawer()
                        }}>
                        <CloseOutlined/>
                    </div>
                </div>
            }
            placement="left"
            closable={false}
            onClose={hideDrawer}
            open={visible}
            width={320}>
            <div
                ref={divRef}
                className={'relative overflow-y-auto h-full'}>
                <Menu
                    onClick={onClickMenuItem}
                    selectable={false}
                    style={{
                        width: '100%',
                        border: 'none'
                    }}
                    mode="inline"
                    items={getMenuList()}
                />
                {/*<Divider/>*/}
                <div className={'px-1 py-1 w-full sticky top-0 bg-white dark:bg-[#141414] z-20'}>
                    <Segmented options={[
                        {
                            label: '常用网址',
                            value: 'top'
                        },
                        {
                            label: '历史记录',
                            value: 'history'
                        },
                    ]} block onChange={onChangeType} defaultValue={'top'}/>
                </div>
                <div>
                    {
                        loading ? <div className={'flex items-center justify-center w-full p-2'}><Loading/>
                        </div> : (topUrls.length > 0 && tab === 'top') || (historyUrls.length > 0 && tab === 'history') ?
                            <Menu
                                onClick={onClickUrlItem}
                                selectable={false}
                                className={styles.menuList}
                                style={{
                                    width: '100%',
                                    border: 'none'
                                }}
                                mode="inline"
                                items={getUserUrlMenus()}
                            /> : <div>
                                <Empty title='暂无数据'/>
                            </div>
                    }

                </div>
            </div>
            {/*<div className={styles.record}><Record/></div>*/}
        </Drawer>
    </div>
}

export default withRouter(LogoInHeader)
