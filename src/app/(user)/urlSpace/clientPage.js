'use client'
import React, {useState, useEffect} from "react";
import {useRouter, useParams, useSearchParams} from "next/navigation";
import {
    Avatar,
    Row,
    Col,
    Radio,
    Tabs,
    Select,
    Typography,
    Tooltip,
    Drawer,
    Result,
    Tag,
    Segmented,
    Dropdown,
    Menu,
    Space,
    message,
    Switch,
    Divider, Button, theme
} from "antd";
import {
    AppstoreOutlined,
    MenuOutlined,
    PicRightOutlined,
    BarsOutlined,
    RightOutlined, MenuFoldOutlined, BorderlessTableOutlined, BuildOutlined, DashOutlined,
} from "@ant-design/icons";
import {useDispatch, useSelector} from 'react-redux'
import LeftPanel from '@/components/urlSpace/leftPanel'
import RightContent from "@/components/urlSpace/rightContent";
import UrlsSearch from "@/components/search/urlsSearch";
import {
    reset,
    setSearchUrlValue,
    getUrlCategories,
    setIsMe,
    queryAndSearchUrls,
    setUrlPageNum,
    setShowPanel,
    setSortType,
    setDisplayMode,
    setHighLight,
    setDataFromServer,
    setOpenMobileDrawer, setOpenSidebar
} from "@/lib/slices/urlSpaceSlice";
import {watchUser, getIsFollowed} from '@/lib/slices/userSlice'
import UrlAddDlg from "@/components/dialog/urlAddDlg";
import cns from "classnames/bind";
import Empty from "@/components/empty";
import classNames from "classnames/bind";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import {withRouter} from "@/hoc/withRouter";

