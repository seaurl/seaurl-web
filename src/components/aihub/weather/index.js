'use client'
import {Button, Calendar, Drawer, Dropdown, Input, message, Select, Space} from 'antd';
import React, {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    addCity,
    deleteCity,
    getWeatherFreeToken,
    getWeatherStandardToken,
    queryCity,
    queryUserAiTools,
    setWeather,
    topCity,
    updateDt
} from "@/lib/slices/aiSpaceSlice";
import dayjs from "dayjs";
import classNames from "classnames/bind";
import styles from './ index.module.scss'
import cns from "classnames/bind";
import Loading from "@/components/loading";
import Empty from "@/components/empty";
import {
    CloseOutlined,
    PicLeftOutlined,
    PlusCircleOutlined,
    PlusOutlined,
    VerticalAlignTopOutlined
} from "@ant-design/icons";
import {useSearchParams} from "next/navigation";
import WeatherDb from '@/db/aiSpace/weatherDb'

let cx = cns.bind(styles);

const Weather = () => {
    const dispatch = useDispatch()
    const {platFormTheme} = useSelector(state => state.system)
    const {weather} = useSelector(state => state.aiSpace)
    const {selectedDate} = weather

    const [cityWeatherIn24Hours, setCityWeatherIn24Hours] = useState([])
    const [cityWeatherIn30d, setCityWeatherIn30d] = useState([])
    const [cityWeatherIn10d, setCityWeatherIn10d] = useState([])
    const [loading, setLoading] = useState(true)
    const [isNight, setIsNight] = useState(false)
    const [searchCity, setSearchCity] = useState()
    const [searchCityList, setSearchCityList] = useState([])
    const [chooseCityWeatherOneOfDay, setChooseCityWeatherOneOfDay] = useState(null)
    const [chooseCity, setChooseCity] = useState(null)
    const [showAddBtn, setShowAddBtn] = useState(false)
    const freeToken = useRef('')

    const [loadingCityList, setLoadingCityList] = useState(true)
    const [openDrawer, setOpenDrawer] = useState(false)
    const query = useSearchParams()
    const isUpdate = useRef(false)
    const weekes = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weatherDbRef = useRef(null)
    const [targetList, setTargetList] = useState([])
    useEffect(() => {
        // 使用示例
        const weatherDb = new WeatherDb();
        weatherDbRef.current = weatherDb;

        initToken(async () => {
            fetchCityListToDb()
        })
        dispatch(setWeather({
            action: 'selectedDate',
            data: dayjs()
        }))
        return () => {
            if (weatherDb?.close) {
                weatherDb.close();
            }
        }
    }, [])

    // useEffect(() => {
    //     if (originList.length > 0) {
    //         initToken(() => {
    //             fetchNowWeather();
    //         })
    //     } else {
    //         setLoadingCityList(false)
    //     }
    // }, [originList])

    async function fetchCityListToDb() {
        weatherDbRef.current.getOriginList().then(async dataList => {
            console.log('--------------queryCityList-', dataList)
            const now = new Date().getTime(); // 当前时间戳

            // 没有数据要查
            if (!dataList || dataList.length === 0) {
                fetchCityData(now)
            } else {
                // 查询最新的一条数据
                const latestData = dataList[0]

                // 超过时间要查
                // 判断时间差是否超过 15 分钟（15 分钟 = 15 * 60 * 1000 毫秒）
                if (!latestData || now - latestData.lastAt > 15 * 60 * 1000) {
                    // 如果没有数据或超过 15 分钟，清空表并插入新数据
                    console.log('originList cleared due to 15-minute threshold.');
                    fetchCityData(now)
                    console.log('WeatherDb data added successfully!');
                } else {
                    //如果没超过15分钟，并且，有数据，则从indexeddb中拿
                    weatherDbRef.current.getTargetList().then(dataList => {
                        setTargetList(dataList)
                        setLoadingCityList(false)
                        setLoading(false)

                        weatherDbRef.current.getChooseCity().then(data => {
                            const fs = dataList.filter(f => f.name === data.name)
                            if (fs && fs.length > 0) {
                                setChooseCity(data)
                            } else {
                                // 如果originList中和chooseCity不匹配，则默认选中第一条城市数据
                                setChooseCity(dataList[0])
                            }
                            setLoadingCityList(false)
                            setLoading(false)
                        })
                    })
                    weatherDbRef.current.getCityWeatherIn24Hours().then(dataList => {
                        setCityWeatherIn24Hours(dataList)
                        setLoadingCityList(false)
                        setLoading(false)
                    })
                    weatherDbRef.current.getCityWeatherIn30d().then(dataList => {
                        setCityWeatherIn30d(dataList)
                        setLoadingCityList(false)
                        setLoading(false)
                    })
                    weatherDbRef.current.getChooseCityWeatherOneOfDay().then(data => {
                        setChooseCityWeatherOneOfDay(data)
                        setLoadingCityList(false)
                        setLoading(false)
                    })

                }
            }
        })
    }

    async function fetchCityData(now, isQuery) {
        const res = await dispatch(queryCity())
        if (res.payload.status === 0 && weatherDbRef.current) {
            // 插入新数据（添加 lastAt 字段）
            const dataWithTimestamp = res.payload.data.map(item => ({
                ...item,
                lastAt: now
            }));
            weatherDbRef.current.setOriginList(dataWithTimestamp)
            fetchNowWeather(dataWithTimestamp, isQuery);
        }
    }

    function globalUpdate() {
        if (!isUpdate.current) {
            const usedId = query.get('usedId')
            if (usedId) {
                // 更新时间并置顶
                dispatch(updateDt({
                    usedId
                }))
                dispatch(queryUserAiTools())
            }
            isUpdate.current = true
        }
    }

    function isDark() {
        return platFormTheme.background === 'dark'
            || (platFormTheme.background === 'system'
                && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }

    async function initToken(cb) {
        const res = await dispatch(getWeatherStandardToken())
        if (res.payload.status === 0 && res.payload.data) {
            freeToken.current = res.payload.data
            if (cb) {
                cb()
            }
        }
    }

    // isQuery=true说明要查30天的天气和24h天气，否则不查
    const fetchNowWeather = async (listData, isQuery = true) => {
        try {
            const promises = listData.map(async (item) => {
                if (item.lat && item.lon) {
                    return searchWeatherByNow(`${item.lon},${item.lat}`);
                }
                return null;
            });
            // setLoadingCityList(true)
            const results = await Promise.all(promises);
            setLoadingCityList(false)
            let newList = []
            results.forEach((item, index) => {
                if (item.code === '200' && item.now) {
                    newList.push({
                        ...listData[index],
                        // now里面有天气图标
                        now: item.now
                    })
                }
            })

            console.log('-------fetchWeatherData----------', newList)

            weatherDbRef.current.setTargetList(newList);
            setTargetList(newList)

            if (isQuery) {
                onInitCityWeather(newList[0])
            } else {
                weatherDbRef.current.setChooseCity(newList[0])
                setChooseCity(newList[0])
            }
            // setLoadingCityList(false)
        } catch (error) {
            console.error('Error fetching weather data:', error);
        } finally {
            setLoading(false);
        }
    };

    async function onChooseCity(e) {
        console.log('--- onChooseCity ---', e)
        if (e) {
            const fs = searchCityList.filter(city => city.name === e)
            if (fs.length > 0 && fs[0].lon && fs[0].lat) {
                setLoading(true)
                setShowAddBtn(true)
                weatherDbRef.current.setChooseCity(fs[0])
                setChooseCity(fs[0])
                searchWeatherBy30d(`${fs[0].lon},${fs[0].lat}`, () => {
                    searchWeatherByHour(`${fs[0].lon},${fs[0].lat}`)
                })
            }

            setSearchCity(e)
            setSearchCityList([])
        }
    }

    async function onAddCity() {
        console.log('--- onAddCity ---', chooseCity)
        if (chooseCity) {
            const res = await dispatch(addCity(chooseCity))
            if (res.payload.status === 0) {
                // fetchCityListToDb()
                const now = new Date().getTime(); // 当前时间戳
                fetchCityData(now, false)
            } else if (res.payload.status === 20031) {
                message.info(res.payload.message)
            }
        }
    }

    function onClear() {
        setShowAddBtn(false)
        setSearchCity(undefined)
    }

    async function onSearchCity(val) {
        if (freeToken.current && val) {
            fetch(`https://geoapi.qweather.com/v2/city/lookup?location=${val}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${freeToken.current}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`)
                    }
                    return response.json()
                })
                .then(async data => {
                    console.log('Response data:', data)
                    if (data.code === '200') {
                        if (data.location.length > 0) {
                            // searchWeatherNow(token, data)
                        }
                        setSearchCityList(data.location)
                    }
                })
                .catch(error => {
                    console.error('Fetch error:', error)
                })
        }

    }

    async function searchWeatherByNow(data) {
        if (freeToken.current && data) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_WEATHER_STANDARD_HOST}/v7/weather/now?location=${data}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${freeToken.current}`
                }
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('searchWeatherByNow Response data:', result);
            return result;
        }
    }

    async function searchWeatherByHour(data) {
        if (freeToken.current && data) {
            fetch(`${process.env.NEXT_PUBLIC_WEATHER_STANDARD_HOST}/v7/weather/24h?location=${data}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${freeToken.current}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`)
                    }
                    return response.json()
                })
                .then(data => {
                    console.log('searchWeatherByHour Response data:', data)
                    if (data.code === '200') {
                        if (data?.hourly?.length > 0) {
                            setCityWeatherIn24Hours(data.hourly)
                            weatherDbRef.current.setCityWeatherIn24Hours(data.hourly)
                        }
                    }
                    setLoading(false)
                })
                .catch(error => {
                    console.error('Fetch error:', error)
                })
        }
    }

    async function searchWeatherBy30d(data, cb) {
        if (data && freeToken.current) {
            fetch(`${process.env.NEXT_PUBLIC_WEATHER_STANDARD_HOST}/v7/weather/30d?location=${data}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${freeToken.current}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`)
                    }
                    return response.json()
                })
                .then(data => {
                    console.log('searchWeatherBy30d Response data:', data)
                    if (data.code === '200') {
                        setCityWeatherIn30d(data.daily)
                        weatherDbRef.current.setCityWeatherIn30d(data.daily)

                        chooseDay(dayjs(), data.daily)


                        if (cb) {
                            cb()
                        }
                    }
                })
                .catch(error => {
                    console.error('Fetch error:', error)
                })
        }
    }

    function chooseDay(date, data) {
        const fs = data.filter(f => date.isSame(f.fxDate, 'day'))
        console.log('fs-----', fs)
        if (fs.length > 0) {
            // 日出
            if (fs[0].sunrise) {
                const result = dayjs().isAfter(`${dayjs().format('YYYY-MM-DD')} ${fs[0].sunrise}:00`, 'minute')
                console.log('sunrise result=', result)
                setIsNight(!result)
            }
            // 日落
            if (fs[0].sunset) {
                const result = dayjs().isAfter(`${dayjs().format('YYYY-MM-DD')} ${fs[0].sunset}:00`, 'minute')
                console.log('sunset result=', result)
                setIsNight(result)
            }
            setChooseCityWeatherOneOfDay(fs[0])
            weatherDbRef.current.setChooseCityWeatherOneOfDay(fs[0])
        }
    }

    // 加前缀
    function renderCalendarPrev() {
        if (cityWeatherIn30d.length > 0 && cityWeatherIn30d[0].fxDate) {
            const len = dayjs(cityWeatherIn30d[0].fxDate).day()
            let list = []
            for (let i = 0; i < len; i++) {
                list.push(<div></div>)
            }
            return list
        }

        return null
    }

    function onInitCityWeather(item) {
        if (item) {
            setLoading(true)
            // dispatch(setWeather({
            //     action: 'chooseCity',
            //     data: item
            // }))
            weatherDbRef.current.setChooseCity(item)
            setChooseCity(item)

            if (item.lon && item.lat) {
                searchWeatherBy30d(`${item.lon},${item.lat}`, () => {
                    searchWeatherByHour(`${item.lon},${item.lat}`)
                })
            }

            chooseDay(dayjs(), cityWeatherIn30d)
            dispatch(setWeather({
                action: 'selectedDate',
                data: dayjs()
            }));
        }
    }

    function renderCalendar10D() {
        const weatherData = cityWeatherIn30d.slice(0, 10)
        const max = Math.max(...weatherData.map((item) => item.tempMax));
        const min = Math.min(...weatherData.map((item) => item.tempMin));
        const rangeLength = max - min + 1; // 动态计算范围长度

        // 计算 10 度的位置
        const tenDegreePosition = (10 - min) / rangeLength * 100;
        return <div className={'w-full flex lg:flex-col lg:overflow-hidden flex-row gap-[9px] overflow-x-auto'}>
            {
                weatherData.map(item => {
                    const weekOf = dayjs(item.fxDate).day()
                    return <div className={'flex flex-row gap-2'}>
                        <div className={'flex items-center justify-center'}>
                            <div className={classNames({
                                'text-base whitespace-nowrap': true,
                                'text-[red]': [0, 6].includes(weekOf)
                            })}>{weekes[weekOf]}</div>
                        </div>
                        <div className={'w-[80px] h-[32px] flex items-center justify-center'}>
                            <img width={32} height={32} className={'flex-shrink-0'}
                                 src={`https://cdn.seaurl.com/space/ai/hefeng/${isNight ? item.iconNight : item.iconDay}.png`}/>
                        </div>
                        <div className={'flex items-center justify-center gap-2'}>
                            <div className={'w-[30px] flex-shrink-0'}>{item.tempMin}°</div>
                            <div className={cx({
                                processBar: true,
                                'flex-shrink-0': true
                            })}>
                                <div
                                    className={styles.progress}
                                    style={{
                                        '--min': item.tempMin,
                                        '--max': item.tempMax,
                                        '--global-min': min,
                                        '--global-max': max,
                                        '--global-range': rangeLength
                                    }}
                                ></div>
                            </div>
                            <div className={'w-[30px] flex-shrink-0'}>{item.tempMax}°</div>
                        </div>
                    </div>
                })
            }
        </div>
    }

    function renderCalendar30D() {
        return <div className={'w-full'}>
            <div className={'flex items-center justify-between text-sm'}>
                <p className={'w-[14.28%] flex items-center justify-center'}>日</p>
                <p className={'w-[14.28%] flex items-center justify-center'}>一</p>
                <p className={'w-[14.28%] flex items-center justify-center'}>二</p>
                <p className={'w-[14.28%] flex items-center justify-center'}>三</p>
                <p className={'w-[14.28%] flex items-center justify-center'}>四</p>
                <p className={'w-[14.28%] flex items-center justify-center'}>五</p>
                <p className={'w-[14.28%] flex items-center justify-center'}>六</p>
            </div>
            <div className={'grid grid-cols-7 gap-2 pb-0 pt-3'}>
                {
                    renderCalendarPrev(cityWeatherIn30d)
                }
                {
                    cityWeatherIn30d.map((item, index) => {
                        const isSelected = dayjs(item.fxDate).isSame(selectedDate, 'day');
                        const isToday = dayjs(item.fxDate).isSame(dayjs(), 'date')
                        // 因为显示问题，要把第一个日期是周六的最后一个数据删除，否则页面显示超出了
                        if (dayjs(cityWeatherIn30d[0].fxDate).day() === 6 && cityWeatherIn30d.length - 1 === index) {
                            return null
                        }
                        const isWeekend = dayjs(item.fxDate).day() === 6 || dayjs(item.fxDate).day() === 0; // 判断是否为周六或周日

                        return <div className={classNames({
                            'flex items-center justify-center flex-col relative p-1 rounded-xl cursor-pointer ': true,
                            'bg-[#1677ff] text-white rounded-md': isSelected,
                            'bg-[#f1f1f1] dark:bg-[#2C3A65] dark:text-[#fff]': !isSelected,
                            'border border-[#1677ff] rounded-md': isToday,
                            'text-red-600 font-medium': isWeekend // 周六或周日字体颜色标红
                        })} key={index} onClick={() => {
                            chooseDay(dayjs(item.fxDate), cityWeatherIn30d)
                            dispatch(setWeather({
                                action: 'selectedDate',
                                data: item.fxDate
                            }));
                        }}>
                            <div className={'relative z-1 w-full flex flex-col flex-shrink-0 gap-1'}>
                                <div
                                    className={'w-full items-center justify-between px-1 flex-col lg:flex-row flex-shrink-0 flex'}>
                                    <span className={classNames({
                                        'hidden text-base sm:inline-block': true,
                                        'text-[#fff]': isSelected,
                                        'text-[#00000040] dark:text-[#fff]': !isSelected,
                                    })}>{dayjs(item.fxDate).format('D')}</span>
                                    <div className={'w-[28px] h-[28px] flex-shrink-0'}>
                                        <img width={28} height={28} className={'flex-shrink-0'}
                                             src={`https://cdn.seaurl.com/space/ai/hefeng/${isNight ? item.iconNight : item.iconDay}.png`}/>
                                    </div>
                                </div>
                                <div className={'flex items-center justify-center gap-2 px-1 line-clamp-1'}>
                                    {/*<span className={'text-sm hidden 2xl:block whitespace-nowrap'}>{isNight?item.textNight:item.textDay}</span>*/}
                                    <span className={'text-base hidden lg:block'}>{item.tempMax}°~{item.tempMin}°</span>
                                </div>
                            </div>
                        </div>
                    })
                }
            </div>
        </div>
    }

    function renderSidebar() {
        return <div className={'w-full'}>
            <div className={'p-2 flex items-center justify-between gap-2'}>
                <Select
                    showSearch
                    style={{width: '100%'}}
                    value={searchCity}
                    placeholder="请输入城市名"
                    defaultActiveFirstOption={false}
                    suffixIcon={null}
                    filterOption={false}
                    onSearch={onSearchCity}
                    allowClear
                    onChange={onChooseCity}
                    onClear={onClear}
                    notFoundContent={null}
                    options={(searchCityList || []).map((d) => ({
                        value: d.name,
                        label: `${d.name}`,
                    }))}
                />
                {showAddBtn ? <Button icon={<PlusOutlined/>} onClick={onAddCity}>添加</Button> : null}
            </div>
            <div className={'w-full flex flex-col px-2 gap-2'}>
                {loadingCityList ? <div className={'w-full p-4 flex items-center justify-center'}>
                    <Loading/>
                </div> : null}
                {!loadingCityList && targetList?.length === 0 ? <div>
                    <Empty/>
                </div> : null}

                {!loadingCityList && targetList?.map(item => {

                    return <Dropdown
                        menu={{
                            items: [{
                                label: '置顶',
                                icon: <VerticalAlignTopOutlined/>,
                                key: 'top',
                            },
                                {
                                    label: '删除',
                                    danger: true,
                                    icon: <CloseOutlined/>,
                                    key: 'delete',
                                }],
                            onClick: async ({key}) => {
                                const now = new Date().getTime(); // 当前时间戳
                                if (key === 'delete') {
                                    const res = await dispatch(deleteCity(item.id));
                                    if (res.payload.status === 0) {
                                        fetchCityData(now, false)
                                    }
                                }
                                if (key === 'top') {
                                    const res = await dispatch(topCity(item.id))
                                    if (res.payload.status === 0 && res.payload.data) {
                                        fetchCityData(now, false)
                                    }
                                }
                            }
                        }}
                        trigger={['contextMenu']}>
                        <div className={classNames({
                            'w-full flex flex-row items-center justify-between px-4 py-4 hover:bg-[#d4cef1] dark:hover:bg-[#123456] rounded-2xl cursor-pointer': true,
                            'bg-[#d4cef1] dark:bg-[#123456]': chooseCity?.id === item.id,
                            'bg-[#eee] dark:bg-[#2E333D]': chooseCity?.id !== item.id
                        })}
                             onClick={() => {
                                 setOpenDrawer(false)
                                 onInitCityWeather(item)
                             }}>
                            <div className={'font-medium text-base'}>{item.name}</div>
                            <div className={'flex flex-col items-center gap-2'}>
                                <div className={'flex items-center justify-center gap-2 flex-col w-[40px]'}>
                                    {/*<div className={'text-sm flex items-center gap-2'}>*/}
                                    {/*    {item.now?.temp || ''}°*/}
                                    {/*</div>*/}
                                    <img width={40} height={40} className={'flex-shrink-0'}
                                         src={`https://cdn.seaurl.com/space/ai/hefeng/${item.now?.icon}.png`}/>
                                    {/*<div className={'text-sm'}>*/}
                                    {/*    {item.now?.text || ''}*/}
                                    {/*</div>*/}
                                </div>
                            </div>
                            <div className={'text-xl font-medium flex items-center flex-col w-[30px]'}>

                                {item.now?.temp || ''}°
                            </div>

                        </div>
                    </Dropdown>
                })}
            </div>
        </div>
    }

    return <div className={cx({
        'w-full h-full flex flex-row': true,
        'container': true
    })} onClick={globalUpdate}>
        <div
            className={'w-[280px] h-[100vh] overflow-y-auto border-r border-[#ddd] dark:border-[#474747] hidden 2xl:flex  flex-col gap-2 flex-shrink-0'}>
            {renderSidebar()}
        </div>
        <div
            className={'2xl:w-[calc(100%-280px)] w-full overflow-x-auto h-[100vh] overflow-y-auto  bg-[#eee] dark:bg-[#141414]'}>
            <span className={classNames({
                '2xl:hidden cursor-pointer text-base p-4': true,
                'hidden': loading
            })} onClick={() => setOpenDrawer(true)}>
                <PicLeftOutlined/>
            </span>
            {loading ? <div className={'w-full p-4 flex items-center justify-center'}>
                <Loading/>
            </div> : null}
            {
                !loading && (cityWeatherIn30d?.length === 0 || cityWeatherIn24Hours.length === 0) ? <Empty/> : null
            }
            {
                !loading && cityWeatherIn30d?.length > 0 && cityWeatherIn24Hours.length > 0 ? <>
                    <div className={'w-full px-2 pt-3'}>
                        <div className={'p-4 w-full bg-[#fff] dark:bg-[#2E333D] rounded-xl shadow'}>
                            <div className={'text-xs flex items-center'}>
                                <span>{selectedDate.format('YYYY-MM-DD')}</span><span>天气预报</span>
                            </div>
                            <div className={'flex flex-row py-2 px-4 gap-10 overflow-x-auto w-full'}>
                                {
                                    chooseCityWeatherOneOfDay ?
                                        <div className={'flex flex-row w-full items-center justify-around gap-4'}>
                                            <div className={'flex-shrink-0 w-[80px] h-[80px]'}>
                                                <img width={80} height={80}
                                                     src={`https://cdn.seaurl.com/space/ai/hefeng/${isNight ? chooseCityWeatherOneOfDay.iconNight : chooseCityWeatherOneOfDay.iconDay}.png`}/>
                                            </div>
                                            <div className={'flex items-center min-w-[100px] flex-col gap-2'}>
                                        <span
                                            className={'text-2xl'}>{chooseCityWeatherOneOfDay.tempMax}°~{chooseCityWeatherOneOfDay.tempMin}°</span>
                                                <span
                                                    className={'text-sm text-[#333] dark:text-white'}>{isNight ? chooseCityWeatherOneOfDay.textNight : chooseCityWeatherOneOfDay.textDay}</span>
                                            </div>
                                            <div className={'flex items-center min-w-[100px] flex-col gap-2'}>
                                        <span
                                            className={'text-2xl'}>{isNight ? chooseCityWeatherOneOfDay.windScaleNight : chooseCityWeatherOneOfDay.windScaleDay}级</span>
                                                <span
                                                    className={'text-sm text-[#333] dark:text-white'}>{isNight ? chooseCityWeatherOneOfDay.windDirNight : chooseCityWeatherOneOfDay.windDirDay}</span>
                                            </div>
                                            <div className={'flex items-center min-w-[100px] flex-col gap-2'}>
                                                <span className={'text-2xl'}>{chooseCityWeatherOneOfDay.precip}mm</span>
                                                <span className={'text-sm text-[#333] dark:text-white'}>降水量</span>
                                            </div>
                                            <div className={'flex items-center min-w-[100px] flex-col gap-2'}>
                                                <span className={'text-2xl'}>{chooseCityWeatherOneOfDay.uvIndex}</span>
                                                <span className={'text-sm text-[#333] dark:text-white'}>紫外线</span>
                                            </div>
                                            <div className={'flex items-center min-w-[100px] flex-col gap-2'}>
                                                <span
                                                    className={'text-2xl'}>{chooseCityWeatherOneOfDay.humidity}%</span>
                                                <span className={'text-sm text-[#333] dark:text-white'}>相对湿度</span>
                                            </div>
                                            <div className={'flex items-center min-w-[100px] flex-col gap-2'}>
                                                <span className={'text-2xl'}>{chooseCityWeatherOneOfDay.sunrise}</span>
                                                <span className={'text-sm text-[#333] dark:text-white'}>日出</span>
                                            </div>
                                            <div className={'flex items-center min-w-[100px] flex-col gap-2'}>
                                                <span className={'text-2xl'}>{chooseCityWeatherOneOfDay.sunset}</span>
                                                <span className={'text-sm text-[#333] dark:text-white'}>日落</span>
                                            </div>
                                        </div> : null
                                }

                            </div>
                        </div>
                    </div>

                    <div className={'flex lg:flex-row flex-col px-2 lg:gap-2 w-full'}>
                        <div className={'lg:w-[300px] w-full flex flex-col pb-0 gap-4 pt-2'}>
                            <div className={'p-4 pb-0 w-full bg-[#fff] dark:bg-[#2E333D] shadow rounded-xl'}>
                                <div className={'text-xs flex items-center'}>
                                    10日天气预报
                                </div>
                                <div className={'flex items-center justify-between gap-2 py-4'}>
                                    {cityWeatherIn30d?.length > 0 ? renderCalendar10D() : null}
                                </div>
                            </div>
                        </div>
                        <div className={'lg:w-[calc(100%-300px)] w-full flex flex-col pt-2 pb-0 gap-4'}>
                            <div className={'flex-1 p-4 pb-0 w-full bg-[#fff] dark:bg-[#2E333D] shadow rounded-xl'}>
                                <div className={'text-xs flex items-center '}>
                                    30日天气预报
                                </div>
                                <div className={'flex items-center justify-between gap-2 py-3'}>
                                    {cityWeatherIn30d?.length > 0 ? renderCalendar30D() : null}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={'w-full px-2 pt-2'}>
                        <div className={'bg-[#fff] dark:bg-[#2E333D] shadow rounded-2xl  w-full p-4 pb-0'}>
                            <div className={'text-xs flex items-center'}>
                                每小时天气预报
                            </div>
                            <div className={'flex flex-row py-2 px-4 gap-10 overflow-x-auto w-full'}>
                                {
                                    cityWeatherIn24Hours.map((item, index) => {
                                        return <div key={index} className={'flex flex-col items-center gap-2 pt-2'}>
                                            <span>{item.temp}°</span>
                                            <span className={'h-[50px] flex items-center justify-center'}>
                                        <img src={`https://cdn.seaurl.com/space/ai/hefeng/${item.icon}.png`}/>
                                    </span>
                                            {/*<span className={'whitespace-nowrap text-sm'}>{item.text}</span>*/}
                                            <div className={'flex items-center gap-1 text-sm pb-2'}>
                                                <span>{dayjs(item.fxTime).format('HH')}</span>
                                                <span>时</span>
                                            </div>
                                        </div>
                                    })
                                }
                            </div>
                        </div>
                    </div>

                </> : null
            }
        </div>

        <Drawer width={375} placement={'left'} onClose={() => setOpenDrawer(false)} closable={false} open={openDrawer}
                styles={{
                    body: {
                        padding: '0',
                    },
                }}>
            <div className={'w-full h-[calc(100vh-50px)]'}>
                {renderSidebar()}
            </div>
        </Drawer>
    </div>
}

export default Weather