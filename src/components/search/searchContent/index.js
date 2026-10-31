'use client'
import React, {useCallback, useEffect, useRef, useState} from "react";
import {Row, Col, List, Avatar, Space, Divider, Menu, Dropdown, Button, Spin} from "antd";
import {
    FolderFilled,
    StarFilled,
    StarOutlined,
    LinkOutlined,
    BookOutlined,
    TagsOutlined,
    CaretDownOutlined,
    AppstoreOutlined, LikeOutlined, CopyOutlined, UserAddOutlined, LoadingOutlined, EllipsisOutlined, ArrowLeftOutlined
} from "@ant-design/icons";
import {useDispatch, useSelector} from "react-redux";
import {Virtuoso} from 'react-virtuoso'
import SearchEmpty from '@/components/search/searchEmpty'
import SearchHelper from '@/components/search/searchHelper'
import {userClickUrl} from '@/lib/slices/urlSpaceSlice'

import dayjs from "dayjs";
import {useRouter} from "next/navigation";
import {
    webSearch,
    resetSearch,
    setSearchPanel,
    setShowSearchApp
} from "@/lib/slices/systemSlice";
import Loading from "@/components/loading";
import UrlAddDlg from "@/components/dialog/urlAddDlg";
import {withRouter} from "@/hoc/withRouter";
import {buildFaviconUrl} from "@/utils/favicon";


