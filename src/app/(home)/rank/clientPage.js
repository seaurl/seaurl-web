'use client'
import React, {useEffect, useMemo, useState, useRef, memo, useCallback, useLayoutEffect} from "react";
import {Avatar, Row, Col, Button, Affix, Badge, Select, Space, Divider, Spin, Menu, Dropdown, Image} from "antd";
import {useRouter} from "next/navigation";
import classNames from "classnames/bind";
import {getRankList, setRankList} from '@/lib/slices/rankSlice';
import IconFont from "@/utils/iconFont";

import dayjs from 'dayjs'
import {useDispatch, useSelector} from "react-redux";
import Loading from "@/components/loading";
import Empty from "@/components/empty";
import styles from "./index.module.scss";
import {withRouter} from "@/hoc/withRouter";

let cx = classNames.bind(styles);

const Rank = ({rankList: serverData, routerPush}) => {
    const router = useRouter();
    const dispatch = useDispatch();
    // const {query} = router;

    const {rankList, loadingRankList} = useSelector(state => state.rank)
    const {platFormTheme} = useSelector(state => state.system)
    const [isServer, setServer] = useState(true)
    const [isDark, setDark] = useState(false)

    const [choosed, setChoosed] = useState(0)

    const [menuItems, setMenuItems] = useState([{
        name: '今日排行榜',
        text: '日',
        color: '#f50',
    }, {
        name: '本周排行榜',
        text: '周',
        color: 'rgb(45, 183, 245)',
    }, {
        name: '本月排行榜',
        text: '月',
        color: 'hsl(102, 53%, 61%)',
    }, {
        name: '全站排行榜',
        text: '年',
        color: 'hwb(205 6% 9%)',
    }])

    useEffect(() => {
        if (isServer){
            dispatch(setRankList(serverData))
            setServer(false)
        }

        if (platFormTheme.background === 'dark'
            || (platFormTheme.background === 'system'
                && window.matchMedia('(prefers-color-scheme: dark)').matches)){
            setDark(true)
        }else{
            setDark(false)
        }
        // fetchRankList("today")
    }, [])

    async function fetchRankList(param) {
        dispatch(getRankList(param))
    }

    function gotoUser(user) {
        console.log('gotoUser', user)
        // router.push(`/${user.userName}`)
        routerPush(`/${user.userName}`)
    }

    function renderUserCard() {
        const topImg = ['https://cdn.seaurl.com/system/rank/top1.png', 'https://cdn.seaurl.com/system/rank/top2.png', 'https://cdn.seaurl.com/system/rank/top3.png']
        if (loadingRankList) {
            return <div className={'flex items-center justify-center w-full'}>
                <Loading/>
            </div>
        } else {
            if (rankList.length > 0) {
                return rankList.map((user, index) => {
                    const dom = <div className={cx({
                        'card': !isDark,
                        'flex cursor-pointer shadow-md hover:shadow-xl items-center justify-between w-full shrink-0 rounded-xl py-[24px] pr-[66px] pl-[22px]': true,
                        'isTop': index < 3 && !isDark,
                        'dark': isDark
                    })}>
                        <div className={'flex items-center justify-center'}>
                            {/*<div className={cx({*/}
                            {/*    'w-[80px] text-3xl text-[#0f10104f]': true,*/}
                            {/*    'text-[#f4173b]': index === 0,*/}
                            {/*    'text-[#fd6c24]': index === 1,*/}
                            {/*    'text-[#ff9d15]': index === 2*/}
                            {/*})}>{index > 2 ? index + 1 : ''}</div>*/}
                            <div className={'flex text-5xl text-[#0f10104f] pr-2 dark:text-white'}>
                                {index > 2 ? index + 1 : ''}
                            </div>
                            <div className={'flex items-center justify-center flex-row'}>
                                <div className={'w-[64px] h-[64px] border-[2px] border-white rounded-full'} onClick={() => gotoUser(user)}>
                                    <img src={`${user.avatar}?x-oss-process=style/100X100`} className={'rounded-full w-full'}/>
                                </div>
                                <div className={''}>
                                    <div className={'font-medium text-xl pt-2 text-black pl-4 dark:text-white'} onClick={() => gotoUser(user)}>
                                        {user.userName}
                                    </div>
                                    <div className={'font-medium text-md pt-2 text-[#6c7486] pl-4'}>
                                        入驻{dayjs(dayjs.utc(user.singUpTime).local()).fromNow(true)}
                                    </div>
                                </div>
                            </div>
                            {
                                index < 3 ? <div className={'absolute top-[-2px] left-[12px] z-10'}>
                                    <Image
                                        src={topImg[index]}
                                        preview={false}
                                        width={50}
                                        height={50}
                                    />
                                </div> : null
                            }
                        </div>
                        <div className={'text-center'}>
                            <Space size={48}>
                                <div className={'flex items-center flex-col-reverse justify-center gap-2'}>
                                    <span className={'text-md text-[#536471] text-nowrap dark:text-white'}>积分</span>
                                    <span
                                        className={'text-3xl text-center text-[#BE3C0D]'}>{choosed !== 3 ? `+${user.totalPoints}` : user.totalPoints}</span>
                                </div>
                            </Space>
                        </div>
                    </div>
                    return <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24} key={index}>
                        {
                            dom
                        }
                    </Col>
                })
            } else {
                return <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                    <Empty title='暂无数据'/>
                </Col>
            }
        }
    }


    function renderMenuItems() {
        return menuItems.map((item, index) => {
            return <div className={cx({
                item: true,
                [`item${index}`]: !isDark,
                [`choosedItem${index}`]: choosed === index && !isDark
            })} onClick={() => {
                if (index === 0) {
                    fetchRankList('today')
                }
                if (index === 1) {
                    fetchRankList('week')
                }
                if (index === 2) {
                    fetchRankList('month')
                }
                if (index === 3) {
                    fetchRankList('all')
                }
                setChoosed(index)
            }
            }>
                {
                    index === 0 ? <IconFont type="icon-jintian" className={'text-md dark:text-white'}/> : null
                }
                {
                    index === 1 ? <IconFont type="icon-benzhou" className={'text-md dark:text-white'}/> : null
                }
                {
                    index === 2 ? <IconFont type="icon-benyue" className={'text-md dark:text-white'}/> : null
                }
                {
                    index === 3 ? <IconFont type="icon-paixingbang" className={'text-md dark:text-white'}/> : null
                }
                <span className={'pl-2 dark:text-white'} style={{color: choosed === index?isDark? '#F5CF41':'inherit':isDark?'#fff':'inherit'}}>{item.name}</span>
            </div>
        })
    }

    return <div className={'dark:bg-[#141414] dark:text-white h-full'}>
        <div className={'max-w-screen-xl mx-auto p-[16px]'}>
            <div className={'w-full flex gap-8 items-start flex-col xl:flex-row'}>
                <div className={'w-full h-[320px] bg-white dark:bg-[#1C2126] basis-1/4 shadow-xl rounded-2xl static xl:sticky top-[72px] p-4'}>
                    <div className={'w-full pb-6'}>
                        <IconFont type="icon--jiangbei" className={'text-xl'}/>
                        <span className={'text-2xl font-medium pl-3'}>积分排行榜</span>
                        <span className={'text-xl pl-3 text-[#f4173b]'}>Top50</span>
                    </div>
                    {renderMenuItems()}
                </div>
                <div className={'w-full basis-3/4 rounded-2xl'}>
                    <Row gutter={[0, 18]}>
                        {renderUserCard()}
                    </Row>
                </div>
            </div>
        </div>
    </div>
}

export default withRouter(Rank);
