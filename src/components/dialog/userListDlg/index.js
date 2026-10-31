'use client'
import InfiniteScroll from "react-infinite-scroll-component";
import {Avatar, Button, List, Modal, Space} from "antd";
import Loading from "@/components/loading";
import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {followUser} from "@/lib/slices/userSlice";
import {getTopUsersByPage} from "@/lib/slices/homeSlice";
import {useDispatch} from "react-redux";
import Empty from '@/components/empty'
import _ from "lodash";
import {withRouter} from "@/hoc/withRouter";
import styles from './index.module.scss'

const UserListDlg = (props) => {
    const dispatch = useDispatch();

    const router = useRouter();
    const {query} = router;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    // const [userList, setUserList] = useState([]);
    const [userTotal, setTotal] = useState(0)

    const modalTitleRef = useRef('用户列表')
    const userListRef = useRef([]);
    const [userList, setUserList] = useState([]);
    const abortControllerRef = useRef(null)

    const userListPage = useRef({
        pageSize: 20,
        pageNum: 0
    });

    const isFirstRef = useRef(true)
    const handleOk = () => {
        setIsModalOpen(false);

        setUserList([])
        props.onClose()
    };

    const handleCancel = () => {
        setIsModalOpen(false)
        // setUserList([])
        props.onClose()
    };

    useEffect(() => {
       return ()=>{
           if (abortControllerRef.current?.abort) {
               abortControllerRef.current.abort();
           }
       }
    }, [])

    useEffect(() => {
        if (props.open && isFirstRef.current) {
            isFirstRef.current = false
            if (abortControllerRef.current?.abort) {
                abortControllerRef.current.abort();
            }
            userListPage.current.pageNum = 0
            loadMoreData()
        }
    }, [props.open])

    // 加载更多用户列表
    const loadMoreData = async () => {
        if (loading) {
            return;
        }
        // 创建新的 AbortController
        abortControllerRef.current = new AbortController();

        setLoading(true);
        userListPage.current.pageNum += 1
        const res = await dispatch(getTopUsersByPage({
            pageSize: userListPage.current.pageSize,
            pageNum: userListPage.current.pageNum,
            abortController: abortControllerRef.current
        }))
        console.log('getTopUsersByPage res=', res)
        const resData = res.payload.data
        //
        if (resData?.rows && resData.rows.length > 0) {
            const total = resData.total
            setTotal(total)
            setUserList([...userList, ...resData.rows])
        }
        setLoading(false)
    }

    async function btnFollowing(item, index) {
        const res = await dispatch(followUser({
            status: !item.isFollow,
            followedUserName: item.userName
        }));
        if (res?.payload) {
            // userListRef.current[index].isFollow = !item.isFollow
            userList[index].isFollow = !item.isFollow
            // initFollowList(props.type, 1);
            setUserList(_.cloneDeep(userList))
        }
    }

    return <div>
        <Modal title={modalTitleRef.current}
               open={props.open}
               footer={null}
               width={600}
               wrapClassName={styles.container}
               styles={{
                   header: {
                       padding: '12px',
                       margin: '0'
                   }
               }}
               onOk={handleOk}
               onCancel={handleCancel}>
            <div
                id="scrollableDiv"
                style={{
                    height: 600,
                    overflow: 'auto',
                    padding: '0 16px'
                }}>
                {
                    !loading ? userList.length > 0 ? <InfiniteScroll
                        dataLength={userList.length}
                        next={loadMoreData}
                        hasMore={userList.length < userTotal}
                        // loader={
                        //     <Skeleton
                        //         avatar
                        //         paragraph={{
                        //             rows: 1,
                        //         }}
                        //         active
                        //     />
                        // }
                        endMessage={''}
                        scrollableTarget="scrollableDiv">
                        <List
                            dataSource={userList}
                            renderItem={(item, index) => (
                                <List.Item key={item.uid}>
                                    <List.Item.Meta
                                        avatar={<Avatar size={50} src={item.avatar}/>}
                                        title={
                                            <div className={''}>
                                                <Space>
                                                    {item.nickName ? <span className={''} onClick={() => {
                                                        handleCancel()
                                                        // router.push(`/${item.userName}`)
                                                        props.routerPush(`/${item.userName}`)
                                                    }}>
                                          {item.nickName}
                                        </span> : ''}
                                                    <span className={''} onClick={() => {
                                                        // handleCancel()
                                                        // router.push(`/${item.userName}`)
                                                        props.routerPush(`/${item.userName}`)
                                                    }
                                                    }>
                                          {item.userName}
                                        </span>
                                                </Space>
                                                <div
                                                    className={''}>网址数：{item.urlCount ? item.urlCount : 0}</div>
                                            </div>
                                        }
                                    />
                                    <div>
                                        <Button type={!item.isFollow ? 'primary' : 'default'} shape="round"
                                                onClick={() => btnFollowing(item, index)}>{item.isFollow ? '取消关注' : '关注'}</Button>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </InfiniteScroll> : <div className={'flex items-center justify-center '}>
                        <Empty/></div> : <div className={'flex items-center justify-center '}><Loading/></div>
                }
            </div>
        </Modal>
    </div>
}

export default withRouter(UserListDlg)
