'use client'
import {Drawer, Select} from "antd";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import classNames from "classnames/bind";
import Empty from "@/components/empty";
import {useDispatch, useSelector} from "react-redux";
import {Virtuoso} from "react-virtuoso";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import dayjs from "dayjs";
import Loading from "@/components/loading";
import {getMsnData, getMsnDataDetail, queryUserAiTools, setNews, updateDt} from "@/lib/slices/aiSpaceSlice";
import {useSearchParams} from "next/navigation";
import {PicLeftOutlined} from "@ant-design/icons";

const News = () => {
    const containerRef = useRef();
    const virtuoso = useRef(null);
    const {news} = useSelector(state => state.aiSpace)
    const {type, showLoading, list, detail, isFinished, pagination, chooseNews} = news
    const abortControllerRef = useRef(null)
    const abortControllerRef2 = useRef(null)
    const dispatch = useDispatch()
    const [loadingDetail, setLoadingDetail] = useState(false);
    const isUpdate = useRef(false)
    const query = useSearchParams()
    const [openDrawer, setOpenDrawer] = useState(false)


    useEffect(() => {
        if (!chooseNews) {
            init(type, true)
        } else {
            renderHtml(chooseNews)
        }
        return () => {
            if (abortControllerRef.current?.abort) {
                abortControllerRef.current.abort();
            }
        }
    }, [])

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

    async function init(tabId, isFirst = false) {
        if (abortControllerRef.current?.abort) {
            abortControllerRef.current.abort();
        }
        // 创建新的 AbortController
        abortControllerRef.current = new AbortController();
        if (isFirst){
            setLoadingDetail(true)
        }
        const res = await dispatch(getMsnData({
            pageNum: 0,
            tabId: tabId,
            abortController: abortControllerRef.current
        }))
        console.log('----res-----', res)
        const resData = res.payload.resData

        let sections = []


        if (resData) {
            // 是否是财经新闻
            if (tabId === 'finance_news'){
                sections = resData.value
            }else{
                sections = resData.sections
            }
            if (sections?.length > 0) {
                let list = []
                if (tabId === 'finance_news'){
                    sections[0].subCards?.forEach(item => {
                        list = list.concat(item)
                    })
                }else{
                    sections[0].subSections?.forEach(item => {
                        list = list.concat(item.cards)
                    })
                }
                const flist = list.filter(f => f.id)
                getNewsDetail(flist[0].id)
            }
        }
    }


    // 获取详情
    async function getNewsDetail(newsId) {
        // 财经的id特殊处理
        if (type === 'finance_news') {
            const ids = newsId.split('_')
            if (ids.length === 3) {
                newsId = ids[1]
            }
        }
        if (abortControllerRef2.current?.abort) {
            abortControllerRef2.current.abort();
        }
        // 创建新的 AbortController
        abortControllerRef2.current = new AbortController();

        setLoadingDetail(true);
        const res = await dispatch(getMsnDataDetail({
            newsId: newsId,
            abortController: abortControllerRef2.current
        }))
        setLoadingDetail(false);
        console.log('------getNewsDetail-------', res)
        if (res?.payload) {
            try {
                const data = res.payload
                dispatch(setNews({
                    action: 'chooseNews',
                    data: data
                }))
                // 处理解析后的 JSON 数据
                console.log('news----------------------', data);
                // 确保 Shadow DOM 已经被创建
                renderHtml(data)
            } catch (e) {

            }
        }
    }

    function renderHtml(data) {
        if (containerRef?.current){
            let shadowRoot = containerRef.current?.shadowRoot;
            if (!shadowRoot && containerRef.current?.attachShadow) {
                shadowRoot = containerRef.current?.attachShadow({mode: "open"});
            }
            if (data) {
                shadowRoot.innerHTML = data.body || '暂无数据'
                // 获取 Shadow DOM 中的所有 img 元素
                const imgElements = shadowRoot.querySelectorAll('img');
                if (imgElements.length > 0) {
                    if (data.imageResources.length > 0) {
                        imgElements.forEach((img, index) => {
                            if (index < data.imageResources.length) {
                                img.src = data.imageResources[index].url;
                                img.style.maxWidth = '100%';
                                const captionDiv = document.createElement('div');
                                captionDiv.textContent = data.imageResources[index].title
                                // 设置文本大小和颜色
                                captionDiv.style.fontSize = '12px';
                                captionDiv.style.color = '#888';
                                // 将 captionDiv 插入到 img 元素之后
                                img.insertAdjacentElement('afterend', captionDiv);
                            }
                        })
                    }
                }
            }
        }
    }

    async function handleChange(d) {
        console.log('-------handleChange-------', d)
        dispatch(setNews({
            action: 'type',
            data: d
        }))
        dispatch(setNews({
            action: 'list',
            data: []
        }))
        init(d)
    }

    function renderLeftList() {
        if (!showLoading && list.length === 0) {
            return <Empty/>
        } else {
            return <>
                <div className={'p-2'}>
                    <Select
                        className={'w-full'}
                        value={type}
                        onChange={handleChange}
                        options={[
                            {
                                value: 'Y_77f04c37-b63e-46b4-a990-e926f7d129ff',
                                label: '资讯',
                            },
                            {
                                value: 'Y_49e75779-668d-4379-952f-8f366d0a1acf',
                                label: '科技',
                            },
                            {
                                value: 'Y_ffca5126-f1eb-4232-a09d-0cc253506007',
                                label: '娱乐',
                            },
                            {
                                value: 'finance_news',
                                label: '财经',
                            },
                            {
                                value: 'Y_21b7d513-d3fa-45e0-91c8-c9a2ea25272f',
                                label: '生活',
                            },
                            {
                                value: 'Y_0319d67d-6e91-4b00-8ed8-0f3d5f957680',
                                label: '教育',
                            },
                            {
                                value: 'Y_a66938e0-1d0f-4e74-9a37-a8a2513a59f0',
                                label: '汽车',
                            },
                            {
                                value: 'Y_da8de783-28cd-4248-9b12-ca42f01520ff',
                                label: '体育',
                            },
                            {
                                value: 'Y_b2251eaa-d926-441a-97de-ce74046fc6a8',
                                label: '悦读',
                            }
                        ]}
                    />
                </div>
                {renderMessages}
            </>
        }
    }

    const loadMore = useCallback(() => {
        console.log('========== load more ===========')
        console.log('========== isFinished ===========', isFinished)
        console.log('========== type ===========', type)
        console.log('========== pagination ===========', pagination)

        if (!isFinished) {
            if (abortControllerRef.current?.abort) {
                abortControllerRef.current.abort();
            }
            // 创建新的 AbortController
            abortControllerRef.current = new AbortController();

            dispatch(getMsnData({
                pageNum: pagination.pageNum + 1,
                tabId: type,
                abortController: abortControllerRef.current
            }))
        }

    }, [pagination, isFinished, type])

    const renderMessages = useMemo(() => {
        return <Virtuoso
            ref={virtuoso}
            data={list}
            endReached={loadMore}
            increaseViewportBy={200}
            context={{showLoading, isFinished}}
            itemContent={(index, item) => {
                return <div className={classNames({
                    'flex items-center py-3 px-2 gap-2 cursor-pointer border-b border-[#ddd] dark:border-[#474747]': true,
                    'bg-[#d4cef1] dark:bg-[#1c2126]': chooseNews?.id === item.id
                })} onClick={async () => {
                    // choose news
                    console.log('-------choose news item-------', item)
                    if (item.id) {
                        setOpenDrawer(false)
                        getNewsDetail(item.id)
                    }
                }}>
                    <div className={'flex flex-row w-full gap-2'}>
                        {item.images && item.images.length > 0 ?
                            <div className={'w-[100px] flex-shrink-0'}>
                                <img src={item.images[0].url} className={'w-[100px] h-[100px] object-cover'}/>
                            </div> : null
                        }
                        <div className={'flex flex-col line-clamp-2'}>
                            {
                                item.provider ?
                                    <div className={'w-full flex flex-row items-center justify-between pb-2'}>
                                        <div className={'flex items-center gap-2'}>
                                            <div className={'w-[16px] h-[16px]'}>
                                                <img src={item?.provider?.logoUrl || item?.provider?.logo?.url || ''}
                                                     className={'w-full h-full'}/>
                                            </div>
                                            <div className={'text-sm cursor-pointer'}>{item.provider.name}</div>
                                        </div>
                                        <div
                                            className={'text-xs'}>{dayjs(dayjs.utc(item.publishedDateTime).local()).fromNow()}</div>
                                    </div> : null
                            }
                            <span className={'text-md line-clamp-3 font-medium'}>{item.title}</span>
                        </div>
                    </div>
                </div>
            }}
            components={{
                Footer: ({context: {showLoading, isFinished}}) => {
                    return <div className={'flex items-center justify-center w-full'}>
                        {!isFinished && showLoading ? <Loading/> : null}
                    </div>
                }
            }}
        />
    }, [showLoading, isFinished, list, chooseNews])

    return <div className={'flex flex-row'} onClick={globalUpdate}>
        <div className={'w-[450px] h-[100vh] border-r border-[#ddd] dark:border-[#474747] hidden lg:block'}>
            <div className={'w-full h-[calc(100vh-50px)]'}>
                {renderLeftList()}
            </div>
        </div>
        <div className={'w-full flex items-center justify-center h-[calc(100vh-0px)] overflow-y-auto'}>
            <div className={'max-w-[960px] h-[calc(100vh-0px)] px-4 relative'}>
                <div className={classNames({
                    'hidden': !loadingDetail
                })}>
                    <Loading/>
                </div>

                <div className={classNames({
                    'hidden': loadingDetail
                })}>
                    <div className={'flex items-center gap-2 font-bold text-3xl py-4 '}>
                        <span className={classNames({
                            'lg:hidden cursor-pointer text-base': true,
                            'hidden': loadingDetail
                        })} onClick={() => setOpenDrawer(true)}>
                            <PicLeftOutlined/>
                        </span>

                        <span onClick={() => {
                            if (chooseNews?.sourceHref) {
                                window.open(chooseNews.sourceHref, '_blank');
                            }
                        }} className={'hover:text-[#54458a] hover:cursor-pointer'}>
                            {chooseNews?.title || ''}
                        </span>
                    </div>
                    {
                        chooseNews?.provider ?
                            <div className={'w-full flex flex-row items-center justify-between pb-2'}>
                                <div className={'flex items-center gap-2'} onClick={() => {
                                    if (chooseNews?.provider?.url) {
                                        window.open(chooseNews?.provider?.url, '_blank');
                                    }
                                }}>
                                    <div className={'w-[22px] h-[22px]'}>
                                        <img src={chooseNews?.provider?.logoUrl || chooseNews?.provider?.logo?.url || ''}
                                             className={'w-full h-full'}/>
                                    </div>
                                    <div className={'text-base cursor-pointer'}>{chooseNews?.provider?.name || ''}</div>
                                </div>
                                {
                                    chooseNews?.publishedDateTime ? <div
                                        className={'text-base'}>{dayjs(dayjs.utc(chooseNews.publishedDateTime).local()).fromNow()}</div> : null
                                }

                            </div> : null
                    }

                    <div className={'text-xl'} ref={containerRef}/>
                </div>
            </div>

        </div>
        <Drawer width={375} placement={'left'} onClose={() => setOpenDrawer(false)} closable={false} open={openDrawer}
                styles={{
                    body: {
                        padding: '0',
                    },
                }}>
            <div className={'w-full h-[calc(100vh-50px)]'}>
                {renderLeftList()}
            </div>
        </Drawer>
    </div>
}

export default News