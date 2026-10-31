'use client'
import React, {memo, useCallback, useEffect, useRef, useState} from "react";
import {Dropdown, message, Modal, Select, Table, Tag, theme, Tooltip, Typography} from "antd";
import {
    CopyOutlined,
    DeleteOutlined,
    EditOutlined,
    EllipsisOutlined,
    ExclamationCircleFilled,
    VerticalAlignTopOutlined,
    AlertOutlined, StarOutlined, StarFilled, LockOutlined
} from "@ant-design/icons";
import {
    deleteUrl, getUrlListByType,
    getUrlsByFlag,
    queryAndSearchUrls,
    reportUrl,
    searchUrls, setFavorite,
    setSearchUrlValue,
    setUrlTop,
    updateUrlsByReport,
    userClickUrl
} from '@/lib/slices/urlSpaceSlice';
import classNames from "classnames/bind";
import dayjs from 'dayjs'

import {useDispatch, useSelector} from 'react-redux';
import UrlAddDlg from "@/components/dialog/urlAddDlg";
import Loading from "@/components/loading";
import Empty from "@/components/empty";
import {useRouter, useParams, useSearchParams, usePathname} from "next/navigation";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import {buildFaviconUrl, DEFAULT_FAVICON} from "@/utils/favicon";
import styles from './index.module.scss'
import {signIn, useSession} from "next-auth/react";

let cx = classNames.bind(styles);


const {Option} = Select;
const {confirm} = Modal;
const {Text, Link} = Typography;

