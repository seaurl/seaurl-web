'use client'
import {useState, useEffect} from 'react';
import {useRouter, useSearchParams} from "next/navigation";
import {
    UserOutlined,
    AntDesignOutlined,
    UsergroupAddOutlined,
    LinkOutlined,
    UserAddOutlined,
    ArrowLeftOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import {
    Button,
    Tabs,
    List,
    Avatar,
    Row,
    Col,
    Affix,
    BackTop,
    Space,
    Modal,
    Tooltip,
    Divider,
    Select, Pagination, Radio
} from "antd";
import {useSelector, useDispatch} from 'react-redux'
import {getFollowList, followUser} from "@/lib/slices/userSlice";
import IconFont from "@/utils/iconFont";
import Loading from "@/components/loading";
import Empty from "@/components/empty";
import {withRouter} from "@/hoc/withRouter";

const {TabPane} = Tabs;
const UserFollow = ({type, guysInfo, userInfo, routerPush}) => {
    const router = useRouter();
    const dispatch = useDispatch();
    // const {query} = router;
    const [loadingData, setLoadingData] = useState(true)

    const query = useSearchParams()
    const {platFormTheme} = useSelector(state => state.system)

    // const {me, isLogin, userInfo, isMobile} = useSelector((state) => {
    //   const {isMobile} = state.layout
    //   return {
    //     isMobile,
    //     ...state.auth,
    //     hydrate: state.system.currentHydrate
    //   }
    // }, (_old, _new) => _old.hydrate !== _new.hydrate);

    const [radio, setRadio] = useState('a')
    const [page, setPage] = useState({
        pageNum: 1,
        pageSize: 20,
        total: 0,
        rows: [],
        uids: []
    })

    function isMe() {
        if (userInfo && guysInfo) {
            return userInfo.name === guysInfo.userName
        } else {
            return false;
        }
    }

    useEffect(() => {
        if (type === query.get('tab')) {
            initFollowList(type, 1);
        }
    }, [query.get('tab')])

    // function changeFollow(data) {
    //   console.log('data===', data)
    //   setRadio(data.target.value)
    //   if (data.target.value === 'a') {
    //     initFollowList("following", 1);
    //   }
    //   if (data.target.value === 'b') {
    //     initFollowList("follower", 1);
    //   }
    // }

    async function initFollowList(type, num) {
        setLoadingData(true)
        const res = await dispatch(getFollowList({
            userName: guysInfo.userName,
            pageSize: page.pageSize,
            pageNum: num || 1,
            type
        }))
        setLoadingData(false)
        const resdata = res.payload.data;
        console.log('getFollowingList useEffect res=>', page.pageNum)
        if (res.payload.status === 0) {
            if (resdata.followList[0].rows.length > 0) {
                setPage({
                    total: resdata.followList[0].total[0].count,
                    rows: resdata.followList[0].rows,
                    uids: resdata.uids,
                    pageNum: num,
                    pageSize: page.pageSize,
                })
            } else {
                setPage({
                    total: 0,
                    pageNum: num,
                    pageSize: page.pageSize,
                    rows: []
                })
            }
        }
    }

    // function renderTitle() {
    //   let render = null;
    //   if (query.tab === 'follow') {
    //     render = <Radio.Group defaultValue="a" onChange={changeFollow}>
    //       <Radio.Button
    //         value="a">{isMe() ? `我关注了(${userData.followingCount})` : `他关注了(${userData.followingCount})`}</Radio.Button>
    //       <Radio.Button
    //         value="b">{isMe() ? `我的粉丝(${userData.followerCount})` : `他的粉丝(${userData.followerCount})`}</Radio.Button>
    //     </Radio.Group>
    //   }
    //   return <div className={styles.centerTitle}>{render}</div>
    // }

    function back() {
        // router.push(`/${userInfo.userName}`)
        routerPush(`/${userInfo.userName}`)
    }

    async function btnFollowing(followedUserName, status) {
        if (userInfo) {
            const res = await dispatch(followUser({
                status,
                followedUserName
            }));
            if (res.payload) {
                initFollowList(type, 1);
            }
        } else {
            // router.push('/login')
            routerPush('/login')
        }

    }

    function gotoUserPage(path) {
        // router.push(path)
        routerPush(path)
    }

    return loadingData ? <div className={'flex items-center justify-center w-full'}>
        <Loading/>
    </div> : <div className={''}>
        <div className={''}>
            {/*<div className={styles.topHeader}>*/}
            {/*  <ArrowLeftOutlined className={styles.back} onClick={back}/>*/}
            {/*  {renderTitle()}*/}
            {/*</div>*/}
            {page.rows.length > 0 ? <List split={false}
                                          itemLayout="horizontal"
                                          dataSource={page.rows}
                                          pagination={{
                                              onChange: page => {
                                                  console.log('page num is=', page)
                                                  if (radio === 'a') {
                                                      initFollowList("following", page);
                                                  }
                                                  if (radio === 'b') {
                                                      initFollowList("follower", page);
                                                  }
                                              },
                                              // simple: true,
                                              simple: true,
                                              total: page.total,
                                              current: page.pageNum,
                                              pageSize: page.pageSize,
                                              hideOnSinglePage: true
                                          }}

                                          renderItem={item => (
                                              <List.Item className={''}>
                                                  <List.Item.Meta
                                                      avatar={<Avatar size={50} className={'cursor-pointer'} src={item.avatar}/>}
                                                      title={
                                                          <div className={''}>
                                                              <Space>
                                                                  {item.nickName ?
                                                                      <span className={'text-md font-medium cursor-pointer'} onClick={e => gotoUserPage(`/${item.userName}`)}>
                                                                         {item.nickName}
                                                                      </span> : ''}
                                                                      <span style={{color: platFormTheme?.color}} className={'text-[#6A737E] text-sm cursor-pointer hover:underline'} onClick={e => gotoUserPage(`/${item.userName}`)}>
                                                                          {item.userName}
                                                                      </span>
                                                                  </Space>
                                                              <div className={'text-sm'}>{item.introduction ? item.introduction : ''}</div>
                                                          </div>
                                                      }
                                                      description={
                                                          <Space>
                                                              {
                                                                  item.company ? <div className={'text-xs flex items-center gap-1'}>
                                                                      <EnvironmentOutlined className={''}/>
                                                                      <span className={''}>{item.company}</span>
                                                                  </div> : ''
                                                              }
                                                              {
                                                                  item.school ? <div className={'text-xs flex items-center gap-1'}>
                                                                      <IconFont type="icon-xuexiao" className={''}/>
                                                                      <span className={''}>{item.school}</span>
                                                                  </div> : ''
                                                              }
                                                              {/*{*/}
                                                              {/*  item.location ? <div className={styles.space}>*/}
                                                              {/*    <EnvironmentOutlined className={styles.iconSpace}/>*/}
                                                              {/*    <span className={styles.title}>{item.location}</span>*/}
                                                              {/*  </div> : ''*/}
                                                              {/*}*/}
                                                          </Space>
                                                      }
                                                  />
                                                  {
                                                      userInfo ? item.userName !== userInfo.name ?
                                                              page.uids.includes(item.uid) ?
                                                                  <Button type="default" onClick={() => {
                                                                      btnFollowing(item.userName, false)
                                                                  }}>
                                                                      取消关注
                                                                  </Button> :
                                                                  <Button type="default" onClick={() => {
                                                                      btnFollowing(item.userName, true)
                                                                  }}>
                                                                      关注
                                                                  </Button>
                                                              : null
                                                          : <Button type="default" onClick={() => {
                                                              btnFollowing(item.userName, true)
                                                          }}>
                                                              关注
                                                          </Button>
                                                  }
                                              </List.Item>
                                          )}
            /> : <div className={'flex items-center justify-center w-full'}>
                <Empty/>
            </div>}

        </div>
    </div>
}

export default withRouter(UserFollow);
