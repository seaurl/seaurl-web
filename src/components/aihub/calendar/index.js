'use client'
import {Button, Calendar as AntdCalendar, Select} from 'antd';
import {LeftOutlined, RightOutlined} from "@ant-design/icons";
import React, {useEffect, useRef, useState} from "react";
import {Solar} from 'lunar-javascript';
import classNames from "classnames/bind";
import dayjs from "dayjs";
import {getHolidays, queryUserAiTools, updateDt} from "@/lib/slices/aiSpaceSlice";
import {useDispatch, useSelector} from "react-redux";
import {useSearchParams} from "next/navigation";
import CalendarDb from "@/db/aiSpace/calendarDb";

const Calendar = () => {
    const dispatch = useDispatch()
    const [isUpdate, setUpdate] = useState(false)
    const query = useSearchParams()

    // const [holidays, setHolidays] = useState([])
    // const {calendar} = useSelector(state => state.aiSpace)
    // const {holidays} = calendar
    const [holidays, setHolidays] = useState(null)

    const calendarDbRef = useRef(null)
    useEffect(() => {
        calendarDbRef.current = new CalendarDb()
        queryHolidays(dayjs().format('YYYY'))
    }, [])

    function globalUpdate() {
        if (!isUpdate) {
            const usedId = query.get('usedId')
            if (usedId) {
                // 更新时间并置顶
                dispatch(updateDt({
                    usedId
                }))
                dispatch(queryUserAiTools())
            }
            setUpdate(true)
        }
    }

    // 初始化缓存数据，从indexedDb中拿
    async function queryHolidays(year) {
        console.log('------queryHolidays--------', year)
        const res = await calendarDbRef.current.getHolidays(year)
        console.log('------initCache-------', year, res)
        if (!res) {
            const res2 = await dispatch(getHolidays(year))
            if (res2.payload.resData?.status === 0 && res2.payload.resData?.data?.length > 0 && calendarDbRef?.current?.saveData) {
                calendarDbRef.current.saveData(year, res2.payload.resData.data)
                setHolidays({
                    year,
                    list: res2.payload.resData.data
                })
            }
        } else {
            setHolidays(res)
        }
    }

    const headerRender = ({value, onChange}) => {
        const currentMonth = value.month();
        const currentYear = value.year();

        const prevMonth = () => {
            const newValue = value.clone().subtract(1, 'month');
            onChange(newValue);
            queryHolidays(newValue.format('YYYY'))
        };

        const nextMonth = () => {
            const newValue = value.clone().add(1, 'month');
            onChange(newValue);
            queryHolidays(newValue.format('YYYY'))
        };

        const handleYearChange = (year) => {
            console.log('----handleYearChange-----', year)
            const newValue = value.clone().year(year);
            onChange(newValue);
            queryHolidays(year.toString())
        };

        const handleMonthChange = (month) => {
            const newValue = value.clone().month(month);
            onChange(newValue);
            queryHolidays(newValue.format('YYYY'))
        };

        // Generate years list for the dropdown
        const years = [];
        for (let i = currentYear - 10; i <= currentYear + 10; i++) {
            years.push(i);
        }

        // Generate months list for the dropdown
        const months = [];
        for (let i = 0; i < 12; i++) {
            months.push({value: i, label: value.clone().month(i).format('MMMM')});
        }

        function onClickToday() {
            onChange(dayjs());
        }

        return (
            <div className={'pt-5 pb-5 w-full flex items-center justify-center'}>
                <div className={'flex items-center justify-between gap-2 w-[400px]'}>
                    <Button onClick={prevMonth} icon={<LeftOutlined/>}/>
                    <div className={'flex items-center gap-2'}>
                        <Select
                            value={currentYear}
                            onChange={handleYearChange}
                            options={years.map(year => ({value: year, label: year}))}
                            style={{width: 80}}
                        />
                        <Select
                            value={currentMonth}
                            onChange={handleMonthChange}
                            options={months}
                            style={{width: 90}}
                        />
                    </div>
                    <Button onClick={onClickToday} type={'primary'}>今天</Button>
                    <Button onClick={nextMonth} icon={<RightOutlined/>}/>
                </div>
            </div>
        );
    };

    // 使用 fullCellRender 自定义单元格渲染
    const fullCellRender = (value) => {
        // 将 moment 对象转换为 JavaScript Date 对象
        const date = value.toDate();
        const isToday = value.isSame(dayjs(), 'date')
        const isWeekend = value.day() === 6 || value.day() === 0; // 判断是否为周六或周日

        // 使用 solar2lunar 获取农历信息
        const lunar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());

        // console.log('ddddd======',value.format('YYYY-MM-DD'));
        const currentDay = value.format('YYYY-MM-DD')
        const currentYear = value.format('YYYY')
        // const fs = holidays.filter(f => f.year === currentYear)
        let fs2 = []
        if (holidays?.list?.length > 0) {
            fs2 = holidays.list.filter(f => f.date === currentDay)
        }

        let holidayNames = ['休', '班']

        // 如果是初一，显示月份；否则显示日期
        // const lunarText = lunar.day === 1 ? `${lunar.month}月` : lunar.day;
        // console.log('---------Solar.fromYmd----------',lunar.getLunar().getFestivals());
        return (
            <div className={classNames({
                'ant-picker-cell-inner': true,
                'ant-picker-calendar-date': true,
                'flex items-start': true,
                'ant-picker-calendar-date-today': isToday,
                'text-red-600': isWeekend // 周六或周日字体颜色标红
            })}>
                <div className={'ant-picker-calendar-date-value flex items-center justify-between'}>
                    <span
                        className={'lg:block hidden'}>{lunar.getLunar().getDay() === 1 ? `${lunar.getLunar().getMonthInChinese()}月` : null}{lunar.getLunar().getDayInChinese() || ''}</span>
                    <span className={'text-base flex items-center'}>{value.date()}<span
                        className={'lg:block hidden'}>日</span></span>
                </div>
                <div className={'ant-picker-calendar-date-content lg:block hidden'}>

                    {/*<div className={'w-[30px] h-[30px] flex items-center justify-center bg-[red] rounded-full'}>班</div>*/}
                    {
                        fs2.length > 0 ? <div
                            className={classNames({
                                'w-full flex items-center justify-center text-white rounded-full mt-1': true,
                                'bg-[#4E5977]': fs2[0].type === 1,
                                'bg-[#EB3334]': fs2[0].type === 0
                            })}>
                            {holidayNames[fs2[0].type]}{`${fs2[0].highway === 0 ? "-高速免费" : ''}`}

                        </div> : null
                    }
                    {
                        lunar.getFestivals().length > 0 ? lunar.getFestivals().map(m => {
                            return <div
                                className={'text-sm text-[#4D6BFE] bg-[#D0EBFE] dark:bg-[#2E333D] dark:text-white rounded-2xl px-2 mt-1'}>{m || ''}</div>
                        }) : null
                    }
                    {
                        lunar.getLunar().getJieQi() ? <div
                            className={'text-sm text-[#4D6BFE] bg-[#D0EBFE] dark:bg-[#2E333D] dark:text-white rounded-2xl px-2 mt-1'}>{lunar.getLunar().getJieQi() || ''}</div> : null
                    }
                    {
                        lunar.getLunar().getFestivals().length > 0 ? lunar.getLunar().getFestivals().map(m => {
                            return <div
                                className={'text-sm text-[#4D6BFE] bg-[#D0EBFE] dark:bg-[#2E333D] dark:text-white rounded-2xl px-2 mt-1'}>{m || ''}</div>
                        }) : null
                    }
                    {/*{*/}
                    {/*    fs2.length > 0 && fs2[0].highway === 0 ? <div*/}
                    {/*        className={'text-sm text-[#4D6BFE] bg-[#D0EBFE] rounded-2xl px-2 mt-1'}>{fs2[0].highway === 0?'高速免费':''}</div> : null*/}
                    {/*}*/}
                </div>
            </div>
        );
    };

    return <div className={'h-screen overflow-y-auto'} onClick={globalUpdate}>
        {/*<div className={'flex items-center p-3 border-b border-[#ddd] font-medium'}>农历日历</div>*/}
        <AntdCalendar headerRender={headerRender} fullCellRender={fullCellRender}/>
    </div>
}

export default Calendar