const SearchUrls = ({routerPush}) => {
    const {
        searchList,
        searchPage,
        searchContent,
        loadingSearchList,
        showSearchApp,
        searchLoading,
        likeUrls,
        platFormTheme
    } = useSelector((state) => state.system);
    const dispatch = useDispatch();
    const router = useRouter();
    const virtuosoRef = useRef(null)
    const [urlDlg, setUrlDlg] = useState({
        action: '',
        title: ''
    })
    const [urlData, setUrlData] = useState(null)
    const [showDlg, setShowDlg] = useState(false)

    // 滚动加载事件
    const loadMore = useCallback(() => {
        console.log('loadMore=', searchLoading)
        if (searchLoading) {
            dispatch(webSearch({
                q: searchContent,
                pageNum: searchPage.pageNum + 1,
                pageSize: searchPage.pageSize
            }))
        }
    }, [searchContent, searchLoading])

    function renderSearchContent() {
        if (showSearchApp) {
            // return null
            return <SearchHelper/>
        }
        if (searchList.length === 0 && !loadingSearchList) {
            return <SearchEmpty content={searchContent}/>
        }
        // if (loadingSearchList) {
        //     return <Loading/>
        // }
        return <Virtuoso
            style={{height: '100%', minHeight: '480px'}}
            ref={virtuosoRef}
            data={searchList}
            overscan={20}
            endReached={loadMore}
            context={{abc: searchLoading}}
            components={{
                Footer: ({height, index, context: {abc}}) => {
                    return searchLoading ? <div className={'flex items-center justify-center w-full'}>
                        <Loading/>
                    </div> : null
                }
            }}
            itemContent={(index, data) => (
                <div className={'pt-[12px] pb-[6px] px-[22px] w-full h-full'}>
                    <div className={'flex items-start'}>
                        <div
                            className={'bg-[#f1f3f4] border border-[#ecedef] rounded-full inline-flex items-center justify-center h-[32px] w-[32px] mr-[6px] shrink-0'}>
                            <img src={buildFaviconUrl(data)} alt="" className={'h-[20px] w-[20px]'}/>
                        </div>
                        <div className={'leading-5 pl-[6px]'}>
                            <div className={'text-md flex items-center'}>
                                {/*<div className={styles.iconPrev}>*/}
                                {/*  <img src={data.favicon} alt="" className={styles.icon}/>*/}
                                {/*</div>*/}
                                {/*<a href={data.url} className={styles.link}>{data.title}</a>*/}
                                <span
                                    className={'w-[480px] p-0 text-base text-[#333] dark:text-white cursor-pointer font-medium truncate hover:underline'}
                                    onClick={() => {
                                        dispatch(userClickUrl(data.id))
                                        window.open(data.url, '_blank')
                                    }} dangerouslySetInnerHTML={{__html: data.highLightTitle || data.title}}/>
                            </div>
                            <div className={'flex flex-row gap-x-0 cursor-pointer text-md pt-[4px]'}>
                <span onClick={() => {
                    window.open((new URL(data.url)).protocol + '//' + data.domain, '_blank')
                }}>{data.domain}</span>
                                <span className={'flex items-center text-sm'}>
                {
                    data.userName ? <span style={{color: platFormTheme?.color ?? '#54458a'}}
                                          className={'text-sm text-[#54458a] font-medium cursor-pointer rounded bg-[#eee] dark:bg-[#333] px-[6px] py-[2px] ml-[12px]'}
                                          onClick={(e) => {
                                              let params = []
                                              if (data.categoryId) {
                                                  params.push(`cid=${data.categoryId}`)
                                              }
                                              if (data.categoryParentId && data.categoryParentId !== '0') {
                                                  params.push(`vid=${data.categoryParentId}`)
                                              }
                                              dispatch(setSearchPanel(false))
                                              // router.push(`/${data.userName}/urlSpace?${params.join('&')}`)
                                              routerPush(`/${data.userName}/urlSpace?${params.join('&')}`)
                                              // dispatch(resetSearch())
                                          }}>{`${data.userName}`}&nbsp;/&nbsp;{`${data.categoryName}`}</span> : null
                }
              </span></div>


                            <div className={'flex items-center w-full pt-[6px] text-[#606060] dark:text-white text-xs'}>
                                <div className={''}>
                  <span className={''}>
                      {data.clickUrlCount || 0} 浏览
                  </span>
                                </div>
                                <span className={'px-[2px]'}>•</span>
                                <span className={''}>
                    {data.copiedUrlCount || 0} 复制
                </span>
                                <span className={'px-[2px]'}>•</span>
                                <div className={''}>{dayjs(data.createdDt).fromNow()}</div>
                                <div className={'pl-[4px] flex items-center justify-center'}>
                                    <Dropdown menu={{
                                        items: [{
                                            key: 'copy',
                                            danger: false,
                                            label: '复制',
                                            icon: <CopyOutlined className={'text-sm'}/>
                                        }],
                                        onClick: ({key}) => {
                                            const formData = Object.assign({}, {
                                                urlId: data.id,
                                                title: data.title,
                                                description: data.description,
                                                url: data.url,
                                                category: null
                                            })
                                            setUrlData(formData)
                                            setUrlDlg({
                                                title: '复制网址',
                                                action: 'copy'
                                            })
                                            setShowDlg(true);
                                        },
                                    }} placement="bottomLeft" trigger={'hover'}>
                                        <Space>
                                            <EllipsisOutlined className={''}/>
                                        </Space>
                                    </Dropdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        />
    }

    return (
        <div className={'h-full'}>
            {
                !showSearchApp ?
                    <div className={'text-[#70757a] dark:text-white flex items-center break-words px-[12px]'}>
                        <Button type={'text'} icon={<ArrowLeftOutlined/>} onClick={() => {
                            dispatch(setShowSearchApp(true))
                            dispatch(resetSearch())
                        }} className={'text-[#70757a]'}></Button>
                        {!loadingSearchList ? <span className={'text-md pl-[6px]'}>找到约<span
                                style={{color: platFormTheme?.color ?? '#54458a'}}
                                className={'inline-block min-w-[22px] text-center text-base font-bold'}>{searchPage.total}</span>条结果</span> :
                            <span>正在搜索中，请稍候...</span>}
                    </div> : null
            }
            <div className={'w-full h-full pb-0'}>
                {renderSearchContent()}
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
        </div>
    );
};

export default withRouter(SearchUrls);
