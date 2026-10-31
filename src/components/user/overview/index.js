'use client'
import React, {useState, useEffect, useRef} from "react";
import {useRouter} from "next/navigation";

import {
    Button,
    Tabs,
    Select
} from "antd";
import {LinkOutlined} from "@ant-design/icons";
import Empty from "@/components/empty";
import FavoriteUrls from "../favoriteUrls";
import UserStatistic from "@/components/user/statistic";
import UserHeatmap from "../userHeatmap";
import HistoryUrl from "../historyUrl";
import TimeLine from '../timeline';
import {useSelector, useDispatch} from 'react-redux'
import HeatMapLegend from "@/components/heatMapLegend";
import {getHeatMapSubmitData, setQueryDate, getSubmitUrlByDate, setSubmitActivityData} from '@/lib/slices/userSlice'
import dayjs from 'dayjs';

const {Option} = Select;

// let cx = cns.bind(styles);
const {TabPane} = Tabs;

const Overview = ({
                      guysInfo,
                      guysData,
                      userInfo
                  }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const {
        submitYearList,
        heatmapSubmitData,
        submitActivityData,
        recentlyVisitUrls
    } = useSelector(state => state.user)

    const {platFormTheme} = useSelector(state => state.system)
    const queryListAbortControllerRef = useRef()
    const [dlg, setDlg] = useState({
        title: '',
        show: false
    })

    function settingPin() {
        setDlg({
            title: '请选择您的网址',
            show: true
        })
    }

    function isMe() {
        if (userInfo && guysInfo?.userName) {
            return userInfo.name === guysInfo?.userName
        } else {
            return false;
        }
    }

    function handleOk() {
        setDlg({
            show: false
        })
    }

    function handleCancel() {
        setDlg({
            show: false
        })
    }

    // 年份change事件
    async function changeYear(value) {
        console.log('value=', value)
        let month = 12;
        // 如果是当前年份，则月份应该从当前月份获取，而不是写成12月
        if (dayjs().year() === value) {
            const _m = dayjs().month() + 1;
            if (_m < 10) {
                month = `0${_m}`
            } else {
                month = _m;
            }
        }

        const date = `${value}-${month}`;
        dispatch(setQueryDate(date));

        // 重新获取提交的数据
        await dispatch(getHeatMapSubmitData({
            userName: guysInfo?.userName,
            date: date,
            type: 'fullYear'
        }))
    }

    // 获取一年一共提交多少次
    function getSubmitTotal() {
        let sum = 0;
        if (heatmapSubmitData) {
            heatmapSubmitData.forEach(item => sum += item.count);
            return sum;
        }
        return sum;
    }

    // 渲染时间轴
    function renderTimeLine() {
        let showMore = true;
        const timeline = submitActivityData.map(item => {
            const day = item.date.split('-')
            if (day.length > 2) {
                showMore = false;
            }
            return <TimeLine
                icon={<LinkOutlined style={{fontSize: '16px'}}/>}
                data={{
                    prefix: day.length === 2 ? dayjs(item.date).format("MM月") : dayjs(item.date).format("MM月DD日"),
                    suffix: dayjs(item.date).format("YYYY"),
                    content: item.data[0].rows.length > 0 ? [{
                        title: <div className={'flex items-center'}>
                          <span>创建了
                            <span style={{
                                color: platFormTheme.background === 'dark'
                                || (platFormTheme.background === 'system'
                                    && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#fff' : platFormTheme?.color
                            }}
                                  className={'font-medium px-1 text-md'}>{item.data[0].count.length > 0 ? item.data[0].count[0].total : 0}</span>个网址
                               ，复制了
                            <span style={{
                                color: platFormTheme.background === 'dark'
                                || (platFormTheme.background === 'system'
                                    && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#fff' : platFormTheme?.color
                            }}
                                  className={'font-medium px-1 text-md'}>{item.copyUrlCount || 0}</span>个网址
                            <span>
                              ，获得了<span style={{
                                color: platFormTheme.background === 'dark'
                                || (platFormTheme.background === 'system'
                                    && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#fff' : platFormTheme?.color
                            }}
                                           className={'font-medium px-1 text-md'}>{item.points || 0}</span>个积分
                            </span>
                          </span>
                        </div>,
                        comp: <HistoryUrl urls={item.data[0].rows} date={item.date}/>
                    }] : <Empty/>
                }}/>
        })

        return <>
            {timeline}
            {/*如果是年-月显示more，如果是年-月-日则不显示*/}
            <div className={''}>
                <Button block onClick={showMoreActivity}>显示更多活动</Button>
            </div>
        </>
    }

    // 显示更多活动记录
    async function showMoreActivity() {
        if (queryListAbortControllerRef.current?.abort) {
            queryListAbortControllerRef.current.abort();
        }
        queryListAbortControllerRef.current = new AbortController()
        const prevDate = submitActivityData[submitActivityData.length - 1].date;
        let nextDate = ''
        let format = ''
        // 校验日期格式
        if (prevDate && dayjs(prevDate, 'YYYY-MM', true).isValid()) {
            nextDate = dayjs(prevDate).add(-1, 'month').format('YYYY-MM');
            format = 'y-m'
        }
        if (prevDate && dayjs(prevDate, 'YYYY-MM-DD', true).isValid()) {
            nextDate = dayjs(prevDate).add(-1, 'day').format('YYYY-MM-DD');
            format = 'y-m-d'
        }

        console.log('prevDate=', prevDate)
        console.log('nextDate=', nextDate)
        console.log('userInfo=', userInfo)
        const res = await dispatch(getSubmitUrlByDate({
            userName: guysInfo?.userName,
            loginUserName: userInfo?.name || '',
            date: nextDate,
            format: format,
            abortController: queryListAbortControllerRef.current
        }))
        console.log('res=', res)
        if (res.payload.data && res.payload.data.length > 0) {
            dispatch(setSubmitActivityData({
                data: res.payload.data[0],
                format: 'push'
            }))
        }
    }

    return (
        <div className={''}>
            <div className={''}>
                <UserStatistic guysData={guysData} guysInfo={guysInfo}/>
                {/*{*/}
                {/*  userInfo.introduction ?*/}
                {/*    <><Title title="个人简介"/>*/}
                {/*      <div className={styles.commonSlot}>*/}
                {/*        <p className={styles.introduction}>{userInfo.introduction}</p>*/}
                {/*      </div>*/}
                {/*    </> : null*/}
                {/*}*/}
                <div className={'font-medium text-md pb-2'}>常用网址</div>
                <FavoriteUrls urls={recentlyVisitUrls.slice(0, 9)}/>
                <div className={'flex items-center justify-between py-4'}>
                    <div className={'text-md'}>过去一年共提交<span style={{
                        color: platFormTheme.background === 'dark'
                        || (platFormTheme.background === 'system'
                            && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#fff' : platFormTheme?.color
                    }}
                                                                   className={'font-medium px-1 text-md'}>{getSubmitTotal()}</span>次
                    </div>
                    <div className={'hidden xl:block'}>
                        <HeatMapLegend/>
                    </div>
                </div>
                <div className={'hidden xl:block'}>
                    <UserHeatmap guysInfo={guysInfo} userInfo={userInfo}/>
                </div>
                <div>
                    <div className={'flex items-center justify-between py-4'}>
                        <div>活动记录</div>
                        <div>
                            <Select defaultValue={dayjs().year()} onChange={changeYear} style={{width: 120}}>
                                {
                                    submitYearList.map(item => {
                                        return <Option value={item}>{item}</Option>
                                    })
                                }
                            </Select>
                        </div>
                    </div>
                    {renderTimeLine()}
                </div>
            </div>
        </div>
    );
};

export default Overview;
