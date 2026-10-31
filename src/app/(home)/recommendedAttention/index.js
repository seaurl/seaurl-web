'use client'
// import styles from './index.module.scss'
import {Divider, Button, Space, Spin} from 'antd'
import {LoadingOutlined, PlusOutlined} from '@ant-design/icons';
import {getTop10UsersInMonth} from '@/lib/slices/homeSlice'
import {followUser} from '@/lib/slices/userSlice'
import {useDispatch} from "react-redux";
import React, {useEffect, useState} from "react";
import _ from 'lodash'
import Empty from "@/components/empty";
import Loading from '@/components/loading'
import {withRouter} from "@/hoc/withRouter";

const RecommendedAttention = ({topUsers: top10Users = [], routerPush}) => {
    const dispatch = useDispatch();

    const [topUsers, setTopUsers] = useState(top10Users)

    // 点击关注
    async function onClickFollow(item, index) {
        const res = await dispatch(followUser({
            followedUserName: item.userName,
            status: !topUsers[index].isFollow
        }))
        console.log('followUser res=', res)
        if (res.payload) {
            topUsers[index].isFollow = !topUsers[index].isFollow
            console.log('topUsers=', topUsers)
            setTopUsers(_.cloneDeep(topUsers))
        }
    }

    function renderList() {
        if (topUsers.length === 0) {
            return <div className={''}>
                {/*<span className={styles.tip}>暂无数据</span>*/}
                {/*<p className={styles.desc}>暂无数据</p>*/}
                <Empty/>
            </div>
        } else {
            return topUsers.slice(0, 6).map((item, index) => {
                return <div key={index} className={'flex items-center justify-between py-2'}>
                    <div className={'flex items-center gap-4'}>
                        <img className={'w-[50px] h-[50px] rounded-full'} src={item.avatar}/>
                        <div className={'flex items-start flex-col gap-1'}>
                            <div className={'cursor-pointer'} onClick={()=>{
                                routerPush(`/${item.userName}`)
                            }}>{item.userName}</div>
                            <div className={'text-xs text-[#666]'}>
                                网址：{item.urlCount}
                            </div>
                        </div>
                    </div>
                    <div className={''}>
                        <Button type={!item.isFollow ? 'primary' : 'default'} shape="round"
                                onClick={() => onClickFollow(item, index)}>{item.isFollow ? '取消关注' : '关注'}</Button>
                    </div>
                </div>
            })
        }
    }

    return renderList()
}

export default withRouter(RecommendedAttention);
