'use client'
import React, {useEffect, useMemo, useState, useRef, memo, useCallback, useLayoutEffect} from "react";
import {
    Skeleton,
    Avatar,
    Row,
    Col,
    Button,
    Affix,
    Modal,
    Select,
    Space,
    Divider,
    Spin,
    Menu,
    Dropdown,
    Tag
} from "antd";
import {
    LoadingOutlined,
    HomeOutlined,
    UserAddOutlined,
    CopyOutlined,
    RobotOutlined,
    MoreOutlined,
    EllipsisOutlined,
    FolderOutlined,
    LikeOutlined,
    AlertOutlined,
    DeleteOutlined,
    PictureOutlined,
    ClusterOutlined,
    FormOutlined,
    EditOutlined,
    CompassOutlined,
    GlobalOutlined, WarningOutlined, PlusOutlined, MailOutlined, OpenAIOutlined
} from "@ant-design/icons";
import {useRouter, useParams, usePathname, useSearchParams} from "next/navigation";
import UserCard from "@/components/userCard";
import styles from "./index.module.scss";
import classNames from "classnames/bind";
import RecommendedAttention from "./recommendedAttention";
import RecommendedUrls from "./recommendedUrls";
import dayjs from 'dayjs'
import {
    getLatestNewsForUsers,
    likeUrl,
    updateLatestNewsByLike,
    updateLatestNewsByReport,
    deleteUserEvent,
    deleteLatestNews,
    reportUrl,
    clearLatestNews
} from '@/lib/slices/homeSlice'
import {userClickUrl} from '@/lib/slices/urlSpaceSlice'
import {buildFaviconUrl, DEFAULT_FAVICON} from "@/utils/favicon";
import UrlAddDlg from "@/components/dialog/urlAddDlg";
import Record from '@/components/layout/record';
import {useDispatch, useSelector} from "react-redux";
import {Virtuoso} from 'react-virtuoso'
import UserListDlg from "@/components/dialog/userListDlg";
import {useAppSelector} from "@/lib/hooks";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import {withRouter} from "@/hoc/withRouter";
import Loading from "@/components/loading";

let cx = classNames.bind(styles);

const {confirm} = Modal;
const {Option} = Select;

