'use client'
import InfiniteScroll from "react-infinite-scroll-component";
import {Avatar, Button, List, Mentions, message, Modal, Select, Space, Spin, Tooltip} from "antd";
import Loading from "@/components/loading";
import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {followUser, getUserList} from "@/lib/slices/userSlice";
import {getTopUsersByPage} from "@/lib/slices/homeSlice";
import {useDispatch} from "react-redux";
import Empty from '@/components/empty'
import _ from "lodash";
import {withRouter} from "@/hoc/withRouter";
import styles from './index.module.scss'
import {CloseCircleOutlined, DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import {
    deleteShareFileFriend,
    getShareFileFriends,
    sendNotifyToFriends,
    shareFileToFriends
} from "@/lib/slices/fileSpaceSlice";

const ShareUserListDlg = (props) => {
    const dispatch = useDispatch();

    const router = useRouter();
    const {query} = router;

    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    // const [userList, setUserList] = useState([]);
    const [userTotal, setTotal] = useState(0)

    const modalTitleRef = useRef('共享给朋友')
    const userListRef = useRef([]);
    const [userList, setUserList] = useState([]);
    const abortControllerRef = useRef(null)

    const userListPage = useRef({
        pageSize: 20,
        pageNum: 0
    });

    const isFirstRef = useRef(true)
    const [chooseValue, setChooseValue] = useState(null);

    const [options, setOptions] = useState([]);

    const handleOk = async () => {
        const mids = userList.map(m => m.uid)
        await dispatch(sendNotifyToFriends({
            fileId: props.shareFiles[0].id,
            fids: mids
        }))
        props.onClose()
    };

    const handleCancel = () => {
        // setUserList([])
        props.onClose()
    };

    useEffect(() => {
        return () => {
            if (abortControllerRef.current?.abort) {
                abortControllerRef.current.abort();
            }
        }
    }, [])

    useEffect(() => {
        if (props.open) {
            isFirstRef.current = false
            if (abortControllerRef.current?.abort) {
                abortControllerRef.current.abort();
            }
            setChooseValue(null)
            setUserList([])
            setOptions([])
            queryUserList()
            // userListPage.current.pageNum = 0
            // loadMoreData()
        }
    }, [props.open])

    async function queryUserList() {
        setLoading(true)
        const res = await dispatch(getShareFileFriends({
            fileId: props.shareFiles[0].id,
        }))
        console.log('res===', res)
        setLoading(false)
        if (res.payload.status === 0) {
            setUserList(res.payload.data || [])
        }
    }

    // const onChange = (value) => {
    //     console.log('Change:', value);
    // };
    // const onSelect = (option) => {
    //     console.log('select', option);
    // };

    const debounceFetcher = _.debounce(async (val) => {
        console.log('value =', val)
        if (val) {
            setOptions([]);
            setSearching(true);
            const res = await dispatch(getUserList({
                userName: val,
                fileId: props.shareFiles[0].id,
            }))
            console.log('res =', res)
            if (res.payload.status === 0) {
                const rs = res.payload.data.map(m => {
                    return {
                        label: m.userName,
                        value: m.uid,
                        avatar: m.avatar,
                        uid: m.uid
                    }
                })
                setOptions(rs)
            }
            setSearching(false);
        } else {
            setOptions([])
        }
    }, 300)

    async function onAdd() {
        if (chooseValue) {
            console.log('choose value=', chooseValue)
            await dispatch(shareFileToFriends({
                fileId: props.shareFiles[0].id,
                fid: chooseValue.value
            }))
            setChooseValue(null)
            setOptions([])
            queryUserList()
        } else {
            setChooseValue(null)
            setOptions([])
            message.info("未查询到用户")
        }
    }

    async function onDelete(d) {
        console.log("on delete = ", d)
        await dispatch(deleteShareFileFriend({
            fileId: props.shareFiles[0].id,
            fid: d.uid
        }))
        queryUserList()
    }

    function renderUserList() {
        return userList.map((item, index) => {
            return <div className={'flex items-center justify-between px-[12px] py-2 hover:bg-[#fafafa] dark:hover:bg-[#2E333E] rounded'}
                        key={index}>
                <div className={'flex items-center justify-between gap-2 '}>
                    <Avatar src={item.avatar} size={40}/>
                    <span className={'text-md font-medium cursor-default'}>{item.userName}</span>
                </div>
                <div className={'text-xl text-red-600 cursor-pointer'} onClick={() => onDelete(item)}>
                    <Tooltip title="删除" placement={'bottom'}>
                        <CloseCircleOutlined/>
                    </Tooltip>
                </div>
            </div>
        })
    }

    return <div>
        <Modal title={modalTitleRef.current}
               open={props.open}
               width={500}
               footer={null}
               wrapClassName={styles.container}
               styles={{
                   header: {
                       padding: '12px',
                       margin: '0'
                   },
                   footer: {
                       padding: '12px',
                       margin: '0'
                   }
               }}
               onOk={handleOk}
               afterClose={handleCancel}
               onCancel={handleCancel}>
            <div>
                <div className={'p-[12px] flex w-full items-center gap-1'}>
                    <Select
                        value={chooseValue}
                        allowClear
                        labelInValue
                        filterOption={false}
                        onSearch={debounceFetcher}
                        notFoundContent={searching ? <Spin size="small"/> : options.length === 0 ?
                            <div>暂无数据</div> : null}
                        onChange={(newValue) => {
                            console.log('newvalue=', newValue)
                            setChooseValue(newValue)
                        }}
                        optionRender={option => {
                            console.log('optionRender =', option)
                            return <div className={'flex items-center gap-2'}><Avatar
                                src={option.data?.avatar}/>{option.label}</div>
                        }}
                        showSearch
                        placeholder={'请输入要共享的用户名'}
                        className={'w-[90%]'}
                        options={options}
                    />
                    <Button icon={<PlusOutlined/>} type={'primary'} onClick={onAdd}>添加</Button>
                </div>
                {
                    !loading ? userList?.length > 0 ? <div className={'pb-[12px] px-[12px] min-h-[100px]'}>
                        {renderUserList()}
                    </div> : <div className={'flex items-center justify-center '}>
                        <Empty/></div> : <div className={'flex items-center justify-center '}><Loading/></div>
                }
            </div>
        </Modal>
    </div>
}

export default withRouter(ShareUserListDlg)