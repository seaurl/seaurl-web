'use client'
import React, {useEffect, useState, useRef} from 'react'
import CalendarHeatmap from '@/components/calendarHeatMap';
// import {Tooltip} from "antd";
import styles from './index.module.scss'
import {useSelector, useDispatch, shallowEqual} from 'react-redux'
import dayjs from "dayjs";
import {getSubmitUrlByDate, setSubmitActivityData, setQueryDate} from "@/lib/slices/userSlice";

const UserHeatmap = ({guysInfo, userInfo}) => {
  const dispatch = useDispatch();
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 1)
  startDate.setFullYear(startDate.getFullYear() - 1)

  const tooltipRef = useRef(null)
  const {queryDate, heatmapSubmitData} = useSelector(state => state.user)

  const [submitDate, setSubmitDate] = useState({
    startDate: dayjs().add(-1, 'year').add(-1, 'day').toDate(),
    endDate: dayjs().toDate()
  })

  const [calContent, setCalContent] = useState(null)

  useEffect(() => {
    if (queryDate) {
      console.log('effect queryDate=', queryDate)
      const year = queryDate.split('-');
      // 这个CalendarHeatmap组件开始日期并不是设置的，而是再加一天，所以我这里要想设置成指定日期要-1
      const start = dayjs(`${year[0]}-01-01`).add(-1, 'days').toDate();
      const end = dayjs(`${year[0]}-12-31`).toDate();
      console.log('111start =', start)
      console.log('222end =', end)
      setSubmitDate({
        startDate: start,
        endDate: end
      })
    }

  }, [queryDate]);

  const weekCn = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const monthCn = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一', '十二']


  function getYearOfDays(year) {
    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0 ? 366 : 365
  }

  function getTooltipDataAttrs(value){
    // Temporary hack around null value.date issue
    if (!value || !value.date) {
      return null;
    }
    // Configuration for react-tooltip
    return {
      'title': `提交 ${value.count} 次，${value.date}`
    };
  }

  return <div className={''}>
    <div className={'border border-[#d3dce3] rounded-xl pt-[16px] pr-[40px] pb-0 pl-[20px] dark:border-[#474747]'}>
      {/*<HeatMap/>*/}
      {/*<HeatMap  startDate={new Date('2020/01/01')} />*/}
      <CalendarHeatmap
        weekdayLabels={weekCn}
        monthLabels={monthCn}
        startDate={submitDate.startDate}
        endDate={submitDate.endDate}
        gutterSize={2}
        values={heatmapSubmitData}
        classForValue={value => {
          if (!value) {
            return 'color-empty';
          }
          if (value.count > 8) {
            return `color-gitlab-9`;
          } else {
            return `color-gitlab-${value.count}`;
          }
        }}
        // tooltipDataAttrs={getTooltipDataAttrs}
        showWeekdayLabels={true}
        onMouseLeave={(e,value,currentDate) => {
          tooltipRef.current.style = `visibility:hidden;`
        }}
        onMouseOver={(e, value, currentDate)=>{
          const { left, top } = e.currentTarget.getBoundingClientRect();
          tooltipRef.current.style = `visibility:visible;top:${top-42}px;left: ${left-79}px`
          if (!value || !value.date) {
            setCalContent(`提交 0 次，${currentDate}`)
          }else{
            setCalContent(`提交 ${value.count} 次，${value.date}`)
          }
        }}
        onClick={async (value, currentDate) => {
          console.log('value=', value, ',onClick currentDate=', currentDate, ',userInfo=',userInfo)
          const res = await dispatch(getSubmitUrlByDate({
            userName: guysInfo.userName,
            loginUserName: userInfo?.name || '',

            date: currentDate,
            format: 'y-m-d'
          }))
          console.log('res=', res)
          if (res.payload.data && res.payload.data.length > 0) {
            dispatch(setSubmitActivityData({
              data: res.payload.data,
              format: 'replace'
            }))
          }
        }}
      />
    </div>
    <div className={styles.calTooltip} ref = {tooltipRef }>
      {calContent}
    </div>
  </div>
}

export default UserHeatmap;
