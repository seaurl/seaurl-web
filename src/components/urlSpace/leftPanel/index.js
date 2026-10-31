'use client'
import React, {useState, useEffect, useCallback} from "react";
import {useRouter, usePathname, useParams, useSearchParams} from "next/navigation";
import {
    Menu,
    Collapse,
    Button,
    Dropdown,
    Space,
    Modal,
    Select,
    Tabs,
    Typography,
    Avatar,
    message,
    Segmented, Divider
} from "antd";
import {
    CaretRightOutlined,
    PlusOutlined,
    EditOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    LikeOutlined,
    LeftOutlined,
    MenuFoldOutlined,
    GlobalOutlined,
    CloseCircleOutlined,
    ClusterOutlined,
    RightOutlined,
    PicRightOutlined,
    PicLeftOutlined,
    LeftCircleOutlined,
    CaretDownOutlined,
    PieChartOutlined,
    DesktopOutlined,
    ContainerOutlined,
    MailOutlined,
    AppstoreOutlined,
    HistoryOutlined,
    SmileOutlined,
    DownOutlined,
    StarOutlined, CopyOutlined, VerticalAlignTopOutlined, StarFilled
} from "@ant-design/icons";
import {
    queryUrlCategory,
    deleteUrlCategory,
    setUrlCategoryTop,
    setShowPanel, getUrlListByType
} from '@/lib/slices/urlSpaceSlice'
import {useDispatch, useSelector} from 'react-redux'
import UrlCategoryDlg from "@/components/dialog/urlCategoryDlg";
import InnerCategory from "./innerCategory";
import MenuAction from "@/components/menuAction";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import {withRouter} from "@/hoc/withRouter";
import classNames from "classnames/bind";
import UrlCategories from "@/components/urlSpace/leftPanel/urlCategories";
import UrlsSearch from "@/components/search/urlsSearch";