const Urls = memo(props => {
    const dispatch = useDispatch();
    const {
        loadingUrls,
        conciseMode,
        urlPageSize,
        reportUrls,
        sortType, displayMode, highLight
    } = useSelector(state => state.urlSpace)

    const router = useRouter();
    // const {query} = router;
    const query = useSearchParams()
    const routerParams = useParams()
    const [urlData, setUrlData] = useState(null)
    const [showDlg, setShowDlg] = useState(false);
    const [open, setOpen] = useState(false);
    const [urlDlg, setUrlDlg] = useState({
        action: '',
        title: ''
    })
    const hoverId = useRef('')
    const {token} = theme.useToken();
    const {data: session} = useSession()


    const {platFormTheme} = useSelector(state => state.system)
    const hoverTextColor = `hover:text-[${platFormTheme.color}]`;

    // 注意：只有别人的网址鼠标移动上面才会显示收藏按钮，自己的网址不用显示

    useEffect(() => {
        document.addEventListener("DOMContentLoaded", () => {
            const textItems = document.querySelectorAll(".kkk");

            textItems.forEach(item => {
                if (isTextOverflowing(item)) {
                    item.title = item.innerText; // 设置title属性为完整文本
                } else {
                    item.title = ''; // 没有溢出时清空title属性
                }
            });
        });

        function isTextOverflowing(element) {
            return element.scrollWidth > element.clientWidth;
        }
    }, [])

    function onMouseEnter(event) {
        const element = event.target;
        console.log('element.scrollWidth > element.clientWidth=', element.scrollWidth > element.clientWidth)
    }

    function isMe() {
        if (props.guysInfo && props.userInfo) {
            return props.userInfo.name === props.guysInfo.userName
        }
        return false
    }

    function clickUrl(id) {

        console.log('clickUrl =', props)
        if (props.userInfo) {
            dispatch(userClickUrl(id))
        }
    }

    // function btnEdit(url) {
    //     setOpen(false)
    //     setUrlData(Object.assign({}, {
    //         urlId: url.id,
    //         title: url.title,
    //         category: url.categoryId,
    //         url: url.url,
    //         keywords: url.keywords
    //     }))
    //     setUrlDlg({
    //         title: '编辑网址',
    //         action: 'edit'
    //     })
    //     setShowDlg(true);
    // }

    function getDomainFirstChar(domain) {
        const s = domain.split('.');
        return s[s.length - 2][0];
    }

    // 重新渲染网址列表
    function reRenderUrls() {
        // 如果是网址空间首页的tab 复制、编辑和删除过来的，就要刷新页面，加个t=xxx时间戳强制更新
        if (props.isDashboard) {
            console.log('isDashboard router=', router)
            let params = []
            if (query.get('tab')) {
                params.push(`tab=${query.get('tab')}`)
            }
            // router.push(`/${routerParams.username}?${params.join('&')}&t=${Date.now()}`, undefined, {shallow: true})
            shallowUpdateRouterParams(params.join('&'))
        }
        if (query.get('search')) {
            dispatch(setSearchUrlValue(query.get('search')));
            dispatch(searchUrls({
                search: query.get('search'),
                pageNum: query.get('page') || 1,
                pageSize: urlPageSize
            }));
        }
        if (query.get('type')) {
            dispatch(getUrlListByType({
                type: query.get('type')
            }))
        }
        if (query.get('cid')) {
            dispatch(queryAndSearchUrls({
                search: '',
                categoryId: query.get('cid'),
                pageNum: query.get('page') || 1,
                pageSize: 60,
                sortType
            }))
        }
    }

    // 操作菜单列表
    const getActionItems = (url) => {
        let menus = []
        if (!isMe()) {
            menus = [{
                key: '0',
                label: '复制',
                icon: <CopyOutlined/>,
                onClick: () => handleActionClick('copy', url)
            }, {
                key: '4',
                label: '举报',
                icon: <AlertOutlined/>,
                onClick: () => handleActionClick('report', url)
            }]
        } else {
            menus = [{
                key: '0',
                label: '复制',
                icon: <CopyOutlined/>,
                onClick: () => handleActionClick('copy', url)
            }]

            if (props.userInfo.uid === url.uid) {
                menus.push({
                    key: '3',
                    label: url.isTop ? '取消置顶' : '置顶',
                    icon: <VerticalAlignTopOutlined/>,
                    onClick: () => handleActionClick('top', url)
                })
                menus.push({
                    key: 'collection',
                    label: url.isFavorite ? '取消收藏' : '收藏',
                    icon: url.isFavorite ? <StarFilled/> : <StarOutlined/>,
                    onClick: () => handleActionClick('favorite', url)
                })
                menus.push({
                    key: '1',
                    label: '编辑',
                    icon: <EditOutlined/>,
                    onClick: () => handleActionClick('edit', url)
                })
                menus.push({
                    key: '2',
                    label: '删除',
                    icon: <DeleteOutlined/>,
                    danger: true,
                    onClick: () => handleActionClick('delete', url)
                })
            }
        }
        return menus
    };

    // 点击菜单项事件
    const handleActionClick = async (type, url) => {
        if (type === 'favorite') {
            const res = await dispatch(setFavorite({
                urlId: url.id,
                isFavorite: !url.isFavorite
            }))
            if (res.payload.status === 0 && res.payload.data) {
                reRenderUrls()
            }
        }
        if (type === 'copy') {
            setUrlData(Object.assign({}, {
                urlId: url.id,
                title: url.title,
                url: url.url,
                description: url.description,
                category: null,
                keywords: url.keywords,
                isPrivate: url.isPrivate || '1'
            }))
            setUrlDlg({
                title: '复制网址',
                action: 'copy'
            })
            setShowDlg(true);
        }
        if (type === 'edit') {
            setUrlData(Object.assign({}, {
                urlId: url.id,
                title: url.title,
                url: url.url,
                description: url.description,
                category: url.categoryId,
                keywords: url.keywords,
                isPrivate: url.isPrivate || '1'
            }))
            setUrlDlg({
                title: '编辑网址',
                action: 'edit'
            })
            setShowDlg(true);
        }
        if (type === 'delete') {
            confirm({
                title: `您确定要删除？`,
                okText: '确定',
                cancelText: '取消',
                onOk: async () => {
                    const res = await dispatch(deleteUrl({
                        urlId: url.id
                    }))
                    if (res.payload.status === 0 && res.payload.data) {
                        message.success('删除成功');
                        reRenderUrls()
                    } else {
                        message.warning("删除失败");
                    }
                }
            });
        }
        if (type === 'top') {
            const res = await dispatch(setUrlTop({
                urlId: url.id,
                isTop: !(url.isTop || false)
            }))
            if (res.payload.status === 0 && res.payload.data) {
                reRenderUrls()
            }
        }
        if (type === 'report') {
            confirm({
                title: '您确定要举报该网址?',
                okText: '确定',
                cancelText: '取消',
                onOk: async () => {
                    // 举报网址
                    const res = await dispatch(reportUrl({
                        urlId: url._id,
                        uid: url.uid
                    }))
                    if (res.payload.data) {
                        // 举报完之后把urlid放入到reportUrls列表中
                        await dispatch(updateUrlsByReport({
                            urlId: url._id
                        }))
                    }
                },
                onCancel() {

                },
            });
        }
    };

    function renderIcon(url) {
        let content = null;
        // if (url.url.startsWith('https')){
        if (url.favicon) {
            content = <img className={'w-[20px] h-[20px] inline-block shrink-0'} src={buildFaviconUrl(url)} onError={(e) => {
                e.target.onerror = null; // 防止无限循环
                e.target.src = DEFAULT_FAVICON; // 默认图片地址
            }}/>
        } else {
            content = <span className={'flex items-center'}>{getDomainFirstChar(url.domain)}</span>
        }
        return <div
            style={{
                background: platFormTheme.background === 'dark'
                || (platFormTheme.background === 'system'
                    && window.matchMedia('(prefers-color-scheme: dark)').matches) ?
                    displayMode === 'list' ? '#1C2126' : '#141414' : '#fff'
            }}
            className={classNames({
                'bg-[#fafafa] dark:bg-[#333]  flex items-center justify-center rounded-full shrink-0': true,
                'w-[36px] h-[36px] min-w-[18px] min-h-[18px] bg-[#fafafa] dark:bg-[#1C2126] rounded-full shrink-0': displayMode === 'app',
                'w-[36px] h-[36px] bg-[#fafafa] dark:bg-[#1C2126] rounded-full shrink-0': displayMode === 'list',
                'w-[32px] h-[32px] bg-[#fafafa] dark:bg-[#1C2126] rounded-full shrink-0': displayMode === 'mini'
            })}>
            {
                content
            }

        </div>
    }

    function getViewCount(url, text) {
        if (url.clickCount && Array.isArray(url.clickCount)) {
            return `${url.clickCount && url.clickCount.length > 0 ? url.clickCount.reduce((a, b) => a + b) : 0} ${text}`
        } else {
            return `${url.clickCount || 0} ${text}`
        }
    }

    function getTitleHtml(title) {
        if (highLight === 'zh') {
            // 使用正则匹配所有英文字母组合
            const regex = /[\u4e00-\u9fa5]/g;
            // 替换函数
            const replaceFn = matched => {
                return `<span style="color:red">${matched}</span>`;
            }
            return title.replace(regex, replaceFn);
        }
        if (highLight === 'en') {
            // 使用正则匹配所有英文字母组合
            const regex = /[a-zA-Z]+/g;
            // 替换函数
            const replaceFn = matched => {
                return `<span style="color:red">${matched}</span>`;
            }
            return title.replace(regex, replaceFn);
        }
        return title
    }
    function getSimpleName(domain) {

        // 去掉前缀 "www."
        if (domain.startsWith("www.")) {
            domain = domain.substring(4);
        }
        return domain?.substring(0, domain.lastIndexOf('.'))
    }

    function renderTags(url) {
        const keywords = url.keywords
        if (keywords) {
            let tags = [keywords]
            if (keywords.includes('，')) {
                tags = keywords.split('，')
            } else if (keywords.includes(',')) {
                tags = keywords.split(',')
            } else if (keywords.includes('、')) {
                tags = keywords.split('、')
            } else if (keywords.includes(' ')) {
                tags = keywords.split(' ')
            } else if (keywords.includes('|')) {
                tags = keywords.split('|')
            } else if (keywords.includes('&')) {
                tags = keywords.split('&')
            } else if (keywords.includes('*')) {
                tags = keywords.split('*')
            } else if (keywords.includes('-')) {
                tags = keywords.split('-')
            } else if (keywords.includes('#')) {
                tags = keywords.split('#')
            }else if (keywords.includes('。')) {
                tags = keywords.split('。')
            }else if (keywords.includes('.')) {
                tags = keywords.split('.')
            }
            if (tags?.length > 0) {
                return tags.map(key => {
                    return <div className={''}>
                        <Tag style={{
                            fontSize: '10px',
                            // lineHeight: '14px'
                        }}>
                            {key}
                        </Tag>
                    </div>
                })
            }
        }
        return null

    }

    const renderUrls = useCallback(() => {
        let content = null
        if (displayMode === 'app') {
            content = <div className={'grid grid-cols-auto-270 auto-rows-max gap-[16px] '}>
                {props.urls.map((url, index) => {
                    return (
                        <div className={'items-stretch'} key={index}>
                            <div className={cx({
                                'relative dark:pl-0 rounded-xl outline-[#161616] dark:outline-0 h-full border border-transparent hover:border-[#54458A]  shadow': true,
                                'urlItems': true
                            })}>
                                {
                                    url.isFavorite && url.uid === session?.user?.uid ?
                                        <span
                                            className={'absolute px-[4px] py-[2px] top-2 right-2 rounded-tr-xl rounded-tl-xl text-xl text-yellow-400 z-10'}>
                                            <StarFilled/>
                                        </span> : null
                                }
                                <div className={'flex flex-row h-full'}>
                                    <div
                                        className={'w-full relative inline-flex items-start flex-col text-base gap-x-[6px] bg-[#fff] hover:bg-[#fff] dark:hover:bg-[#2D333B] dark:bg-[#1C2126] dark:border-0 px-[16px] py-[12px] rounded-xl'}>
                                        <div className={'flex items-center gap-x-2 w-full mb-1 min-h-[45px]'}>
                                            {renderIcon(url)}
                                            <div className={'w-[calc(100%-32px)]'}>
                                                {
                                                    !conciseMode ? <div
                                                        className={'w-full truncate text-base cursor-pointer text-[#606060]'}>
                                                        <div
                                                            className={`text-base font-normal text-[#333] dark:text-[#8d96a0] cursor-pointer`}
                                                            title={(new URL(url.url)).protocol + '//' + url.domain}
                                                            onClick={() => {
                                                                window.open((new URL(url.url)).protocol + '//' + url.domain, '_blank')
                                                            }}>
                                                            <div className={'inline-flex items-center gap-1 text-base text-[#0069b4]'}>
                                                                {getSimpleName(url.domain)}
                                                                {
                                                                    // url.isPrivate === '0'?<span className={'text-base text-[#aaa] z-10'}><LockOutlined /></span>:null
                                                                }
                                                            </div>
                                                            {
                                                                url.url.startsWith('https') ? null :
                                                                    <span className={classNames({
                                                                        'text-[#2DB55D]': true,
                                                                        'text-[#FE8C8C] font-medium': !url.url.startsWith('https')
                                                                    })}>
                                                                        <Tooltip color={'#FF8B8C'}
                                                                                 arrowPointAtCenter={true}
                                                                                 placement="top"
                                                                                 title="警告：不安全网址，注意财产安全">
                                                                            <ExclamationCircleFilled size={14} className={'text-[#FF8B8C] text-base font-medium pl-[5px]'}/>
                                                                        </Tooltip>
                                                                  </span>
                                                            }
                                                        </div>
                                                        <div>
                                                            <div
                                                                className={'flex flex-row flex-wrap overflow-hidden max-h-[26px]'}>
                                                                {renderTags(url)}

                                                            </div>
                                                        </div>

                                                    </div> : null
                                                }
                                            </div>
                                        </div>
                                        {/*<Tooltip title={url.title} placement="bottomLeft" arrow={false}>*/}
                                        <div onMouseEnter={onMouseEnter}
                                             style={{
                                                 color: platFormTheme.background === 'dark'
                                                 || (platFormTheme.background === 'system'
                                                     && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#fff' : token.colorPrimary
                                             }}
                                             className={'inline-flex items-center w-full cursor-pointer text-base pl-[2px] mb-3 text-[#000] dark:text-[#fff] min-h-[60px] font-custom'}
                                             onClick={() => {
                                                 clickUrl(url.id)
                                                 window.open(url.url)
                                             }} >
                                            <div className={'line-clamp-2 '} dangerouslySetInnerHTML={{__html: getTitleHtml(url.title)}}>

                                            </div>
                                        </div>
                                        {/*</Tooltip>*/}


                                        <div
                                            className={'flex items-center w-full text-[#666]  dark:text-[#8d96a0]'}>
                                            <div className={''}>
                                                <span className={'text-xs  pl-[2px]'}>
                                                    {getViewCount(url, '浏览')}
                                                </span>
                                            </div>
                                            <span className={'px-1'}>•</span>
                                            <span className={'text-xs  pl-[2px]'}>
                                                        {url.userCopyUrl_count || 0} 复制
                                                    </span>
                                            <span className={'px-1'}>•</span>
                                            <div
                                                className={'text-xs '}>{dayjs(url.createdDt).fromNow()}</div>
                                            {
                                                props.userInfo ?
                                                    <div
                                                        className={'pl-[4px] flex items-center justify-center'}>
                                                        <Dropdown
                                                            placement="bottom"
                                                            menu={{items: getActionItems(url)}}>
                                                            <EllipsisOutlined
                                                                className={'text-[#6954B4]'}/>
                                                        </Dropdown>
                                                    </div> : null
                                            }
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>
        }
        if (displayMode === 'mini') {
            content = <div className={'grid grid-cols-auto-270 auto-rows-max gap-[18px]'}>
                {props.urls.map((url, index) => {
                    return (
                        <div className={'items-stretch'} key={index}>
                            <div className={cx({
                                'relative dark:pl-0 outline-[#161616] dark:outline-0 h-full border border-transparent hover:border-[#0069b4] rounded-lg shadow': true,
                                'urlItems': true
                            })}>
                                <div className={'w-full relative inline-flex items-start flex-col text-sm gap-x-[6px] bg-[#fff] hover:bg-[#fff] dark:hover:bg-[#2D333B] dark:bg-[#1C2126] dark:border-0 px-[6px] py-[6px] truncate rounded-md'}>
                                    <div className={'inline-flex items-center gap-x-1.5 w-full'}>
                                        {renderIcon(url)}
                                        <div className={`w-full text-base font-normal text-[#0069b4] dark:text-[#8d96a0] cursor-pointer truncate`}
                                             title={url.title}
                                             onClick={() => {
                                                 clickUrl(url.id)
                                                 window.open(url.url)
                                             }}
                                             dangerouslySetInnerHTML={{__html: getTitleHtml(url.title)}}>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        }
        if (displayMode === 'list') {
            content = <div className={'flex flex-col gap-3'}>
                {props.urls.map((url, index) => {
                    return (
                        <div key={index} className={'flex items-center gap-2 pl-2 pr-2 py-1 bg-white dark:bg-[#141414] rounded-lg cursor-pointer overflow-hidden shadow'}>
                            <div className={'shrink-0'}>
                                {renderIcon(url)}
                            </div>
                            <div className={'flex-1 min-w-0 overflow-hidden'}
                                 onClick={() => {
                                     clickUrl(url.id)
                                     window.open(url.url)
                                 }}>
                                <div className={'text-base text-[#0069b4] dark:text-[#8d96a0] truncate max-w-[calc(100vw-160px)]'}
                                     title={url.title}
                                     dangerouslySetInnerHTML={{__html: getTitleHtml(url.title)}}>
                                </div>
                            </div>
                            <div className={'hidden md:flex items-center gap-2 text-xs text-[#666] dark:text-[#8d96a0] mr-2 shrink-0'}>
                                <span className="truncate max-w-[150px]">{getViewCount(url, '浏览')}</span>
                                <span>•</span>
                                <span>{url.userCopyUrl_count || 0} 复制</span>
                                <span>•</span>
                                <span>{dayjs(url.createdDt).fromNow()}</span>
                            </div>
                            <Dropdown placement="bottom" menu={{items: getActionItems(url)}}>
                                <EllipsisOutlined className={'text-lg text-[#aaa] font-bold cursor-pointer shrink-0'}/>
                            </Dropdown>
                        </div>
                    )
                })}
            </div>
        }
        return props.urls.length > 0 ? content : <Empty/>
    }, [props.urls, conciseMode, reportUrls, displayMode, highLight])

    return <div className={styles.container}>
        {loadingUrls ? <div className={'flex items-center justify-center w-full'}>
            <Loading/>
        </div> : renderUrls()}
        <UrlAddDlg
            action={urlDlg.action}
            title={urlDlg.title}
            initData={urlData}
            show={showDlg}
            onOk={() => {
                setShowDlg(false)
                reRenderUrls()
            }}
            onClose={() => {
                setShowDlg(false)
            }}
        />
    </div>
})

export default Urls;
