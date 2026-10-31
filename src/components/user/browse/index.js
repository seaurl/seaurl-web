'use client'
import {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useRouter} from "next/navigation";

import {
    UserOutlined,
    AntDesignOutlined,
    UsergroupAddOutlined,
    LinkOutlined,
    UserAddOutlined,
    ArrowLeftOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import {
    Timeline,
    Button,
    Tabs,
    Avatar,
    Row,
    Col,
    Affix,
    BackTop,
    Space,
    Modal,
    Tooltip,
    Divider,
    Badge,
    Select, Pagination, Radio
} from "antd";
import TimeLine from '../timeline';
import {getWatchUserToToday} from "@/lib/slices/userSlice";
import Empty from "@/components/empty";
import Loading from "@/components/loading";

const Browse = ({guysInfo}) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const {platFormTheme} = useSelector(state => state.system)

    // const {userData, me, isLogin, userInfo} = useSelector((state) => {
    //     const {me, isLogin, userInfo} = state.auth
    //     return {
    //         me, isLogin, userInfo,
    //         ...state.user,
    //         hydrate: state.system.currentHydrate
    //     }
    // }, (_old, _new) => _old.hydrate !== _new.hydrate);


    const [timeLineData, setTimeLineData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getData()
    }, [])

    async function getData() {
        setLoading(true)
        const res = await dispatch(getWatchUserToToday({
            userName: guysInfo.userName
        }))
        setLoading(false)
        console.log('await res=>', res)
        if (res.payload.status === 0) {
            const resData = res.payload.data;
            if (resData && resData.length > 0) {
                // dateGroup是按年-月-日分组的数据
                let dateGroup = [];
                resData.forEach((item, index) => {
                    // 判断year-month-day数据是否存在于dateGroup
                    const existDates = dateGroup.filter(da => da.date === item.date);
                    // 如果存在
                    if (existDates.length > 0) {
                        // 将数据存入rows中
                        dateGroup[existDates[0].index].rows.push(item)
                    } else {
                        // 否则新加一条数据
                        dateGroup.push({
                            index,
                            date: item.date,
                            rows: [item]
                        })
                    }
                })
                setTimeLineData(dateGroup);
                console.log('dateGroup=>', dateGroup)
            }
        }
    }

    function renderTimeLine() {
        if (loading) {
            return <div className={'flex items-center justify-center w-full'}>
                <Loading/>
            </div>
        } else {
            if (timeLineData.length <= 0) {
                return <div className={'flex items-center justify-center w-full'}>
                    <Empty/>
                </div>;
            }
            return <div className={''}>
                {
                    timeLineData.map(item => {
                        let rowItems = []
                        item.rows.forEach(row => {
                            rowItems.push({
                                title: row.time,
                                comp: <div className={'flex items-center gap-2'}>
                                    <a href={`/${row.userName}`}>
                                        <Avatar src={row.avatar} size={50}/>
                                    </a>
                                    <div className={''}>
                                        <a className={'text-md'} style={{color: platFormTheme?.color}} href={`/${row.userName}`}>
                                            {row.userName}
                                        </a>
                                        {/*<span className={'pl-2 text-sm'}>访问了</span>*/}
                                    </div>
                                </div>
                            })
                        })
                        let dates = item.date.split('-');
                        return <TimeLine
                            icon={<ClockCircleOutlined style={{fontSize: '16px'}}/>}
                            data={{
                                prefix: `${dates[1]}月${dates[2]}日`,
                                suffix: `${dates[0]}`,
                                content: rowItems
                            }}/>
                    })
                }
            </div>
        }

    }

    return <div className={''}>
        {/*<div className={styles.topHeader}>*/}
        {/*    /!*<ArrowLeftOutlined className={styles.back} onClick={back}/>*!/*/}
        {/*    <div className={styles.centerTitle}>*/}
        {/*        <Space>*/}
        {/*            <span className={styles.tip}>今日浏览：{userData.todayWatchMeCount}</span>*/}
        {/*            <span className={styles.tip}>全部浏览：{userData.totalWatchMeCount}</span>*/}
        {/*        </Space>*/}
        {/*    </div>*/}
        {/*</div>*/}

        <div className={''}>
            {renderTimeLine()}
        </div>
    </div>
}

export default Browse;