const {confirm} = Modal;
const LeftPanel = ({guysInfo, userInfo, onChooseUrlCategory, rounded}) => {
    const dispatch = useDispatch();
    const router = useRouter();
    // const {query} = router;
    const query = useSearchParams()
    const routerParams = useParams()
    const {
        chooseUrlCategory,
        urlCategories,
        openMobileDrawer,
        openSidebar,
        urlCount
    } = useSelector(state => state.urlSpace)
    console.log('LeftPanel data=', guysInfo)


    const [dlg, setDlg] = useState({
        action: '',
        title: '',
        show: false,
        loading: false
    })

    useEffect(() => {
        if (query.get('type')) {
            dispatch(getUrlListByType({
                type: query.get('type')
            }))
        }

    }, [query.get('type')])


    // 点击添加按钮
    function btnAdd() {
        const cid = query.get('cid')
        setDlg({
            title: '添加网址分类',
            action: 'add',
            show: true,
            id: cid || '',
            loading: false
        })
    }

    function btnEdit() {
        const cid = query.get('cid')
        if (cid) {
            const fs = urlCategories.filter(f => f.id === cid)
            setDlg({
                title: '编辑网址分类',
                action: 'edit',
                show: true,
                loading: false,
                id: cid,
                input: fs[0].name
            })
        } else {
            message.warning('请先选择网址分类');
        }
    }

    // 设置置顶或取消置顶
    async function btnTop() {
        const cid = query.get('cid')
        if (cid) {
            const fs = urlCategories.filter(f => f.id === cid)
            const res = await dispatch(setUrlCategoryTop({
                cid: cid,
                isTop: !fs[0].isTop
            }))
            console.log('setUrlCategoryTop res=', res)
            if (res.payload.data) {
                dispatch(queryUrlCategory())
            }
        } else {
            message.warning('请先选择网址分类');
        }
    }

    async function btnDelete() {
        const cid = query.get('cid')
        const vid = query.get('vid')
        if (cid) {
            const fs = urlCategories.filter(f => f.id === cid)
            confirm({
                title: `您确定要删除[${fs[0].name}]？`,
                okText: '确定',
                cancelText: '取消',
                onOk: async () => {
                    const res = await dispatch(deleteUrlCategory({
                        id: cid
                    }));
                    if (res.payload.status === 0) {
                        message.success('删除成功');
                        //否则 查询主分类列表
                        if (routerParams?.username) {
                            const res = await dispatch(queryUrlCategory({
                                userName: routerParams?.username
                            }))

                            if (res?.payload?.status === 0 && res?.payload?.data?.length > 0) {
                                // 查询pid=0的所有分类，也就是一级分类
                                let result = []
                                let params = ['sortType=comprehensive']
                                if (vid) {
                                    params.push(`vid=${vid}`)
                                    // 如果有vid说明进入了子分类，这时候，再判断子分类是否有数据，如果有，则设置cid为子分类第1条数据，否则不设置cid,并且查询最近笔记列表
                                    result = res?.payload?.data?.filter(item => item.pid === vid)
                                    if (result.length > 0) {
                                        params.push(`cid=${result[0].id}`)
                                    }
                                } else {
                                    result = res?.payload?.data?.filter(item => item.pid === '0')
                                    params.push('cid=' + result[0].id)
                                }
                                if (query.get('type')) {
                                    params.push(`type=${query.get('type')}`)
                                }
                                if (params.length > 0) {
                                    // router.push(`/${routerParams?.username}?${params.join('&')}`)
                                    shallowUpdateRouterParams(params.join('&'))
                                } else {
                                    // router.push(`/${routerParams?.username}/urlSpace`)
                                    shallowUpdateRouterParams("")
                                }
                            } else {
                                shallowUpdateRouterParams("")
                            }
                        }


                    } else {
                        message.warning(res.payload.message)
                    }
                }
            });
        } else {
            message.warning('请先选择网址分类');
        }

    }

    function btnRefresh() {
        dispatch(queryUrlCategory())
    }


    function getTitle() {
        if (query.get('vid')) {
            const result = urlCategories.filter(item => item.id === query.get('vid'))
            if (result.length > 0) {
                return result[0].name
            }
        }
        return ''
    }

    // 回到上级
    async function back() {
        let cid = query.get('cid')
        let vid = query.get('vid')
        let type = query.get('type')
        let page = query.get('page')
        let search = query.get('search')
        const sortType = query.get('sortType')
        let params = []

        if (cid) {
            params.push(`cid=${cid}`)
        }
        if (type) {
            params.push(`type=${type}`)
        }
        if (page) {
            params.push(`page=${page}`)
        }
        if (search) {
            params.push(`search=${search}`)
        }
        if (sortType) {
            params.push(`sortType=${sortType}`)
        }
        if (vid) {
            // 根据出的id查询前置的节点
            const prevNode = urlCategories.filter(item => item.id === vid)
            if (prevNode.length > 0) {
                const pid = prevNode[0].pid
                if (pid !== '0') {
                    params.push(`vid=${pid}`)
                }
            }
        }
        if (params.length > 0) {
            // router.push(`/${routerParams.username}/urlSpace?${params.join('&')}`)
            shallowUpdateRouterParams(params.join('&'))
        } else {
            // 如果参数为空，说明在第一级，就不需要带任何?a=b这样的参数了
            // router.push(`/${routerParams.username}/urlSpace`)
            shallowUpdateRouterParams("")
        }
    }

    function renderAddAction() {
        return <div className={'w-full py-1 pr-[8px] pl-[12px] inline-flex items-center justify-between '}>
            <div className={'flex items-center cursor-pointer text-sm font-medium'}>
                <div onClick={() => {
                    // router.push(`/${userInfo.userName}`)
                    // routerPush(`/${userInfo.userName}`)
                }}>
                    {/*<GlobalOutlined className={'pr-[6px]'}/>*/}
                    网址分类
                </div>
            </div>
            <div className={'flex items-center gap-y-[12px] gap-x-2 cursor-pointer'}>
                {
                    guysInfo?.userName === userInfo?.name ? <MenuAction
                        data={chooseUrlCategory}
                        add={btnAdd}
                        edit={btnEdit}
                        delete={btnDelete}
                        top={btnTop}
                        refresh={btnRefresh}
                        action={['add', 'edit', 'delete', 'top', 'refresh']}
                    >
                        <Space size={4}>
                            <PlusOutlined/>
                            <CaretDownOutlined/>
                        </Space>
                    </MenuAction> : null
                }
            </div>

        </div>
    }

    function goto(type) {
        if (type) {
            shallowUpdateRouterParams(`type=${type}`)
        }
    }

    return <div className={classNames({
        // 'h-screen ': true,
        'flex flex-col h-full w-full relative': true,
        'rounded-ss-2xl dark:rounded-ss-none': false
    })}>
        <div className={'grid grid-cols-2 grid-rows-2 gap-2 px-3 pt-3 pb-2'}>
            <div
                className={classNames({
                    'flex items-center justify-center gap-2 text-sm w-full py-3 px-2 rounded-lg cursor-pointer hover:bg-[#d4cef1] dark:hover:bg-[#1C2126] shadow': true,
                    'bg-[#d4cef1] dark:bg-[#1C2126]': query.get('type') === 'frequently',
                    'bg-[#fff] dark:bg-[#000]': query.get('type') !== 'frequently'
                })} onClick={() => goto('frequently')}>
                <ClockCircleOutlined/>
                常用({urlCount?.frequently > 60 ? 60 : urlCount?.frequently || 0})
            </div>
            <div
                className={classNames({
                    'flex items-center justify-center gap-2 text-sm w-full p-3 rounded-lg cursor-pointer hover:bg-[#d4cef1] dark:hover:bg-[#1C2126] shadow': true,
                    'bg-[#d4cef1] dark:bg-[#1C2126]': query.get('type') === 'history',
                    'bg-[#fff] dark:bg-[#000]': query.get('type') !== 'history'
                })} onClick={() => goto('history')}>
                <HistoryOutlined/>
                历史({urlCount?.history > 60 ? 60 : urlCount?.history || 0})
            </div>
            <div
                className={classNames({
                    'flex items-center justify-center gap-2 text-sm w-full p-3 rounded-lg cursor-pointer hover:bg-[#d4cef1] dark:hover:bg-[#1C2126] shadow': true,
                    'bg-[#d4cef1] dark:bg-[#1C2126]': query.get('type') === 'favorite',
                    'bg-[#fff] dark:bg-[#000]': query.get('type') !== 'favorite'
                })} onClick={() => goto('favorite')}>
                <StarFilled/>
                收藏({urlCount?.favorite > 60 ? 60 : urlCount?.favorite || 0})
            </div>
            <div
                className={classNames({
                    'flex items-center justify-center gap-2 text-sm w-full p-3 rounded-lg cursor-pointer hover:bg-[#d4cef1] dark:hover:bg-[#1C2126] shadow': true,
                    'bg-[#d4cef1] dark:bg-[#1C2126]': query.get('type') === 'top',
                    'bg-[#fff] dark:bg-[#000]': query.get('type') !== 'top'
                })} onClick={() => goto('top')}>
                <VerticalAlignTopOutlined/>
                置顶({urlCount?.top > 60 ? 60 : urlCount?.top || 0})
            </div>
        </div>
        {renderAddAction()}
        <div className={'pt-1'}>
            {/*<div className={'text-sm p-2'}>网址分类</div>*/}
            {/*{JSON.stringify(urlCategories)}*/}
            <UrlCategories rounded={rounded}
                           onChooseUrlCategory={onChooseUrlCategory}
                           onAdd={btnAdd}
                           onEdit={btnEdit}
                           onDelete={btnDelete}
                           onRefresh={btnRefresh}/>
        </div>
        {/*{*/}
        {/*    !showPanel ? <div*/}
        {/*        className={'fixed left-[-40px] hover:text-white top-[48%] w-[60px] h-[71px] text-md bg-[#ccc] dark:bg-[#797A7F] flex items-center justify-end rounded-tr-2xl rounded-br-2xl cursor-pointer pr-[4px] z-10 hover:bg-[#797A7F]'}*/}
        {/*        style={{*/}
        {/*            left: !showPanel ? '-40px' : '220px'*/}
        {/*        }} onClick={() => {*/}
        {/*        dispatch(setShowPanel(!showPanel))*/}
        {/*    }}>*/}
        {/*        {showPanel ? <LeftOutlined className={'text-black'}/> : <RightOutlined className={'text-black'}/>}*/}
        {/*    </div> : null*/}
        {/*}*/}

        <UrlCategoryDlg dlg={dlg}/>
    </div>
};

export default withRouter(LeftPanel);