const UrlSpace = (serverData) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const query = useSearchParams()
    const routerParams = useParams()
    const {token} = theme.useToken();

    const [isServer, setServer] = useState(true)
    const onClose = () => {
        dispatch(setOpenMobileDrawer(false))
    };
    const {
        urlPageSize,
        conciseMode,
        showPanel,
        sortType,
        displayMode,
        highLight,
        urlCategories,
        openMobileDrawer,
        openSidebar
    } = useSelector(state => state.urlSpace)
    const {platFormTheme, isMobile} = useSelector(state => state.system)

    const [showDlg, setShowDlg] = useState(false)
    const [open, setOpen] = useState(false)
    const [switchLoading, setSwitchLoading] = useState(false)

    useEffect(() => {
        if (isServer) {
            console.log('server data=', serverData)
            setServer(false)
            dispatch(setDataFromServer({
                urlCategories: serverData?.urlCategories,
                urlCount: serverData?.urlCount
            }))
            const search = query.get('search')
            const cid = query.get('cid')
            const type = query.get('type')
            const page = query.get('page')
            if (search) {
                dispatch(setSearchUrlValue(search))
            }
            if (cid) {
                // if (page) {
                //     // 设置分页器
                //     dispatch(setUrlPageNum(page))
                // } else {
                //     dispatch(setUrlPageNum(1))
                // }

                // 不需要在这里请求，因为已经在innerCategory中监听过了，否则重复请求
                // dispatch(queryAndSearchUrls({
                //     userName: routerParams.username,
                //     search: search || '',
                //     categoryId: cid || '',
                //     pageNum: page || 1,
                //     pageSize: urlPageSize,
                //     sortType
                // }))
            }
            if (serverData?.userInfo) {
                // 查询是否关注了此人
                // dispatch(getIsFollowed(serverData.guysInfo?.userName))
                // 我查看了此人
                dispatch(watchUser({
                    guysName: serverData?.guysInfo?.userName,
                    userName: serverData?.userInfo?.name
                }))
            }
            if (!cid && !type && !search) {
                shallowUpdateRouterParams(`type=frequently`)
            }
        }
        return () => {
            // 重置
            dispatch(reset())
        }
    }, [])

    useEffect(() => {
        setSwitchLoading(false)
    }, [conciseMode])

    // 监听变化
    useEffect(() => {
        // 初始化两个面板的显示条件
        if (isMobile) {
            dispatch(setOpenSidebar(false))
            dispatch(setOpenMobileDrawer(false))
        } else {
            dispatch(setOpenSidebar(true))
            dispatch(setOpenMobileDrawer(false))
        }
    }, [isMobile]);

    function changeHighLight(v) {
        console.log('v=', v)
        dispatch(setHighLight(v))
    }

    function renderCenter() {
        if (query.get('cid') || query.get('search') || query.get('type')) {
            return <RightContent guysInfo={serverData?.guysInfo} userInfo={serverData?.userInfo}/>
        } else {
            return renderEmpty()
        }
    }

    function render404() {
        return <Result
            status="404"
            title="404"
            subTitle="对不起, 没有找到您想要访问的页面."
        />
    }

    function renderEmpty() {
        return <div className={'flex items-center justify-center h-[100vh]'}>
            <Empty title={'请选择一个网址分类，或者创建网址分类'}/>
        </div>
    }

    if (!serverData?.userInfo) {
        render404()
    }

    function onSearch(e, d) {
        if (e) {
            let cid = query.get('cid')
            let vid = query.get('vid')
            let sortType = query.get('sortType')
            let params = [`search=${e}`]
            if (vid) {
                params.push(`vid=${vid}`)
            }
            if (sortType) {
                params.push(`sortType=${sortType}`)
            }
            if (d) {
                params.push(`filter=${d}`)
            }

            // 判断是否是当前分类，如果是则要传递cid,否则不传
            if (d && d === 'current') {
                if (cid) {
                    params.push(`cid=${cid}`)
                }
            }
            // 这里不要用客户端路由渲染，而是用服务端路由渲染，目的是解决相同的search内容，不调用接口问题
            // router.push(`/${routerParams.username}/urlSpace?${params.join('&')}`)
            shallowUpdateRouterParams(params.join('&'))
        } else {
            message.warning("请输入搜索内容")
        }
    }

    function onSortType(d) {
        let cid = query.get('cid')
        let vid = query.get('vid')
        let filter = query.get('filter')
        let page = query.get('page')
        let search = query.get('search')
        let type = query.get('type')

        let params = [`sortType=${d}`]
        if (vid) {
            params.push(`vid=${vid}`)
        }
        if (cid) {
            params.push(`cid=${cid}`)
        }
        if (filter) {
            params.push(`filter=${filter}`)
        }
        if (page) {
            params.push(`page=${page}`)
        }
        if (search) {
            params.push(`search=${search}`)
        }
        if (type) {
            params.push(`type=${type}`)
        }

        shallowUpdateRouterParams(params.join('&'))
    }

    function getName() {
        const cid = query.get('cid')
        if (cid) {
            const fs = urlCategories.filter(f => f.id === cid)
            if (fs.length > 0) {
                return <span>{fs[0].name}</span>
            }
        }

        if (query.get('search')) {
            return <span>搜索</span>
        }

        if (query.get('type')) {
            let name = ''
            if (query.get('type') === 'frequently') {
                name = '常用网址'
            }
            if (query.get('type') === 'history') {
                name = '历史记录'
            }
            if (query.get('type') === 'favorite') {
                name = '收藏网址'
            }
            if (query.get('type') === 'top') {
                name = '置顶网址'
            }
            return <span>{name}</span>
        }
        return ''
    }

    function renderIcon() {
        if (isMobile) {
            return !openMobileDrawer ? <MenuOutlined/> : <MenuFoldOutlined/>
        } else {
            return !openSidebar ? <MenuOutlined/> : <MenuFoldOutlined/>
        }
    }

    function renderPage() {
        let searchVal = query.get('search')
        return <div className={'w-full h-[100vh] overflow-hidden'}>
                    <div className={'w-full pl-0 pr-0 h-[100vh] bg-[#fafafa] dark:bg-[#141414] flex flex-row overflow-hidden'}>
                        <div className={classNames({
                                 'bg-white dark:bg-[#141414] h-[100vh] overflow-y-hidden flex-col flex-shrink-0': true,
                                 'w-0': !openSidebar,
                                 'w-[260px] border-r border-[#e5e5e5] dark:border-[#474747]': openSidebar
                             })}>
                            <LeftPanel guysInfo={serverData.guysInfo} userInfo={serverData?.userInfo}/>
                        </div>
                        <div className={classNames({
                            'h-full overflow-y-auto w-[calc(100vw-320px)] flex-shrink-0 pb-10': openSidebar,
                            'h-full overflow-y-auto w-full': !openSidebar
                        })}>
                            {
                                query.get('cid') || query.get('search') || query.get('type') ?
                                    <div className={'px-[16px] lg:px-[32px] mx-auto w-full'}>
                                        <div
                                            className={'flex pt-[11px] items-center justify-between '}>
                                            <div className={'min-w-[200px] flex items-center gap-2'}>
                                                <div
                                                    className={'cursor-pointer hover:bg-[#eee] dark:hover:bg-[#2E333C] w-[36px] h-[36px] rounded-full flex items-center justify-center'}
                                                    onClick={() => {
                                                        if (isMobile) {
                                                            dispatch(setOpenMobileDrawer(!openMobileDrawer))
                                                            dispatch(setOpenSidebar(false))
                                                        } else {
                                                            dispatch(setOpenMobileDrawer(false))
                                                            dispatch(setOpenSidebar(!openSidebar))
                                                        }
                                                    }}>
                                                    {renderIcon()}
                                                </div>
                                                <span className={'font-bold'}>
                                                    {getName()}
                                              </span>
                                            </div>
                                            <div className={'hidden lg:flex items-center gap-2'}>
                                                <Select
                                                    value={query.get('sortType') || 'comprehensive'}
                                                    style={{width: 100}}
                                                    disabled={!!query.get('type')}
                                                    options={[
                                                        {
                                                            value: 'comprehensive',
                                                            label: '综合排序',
                                                        },
                                                        {
                                                            value: 'upLike',
                                                            label: '最多浏览',
                                                        },
                                                        {
                                                            value: 'upCopy',
                                                            label: '最多复制',
                                                        },
                                                        {
                                                            value: 'created',
                                                            label: '创建时间',
                                                        },
                                                    ]}
                                                    onChange={(value) => {
                                                        onSortType(value)
                                                        // dispatch(setSortType(value))
                                                    }}
                                                />
                                                <Select
                                                    value={highLight}
                                                    style={{width: 100}}
                                                    options={[
                                                        {
                                                            value: 'none',
                                                            label: '不高亮',
                                                        },
                                                        {
                                                            value: 'zh',
                                                            label: '中文高亮',
                                                        },
                                                        {
                                                            value: 'en',
                                                            label: '英文高亮',
                                                        }
                                                    ]}
                                                    onChange={(value) => {
                                                        changeHighLight(value)
                                                    }}
                                                />
                                                <Segmented
                                                    value={displayMode}
                                                    options={[
                                                        {
                                                            value: 'mini',
                                                            icon: <DashOutlined />
                                                        }, {
                                                            value: 'list',
                                                            icon: <BarsOutlined/>,
                                                        }, {
                                                            value: 'app',
                                                            icon: <AppstoreOutlined/>,
                                                        }
                                                    ]}
                                                    onChange={(v) => {
                                                        console.log('v=', v)
                                                        dispatch(setDisplayMode(v))
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        {
                                            query.get('cid') || query.get('search') || query.get('type') ?
                                                <div
                                                    className={'flex pt-[12px] pb-[8px] items-start justify-between flex-col text-[#57606a] w-full'}>
                                                    <div className={'w-full'}>
                                                        <UrlsSearch prefixIcon showAction={true} onSearch={onSearch}
                                                                    defaultValue={searchVal}/>
                                                    </div>
                                                </div> : null
                                        }
                                    </div> : null
                            }
                            <div className={'overflow-hidden w-full mx-auto dark:-[#141414]'}>
                                {renderCenter()}
                            </div>
                        </div>
                    </div>
            <UrlAddDlg action="add" title="添加新的网址" show={showDlg} onClose={() => {
                setShowDlg(false)
            }}/>
            <Drawer width={320} placement="left" onClose={onClose} open={openMobileDrawer} styles={{
                body: {
                    padding: '0'
                }
            }}
                    closable={false}>
                <LeftPanel rounded={false} guysInfo={serverData.guysInfo} userInfo={serverData?.userInfo}
                    // onChooseUrlCategory={() => dispatch(setOpenMobileDrawer(false))}
                />
            </Drawer>
        </div>
    }

    return renderPage();
};

export default withRouter(UrlSpace);
