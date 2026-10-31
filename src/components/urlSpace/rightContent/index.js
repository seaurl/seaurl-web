'use client'
import React, {
    useState,
    useEffect, useCallback
} from "react";
import {
    Row,
    Col,
    Space,
    Popconfirm,
    Modal,
    Drawer,
    Select,
    message,
    Typography,
    Empty,
    Menu,
    Dropdown, Pagination,
} from "antd";
import {LeftOutlined, RightOutlined} from "@ant-design/icons";
import {useDispatch, useSelector} from 'react-redux';
import Urls from './urls'
import {useRouter, useParams, useSearchParams} from "next/navigation";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import styles from './index.module.scss'
import cns from "classnames/bind";
let cx = cns.bind(styles);

const RightContent = ({isDashboard, guysInfo, userInfo}) => {
    const {categoryUrls, categoryUrlsTotal, loadingUrls, urlPageNum} = useSelector(state => state.urlSpace)

    function renderPagination() {
        const router = useRouter();
        // const {query} = router;
        const query = useSearchParams()
        const routerParams = useParams()
        const cid = query.get('cid')
        const vid = query.get('vid')
        const type = query.get('type')
        const search = query.get('search')
        const sortType = query.get('sortType')

        const {platFormTheme} = useSelector(state => state.system)
        // 加载的时候、网址数量大于60的时候，并且有cid，才显示分页器
        if (!loadingUrls && categoryUrlsTotal > 60 && (cid || search)) {
            return <div className={'w-full flex items-center justify-center py-[20px]'}>
                <Pagination total={categoryUrlsTotal}
                            pageSize={60}
                            defaultCurrent={query.get('page') || 1}
                            showSizeChanger={false}
                            onChange={(page, pageSize) => {
                                console.log('page, pageSize=', page, pageSize)

                                let params = [`page=${page}`]
                                // dispatch(setUrlPageNum(page))
                                if (cid) {
                                    params.push(`cid=${cid}`)
                                }
                                if (type) {
                                    params.push(`type=${type}`)
                                }
                                if (vid) {
                                    params.push(`vid=${vid}`)
                                }
                                if (search) {
                                    params.push(`search=${search}`)
                                }
                                if (sortType) {
                                    params.push(`sortType=${sortType}`)
                                }
                                // router.push(`/${routerParams.username}/urlSpace?${params.join('&')}`)
                                shallowUpdateRouterParams(params.join('&'))
                            }}
                            itemRender={(_, type, originalElement) => {
                                if (type === 'prev') {
                                    return <a className={'flex items-center'} style={{color: platFormTheme?.color}}>
                                        <LeftOutlined className={'pr-[6px]'}/>上一页
                                    </a>;
                                }
                                if (type === 'next') {
                                    return <a className={'flex items-center'} style={{color: platFormTheme?.color}}>
                                        下一页<RightOutlined className={'pl-[6px]'}/>
                                    </a>;
                                }
                                return originalElement;
                            }}/>
            </div>
        }
        return null
    }

    const renderUrls = useCallback(() => {
        return <Urls guysInfo={guysInfo} userInfo={userInfo} urls={categoryUrls}/>
    }, [categoryUrls])

    return <div className={cx({
        'py-[6px] px-[16px] lg:px-[32px]': true,
        'container': true,
    })}>
        {renderUrls()}
        {renderPagination()}
    </div>
};

export default RightContent;