const LoginPage = ({loginUser,userInfo, userData, top10Users, top10Urls, routerPush}) => {
    const virtuosoRef = useRef(null)
    const router = useRouter();
    const query = useSearchParams()
    // const pathname = usePathname()

    // console.log('--- pathname ---', pathname)
    console.log('--- query ---', query)
    // const {query} = router

    // const [loadingData, setLoadingData] = useState(true)
    const dispatch = useDispatch();
    const [showDlg, setShowDlg] = useState(false)
    const [showUserListDlg, setUserListDlg] = useState(false)
    const {isLoading, isFinished, latestNews, likeUrls, reportUrls, pagination} = useAppSelector(state => state.home)
    const {platFormTheme} = useSelector(state => state.system)
    // const {latestNews, likeUrls, reportUrls, me, pagination, isLoading} = useSelector((state) => {
    //     const {me, isLogin, userInfo} = state.auth
    //     return {
    //         me, isLogin,
    //         ...state.home,
    //         hydrate: state.system.currentHydrate
    //     }
    // }, (_old, _new) => _old.hydrate !== _new.hydrate);
    const abortControllerRef = useRef(null)

    const [urlDlg, setUrlDlg] = useState({
        action: '',
        title: ''
    })
    const [urlData, setUrlData] = useState(null)
    // const [choosedTab, setTab] = useState(1)

    // const [refresh, setRefresh] = useState('')

    useEffect(() => {
        if (virtuosoRef.current) {
            virtuosoRef.current.scrollTo(0, 0);
        }
        console.log('-----------tab------------')
    }, [query.get('tab')])

    useEffect(() => {
        loadMore()
        return () => {
            // 页面销毁的时候把数据全部清空，否则redux会缓存到页面中，
            clear()
            if (abortControllerRef.current?.abort) {
                abortControllerRef.current.abort();
            }
        }
    }, []);

    function clear() {
        dispatch(clearLatestNews())
    }

    // 滚动加载事件
    function loadMore() {
        console.log('-----------loadMore------------', pagination)
        console.log('loadMore isFinished=', isFinished)
        if (!isFinished) {
            dispatch(getLatestNewsForUsers({
                type: query.get('tab') === 'following' ? 2 : 1
            }))
        }
    }

    function request(type) {
        if (abortControllerRef.current?.abort) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController()
        dispatch(getLatestNewsForUsers({
            type: type,
            abortController: abortControllerRef.current
        }))
    }

    // 列表项最顶部title
    function renderTitle() {
        const color = platFormTheme.color
        const s = `py-[12px] border-b-[3px] border-[${color}] border-solid`
        return (
            <div
                className={'sticky top-[56px] bg-white dark:bg-[#141414] z-10 flex items-center border-solid border-b border-[#f0f0f0] dark:border-[#474747]'}>
                <div className={'flex items-center justify-center flex-1 cursor-pointer'} onClick={async () => {
                    // router.replace('/', {scroll: true})
                    shallowUpdateRouterParams("")
                    await dispatch(clearLatestNews())
                    request(1)
                }}>
                    <span style={{
                        color: !query.get('tab') ? platFormTheme.background === 'dark'
                        || (platFormTheme.background === 'system'
                            && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#fff' : platFormTheme.color : 'inherit',

                        borderBottom: !query.get('tab') ?  `3px solid ${platFormTheme.color}` : '3px solid transparent'
                    }} className='py-[12px]'>为你推荐</span>
                </div>
                <div className={'flex items-center justify-center flex-1 cursor-pointer'} onClick={async () => {
                    // router.replace('?tab=following', {scroll: true})
                    shallowUpdateRouterParams("tab=following")
                    await dispatch(clearLatestNews())
                    request(2)

                }}>
                        <span style={{
                            color: query.get('tab') === 'following' ? platFormTheme.background === 'dark'
                            || (platFormTheme.background === 'system'
                                && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#fff' : platFormTheme.color : 'inherit',

                            borderBottom: query.get('tab') === 'following' ? `3px solid ${platFormTheme.color}` : '3px solid transparent'
                        }} className='py-[12px]'>正在关注</span>
                </div>
            </div>
        );
    }

    // 底部操作按钮下拉菜单
    function getMenus(item) {
        let menu = []
        if (loginUser?.name === item.userName) {
            menu = [{
                key: 'copy',
                danger: false,
                label: '复制',
                icon: <CopyOutlined className={''}/>
            }, {
                key: 'delete',
                danger: true,
                label: '删除',
                icon: <DeleteOutlined className={''}/>
            }]
        } else {
            menu = [{
                key: 'copy',
                danger: false,
                label: '复制',
                icon: <CopyOutlined className={''}/>
            }, {
                key: 'report',
                disabled: (reportUrls.filter(url => url === item.objectId)).length > 0,
                label: '举报',
                icon: <AlertOutlined className={''}/>
            }]
        }
        return menu
    }

    // 渲染列表项header
    function renderActivityTitle(activity) {
        let actionTxt = ''
        if (activity.action === 'create') {
            actionTxt = '添加网址到'
        }
        if (activity.action === 'copy') {
            actionTxt = '复制网址到'
        }
        return (<div className={'flex items-center gap-2'}>
                   <span className={'font-medium cursor-pointer'} onClick={() => {
                       // router.push(`/${activity.userName}`)
                       routerPush(`/${activity.userName}`)
                   }}>{activity.userName}</span>
                <span className={'text-[#939393] text-xs'}>{actionTxt}</span>
                <span className={'font-medium cursor-pointer'} onClick={(e) => {
                    let params = []
                    if (activity.objectOthers.categoryId) {
                        params.push(`cid=${activity.objectOthers.categoryId}`)
                    }
                    // if (activity.objectOthers.categoryPid !== '0') {
                    //     params.push(`vid=${activity.objectOthers.categoryPid}`)
                    // }
                    params.push('sortType=comprehensive')
                    // router.push(`/${activity.userName}/urlSpace?${params.join('&')}`)
                    routerPush(`/${activity.userName}/urlSpace?${params.join('&')}`)
                }}>{activity.objectOthers.categoryName}</span>
                {/*<span className={styles.dot}>·</span>*/}
                {/*<span className={styles.dt}>{dayjs(activity.createdDt).fromNow()}</span>*/}
            </div>
        );
    }

    // 点击网址时添加用户点击网址数
    function onClickUrl(url) {
        // console.log('click url=', url.objectId)
        dispatch(userClickUrl(url.objectId))
    }

    // 渲染列表项content内容
    function renderActivityContent(activity, toolbar) {
        let content = (
            <div className={''}>
                {activity.url_as && activity.url_as.url.startsWith('https') ? '' :
                    <div className={'text-[red] font-medium text-sm pb-1'}>
                        <WarningOutlined/>警告：不安全网址，注意财产安全</div>}
                <div className={'flex flex-row items-start gap-2'}>
                    <div
                        className={'w-[36px] h-[36px] bg-[#eee] rounded-full flex items-center justify-center shrink-0'}>
                        <img src={buildFaviconUrl(activity.url_as)}
                             onError={(e) => {
                                 e.target.onerror = null; // 防止无限循环
                                 e.target.src = DEFAULT_FAVICON; // 默认图片地址
                             }}
                             className={'w-[20px] h-[20px]'}/>
                    </div>
                    <div className={'flex flex-col items-start gap-1'}>
                        <a target="_blank" href={activity.url_as.url} className={cx({
                            'font-medium cursor-pointer': true,
                            desc: true
                        })}
                           onClick={() => onClickUrl(activity)}>
                            {activity.url_as.title}
                        </a>
                        <div className={cx({
                            desc: true,
                            'leading-5': true
                        })}>
                            {/*<span className={styles.iconImg}>*/}
                            {/*  <img src={activity.url_as.favicon} className={styles.img}/>*/}
                            {/*</span>*/}
                            <span className={'text-[#606060] dark:text-[#CFCAC9] cursor-pointer text-sm'}
                                  title={(new URL(activity.url_as.url)).protocol + '//' + activity.url_as.domain}
                                  onClick={() => {
                                      window.open((new URL(activity.url_as.url)).protocol + '//' + activity.url_as.domain, '_blank')
                                  }}>{activity.url_as.domain}</span>

                            {activity.url_as.description ?
                                <span className={'text-[#606060] dark:text-[#CFCAC9] text-sm text-ellipsis leading-3'}>
                                <span className={''}>-</span>
                                    {activity.url_as.description}
                            </span> : null}
                        </div>
                        {/*<div className={'w-full flex items-center flex-wrap max-h-[55px] overflow-hidden'}>*/}
                        {/*    {*/}
                        {/*        activity.url_as.keywords && activity.url_as.keywords?.split(',').map(key => {*/}
                        {/*            return <div className={'pb-1'}>*/}
                        {/*                <Tag>*/}
                        {/*                    {key}*/}
                        {/*                </Tag>*/}
                        {/*            </div>*/}
                        {/*        })*/}
                        {/*    }*/}

                        {/*</div>*/}
                        <div className={'flex flex-row text-[#606060] '}>
                            {toolbar}
                        </div>
                    </div>
                </div>

            </div>
        );
        return content
    }

    // 渲染列表项用户头像
    function renderAvatar(user) {
        return (
            <div className={'cursor-pointer'}>
                <Avatar className={''} src={`${user.avatar}?x-oss-process=style/100X100`} size={48}/>
            </div>
        );
    }

    function btnCreateUrl() {
        setUrlData(null)
        setUrlDlg({
            title: '添加网址',
            action: 'add'
        })
        setShowDlg(true);
    }

    // 点击删除、举报 click事件
    function onMenuClick(key, item, index) {
        if (key === 'report') {
            confirm({
                title: '您确定要举报该网址?',
                okText: '确定',
                cancelText: '取消',
                onOk: async () => {
                    // 举报网址
                    const res = await dispatch(reportUrl({
                        urlId: item.objectId,
                        uid: item.uid
                    }))
                    console.log('onMenuClick res=', res)
                    if (res.payload.data) {
                        // 举报完之后把urlid放入到reportUrls列表中
                        await dispatch(updateLatestNewsByReport({
                            urlId: item.objectId
                        }))
                    }
                },
                onCancel() {

                },
            });
        }
        if (key === 'delete') {
            confirm({
                title: '您确定要删除该动态?',
                okText: '确定',
                cancelText: '取消',
                onOk: async () => {
                    const res = await dispatch(deleteUserEvent({
                        id: item.id
                    }))
                    console.log('onMenuClick res=', res)
                    if (res.payload.data) {
                        dispatch(deleteLatestNews({
                            index: index
                        }))
                    }
                },
                onCancel() {

                },
            });
        }
        if (key === 'copy') {
            const formData = Object.assign({}, {
                urlId: item.objectId,
                title: item.url_as.title,
                description: item.url_as.description,
                url: item.url_as.url,
                category: null
            })
            setUrlData(formData)
            setUrlDlg({
                title: '复制网址',
                action: 'copy'
            })
            setShowDlg(true);
        }
    }

    function renderNewAction(item, index) {
        return <div className={'flex flex-row gap-1 text-sm dark:text-[#CFCAC9]'}>

            {/*<span className={styles.dot}>•</span>*/}
            <div className={''}>
                              <span className={''}>
                                  {item.userClickUrlCount.length > 0 ? item.userClickUrlCount[0] : 0} 浏览
                              </span>
            </div>
            <span className={''}>•</span>
            <span className={''}>
                                                {item.userCopyUrl_count || 0} 复制
                                            </span>
            <span className={''}>•</span>
            <div className={''}>{dayjs(item.createdDt).fromNow()}</div>
            <div className={''}>
                <Dropdown menu={{
                    items: getMenus(item),
                    onClick: ({key}) => onMenuClick(key, item, index),
                }} placement="bottomLeft" trigger={'hover'}>
                    <Space>
                        <EllipsisOutlined className={'cursor-pointer'}/>
                    </Space>
                </Dropdown>
            </div>
        </div>
    }

    // 渲染列表项底部操作按钮
    function renderAction(item, index) {
        return <div className={''}>
            <Space size={30}>
        <span className={''} onClick={async () => {
            const res = await dispatch(likeUrl({
                urlId: item.objectId,
                uid: item.uid
            }))
            console.log('like url res=', res)

            if (res.payload.data === 1) {
                // _item.userLikeUrl_count += 1
                // 更新点赞数量+1
                await dispatch(updateLatestNewsByLike({
                    index,
                    count: 1,
                    urlId: item.objectId
                }))
            }
            if (res.payload.data === 0) {
                // 更新点赞数量-1
                await dispatch(updateLatestNewsByLike({
                    index,
                    count: -1,
                    urlId: item.objectId
                }))
            }
        }
        }>
          <LikeOutlined className={''}/>{item.userLikeUrl_count > 0 ? item.userLikeUrl_count : '点赞'}
        </span>
                <span className={''} onClick={() => {
                    const formData = Object.assign({}, {
                        urlId: item.objectId,
                        title: item.url_as.title,
                        url: item.url_as.url,
                        category: null
                    })
                    setUrlData(formData)
                    setUrlDlg({
                        title: '复制网址',
                        action: 'copy'
                    })
                    setShowDlg(true);
                }
                }>
          <CopyOutlined className={''}/>{item.userCopyUrl_count > 0 ? item.userCopyUrl_count : '复制'}
        </span>

                <Dropdown menu={{
                    items: getMenus(item),
                    onClick: ({key}) => onMenuClick(key, item, index),
                }} placement="bottomLeft" trigger={'hover'}>
                    <Space>
                        <EllipsisOutlined className={''}/>
                    </Space>
                </Dropdown>
            </Space>
        </div>
    }

    // useEffect(() => {
    //   setCurrentPagination(pagination)
    //   // 这里加上这个判断是防止死循环，因为pageNum在数据返回的时候会被设置，变化之后，然后又进入这个useEffect
    //   //  所以只有当第一页的时候才调用
    //   loadMore()
    // }, [pagination])

    function addFriends() {
        // alert(1)
        // router.push('/rank')
        setUserListDlg(true)
    }

    async function closeUserListDlg() {
        // 关闭窗体
        setUserListDlg(false)

    }

    // 使用useMemo解决页面重复渲染导致loading卡顿问题
    const renderLoading = useMemo(() => {
        return <Virtuoso
            useWindowScroll
            ref={virtuosoRef}
            data={latestNews}
            context={{isFinished, isLoading, pagination, tab: query.get('tab'), latestNews}}
            components={{
                Footer: ({
                             height,
                             index,
                             context: {isLoading, isFinished, tab, pagination, latestNews}
                         }) => {
                    return <div key={index}>
                        {
                            isFinished && latestNews.length === 0 ?
                                <div className={'flex items-center justify-center flex-col gap-2 p-6'}>
                                    <div
                                        className={'text-2xl font-medium'}>{tab === 'following' ? '暂无数据' : '暂无推荐'}</div>
                                    <div
                                        className={'text-[#666] dark:text-[#CFCAC9]'}>{tab === 'following' ? '还没有好友？快去添加好友吧' : '暂无动态数据，去看看正在关注的吧'}</div>
                                    {
                                        tab === 'following' ? <Button icon={<UserAddOutlined/>}
                                                                      onClick={addFriends}>添加好友</Button> : null
                                    }
                                </div> : null
                        }
                        <div style={{
                            height: '100px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            paddingTop: '50px'
                        }}>
                            {!isFinished && isLoading ? <Loading/> : null}
                        </div>
                    </div>
                }
            }}
            overscan={20}
            endReached={loadMore}
            itemContent={(index, item) => (
                <div className={'flex flex-row items-start py-[16px] px-[16px] gap-3'} key={index}>
                    <div className={''}>
                        {renderAvatar(item)}
                    </div>
                    <div className={'flex items-start flex-col gap-1'}>
                        {renderActivityTitle(item)}
                        {renderActivityContent(item, renderNewAction(item))}
                        {/*{renderAction(item, index)}*/}
                    </div>
                </div>
            )}
        />
    }, [isFinished, isLoading, latestNews, pagination, query.get('tab')])


    return <div className={'w-full h-full'}>
        <div
            className={'max-w-screen-xl mx-auto flex flex-row justify-center w-full h-full items-start min-h-[calc(100vh-56px)]'}>
            <div className={'hidden lg:block max-w-72 sticky top-[56px] w-full h-full px-[16px]'}>
                <div className={'flex flex-col gap-2 pt-4'}>
                    <div className={''}>
                        <UserCard mode="center"
                                  size={200}
                                  showLocation={false}
                                  showFooter={false}
                                  showIntroduction={false}
                                  onUser={() => {
                                      // router.push(me ? `/${loginUser?.name}` : '')
                                      routerPush(`/${loginUser?.name}`)
                                  }}
                                  userInfo={userInfo}
                        />
                    </div>
                    <div className={'flex flex-col gap-2'}>
                        <div className={'flex flex-col gap-1'}>
                            <div
                                className={'flex gap-2 cursor-pointer hover:bg-[#EDECFF] dark:hover:bg-[#2D333B] py-2 px-4 rounded-3xl'}
                                onClick={async () => {
                                    console.log('router push = ', routerPush)
                                    routerPush(`/${loginUser?.name}`)
                                }}>
                                <HomeOutlined className={''}/>
                                <span className={'text-sm'}>我的主页</span>
                            </div>

                            {/*<div className={'flex gap-2 cursor-pointer hover:bg-[#EDECFF] dark:hover:bg-[#2D333B] py-2 px-4 rounded-3xl'}*/}
                            {/*     onClick={() => {*/}
                            {/*         router.push(`/${loginUser?.name}/aiSpace/chatAi`)*/}
                            {/*     }}>*/}
                            {/*    <RobotOutlined className={''}/>*/}
                            {/*    <span className={'text-sm'}>我的ChatAI</span>*/}
                            {/*</div>*/}

                            <div
                                className={'flex gap-2 cursor-pointer hover:bg-[#EDECFF] dark:hover:bg-[#2D333B] py-2 px-4 rounded-3xl'}
                                onClick={() => {
                                    routerPush(`/urlSpace`)
                                }}>
                                {/*<ClusterOutlined className={styles.iconfont}/>*/}
                                <GlobalOutlined className={''}/>
                                <span className={'text-sm'}>网址空间</span>
                            </div>
                            <div
                                className={'flex gap-2 cursor-pointer hover:bg-[#EDECFF] dark:hover:bg-[#2D333B] py-2 px-4 rounded-3xl'}
                                onClick={() => {
                                    routerPush(`/aiSpace/aiUsed`)
                                }}>
                                <span className={'text-lg'}><OpenAIOutlined className={''}/></span>
                                <span className={'text-sm flex items-center gap-1'}>工具
                                    <Tag color="magenta">火</Tag>
                                </span>
                            </div>
                            <div
                                className={'flex gap-2 cursor-pointer hover:bg-[#EDECFF] dark:hover:bg-[#2D333B] py-2 px-4 rounded-3xl'}
                                onClick={() => {
                                    routerPush(`/noteSpace`)
                                }}>
                                <FormOutlined className={''}/>
                                <span className={'text-sm'}>我的笔记</span>
                            </div>
                            <div
                                className={'flex gap-2 cursor-pointer hover:bg-[#EDECFF] dark:hover:bg-[#2D333B] py-2 px-4 rounded-3xl'}
                                onClick={() => {
                                    routerPush(`/fileSpace`)
                                }}>
                                <FolderOutlined className={''}/>
                                <span className={'text-sm'}>我的文件</span>
                            </div>
                            <div
                                className={'flex gap-2 cursor-pointer hover:bg-[#EDECFF] dark:hover:bg-[#2D333B] py-2 px-4 rounded-3xl'}
                                onClick={() => {
                                    routerPush(`/mailSpace`)
                                }}>
                                <MailOutlined className={''}/>
                                <span className={'text-sm flex items-center gap-1'}>我的邮箱
                                    {/*<Tag color="blue">新</Tag>*/}
                                </span>
                            </div>
                            {/*<div className={styles.menuItem} onClick={() => {*/}
                            {/*    router.push(me ? `/about` : '')*/}
                            {/*}}>*/}
                            {/*    <InfoCircleOutlined className={styles.iconfont}/>*/}
                            {/*    /!*<InfoOutlined className={styles.iconfont}/>*!/*/}
                            {/*    /!*<FolderOutlined className={styles.iconfont}/>*!/*/}
                            {/*    <span className={styles.name}>关于我们</span>*/}
                            {/*</div>*/}
                        </div>
                        <div className={''}>
                            <Button size="large" block type="primary" shape="round" icon={<PlusOutlined/>}
                                    onClick={btnCreateUrl}
                                    className={''}>添加网址</Button>
                        </div>
                    </div>
                    <div className={''}>
                        {/*<Divider plain style={{margin: '12px 0'}} />*/}
                        <Record/>
                    </div>
                </div>
            </div>
            <div className={'flex flex-1 items-start '}>
                <div
                    className={'flex-1 border-[#f0f0f0] border-l border-r dark:border-[#474747] min-h-[calc(100vh-56px)]'}>
                    {renderTitle()}
                    <div className={''}>
                        {renderLoading}
                    </div>
                </div>
                <div
                    className={'hidden xl:flex max-w-96 sticky top-[56px] w-full h-full px-[16px] flex-col gap-4 pt-4'}>
                    <div className={'bg-[#F7F9F9] dark:bg-[#1C2126] p-4 rounded-xl'}>
                        <div className={'font-medium text-md'}>网址推荐</div>
                        <div className={'pt-2'}>
                            <RecommendedUrls isLogin={loginUser} topUrls={top10Urls}/>
                        </div>
                    </div>
                    <div className={'bg-[#F7F9F9] dark:bg-[#1C2126] p-4 rounded-xl'}>
                        <div className={'flex items-center justify-between'}>
                            <div className={'font-medium text-md'}>推荐关注</div>
                            {
                                top10Users && top10Users.length > 0 ?
                                    <div
                                        className={'text-xs text-[#666] dark:text-white cursor-pointer hover:underline'}
                                        onClick={addFriends}>更多推荐
                                    </div> : null
                            }

                        </div>
                        <div className={'pt-2'}>
                            <RecommendedAttention topUsers={top10Users}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <UrlAddDlg
            action={urlDlg.action}
            title={urlDlg.title}
            initData={urlData}
            show={showDlg}
            onOk={() => {
                setShowDlg(false)
            }}
            onClose={() => {
                setShowDlg(false)
            }}/>
        <UserListDlg open={showUserListDlg} onClose={closeUserListDlg}/>
    </div>
}

export default withRouter(LoginPage)
