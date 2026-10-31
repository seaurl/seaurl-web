'use client'
import {CaretRightOutlined, EllipsisOutlined, LoadingOutlined} from "@ant-design/icons";
import React, {useCallback, useEffect, useRef} from "react";
import {Spin} from 'antd'
import classNames from "classnames/bind";
import {useDispatch, useSelector} from "react-redux";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {queryAndSearchUrls, setSearchUrlValue} from '@/lib/slices/urlSpaceSlice'
import Empty from '@/components/empty'
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import MenuAction from "@/components/menuAction";

const InnerCategory = ({onChooseUrlCategory, onTop, onEdit, onDelete}) => {
    const dispatch = useDispatch();
    const router = useRouter();
    // const {query} = router;
    const query = useSearchParams()
    const routerParams = useParams()
    const {
        urlCategories,
        loadingCategory,
        urlPageSize
    } = useSelector(state => state.urlSpace)
    const {platFormTheme} = useSelector(state => state.system)
    const requestRef = useRef(null)
    // 监听分页变化
    useEffect(() => {
        window.scrollTo({
            top: 0,
            // behavior: "smooth"
        });
        // 如果有page则查询网址并且设置pageNum
        if (query.get('page')) {
            // dispatch(setUrlPageNum(query.get('page')))
            if (query.get('search')) {
                searchBy()
            } else {
                request({
                    search: '',
                    categoryId: query.get('cid'),
                    pageNum: query.get('page') || 1,
                    pageSize: urlPageSize,
                    sortType: query.get('sortType')
                })
            }
        } else {
            // dispatch(setUrlPageNum(1))
            if (query.get('search')) {
                searchBy()
            } else {
                if (query.get('cid')) {
                    request({
                        search: '',
                        categoryId: query.get('cid'),
                        pageNum: query.get('page') || 1,
                        pageSize: urlPageSize,
                        sortType: query.get('sortType')
                    })
                }
            }
        }
    }, [query.get('cid'), query.get('search'), query.get('page'), query.get('sortType')])


    function searchBy() {
        let cid = query.get('cid')
        let filter = query.get('filter')
        let search = query.get('search')
        let sortType = query.get('sortType')
        let page = query.get('page')

        // 设置搜索内容
        dispatch(setSearchUrlValue(search));

        if (filter) {
            // 如果是当前分类，并且有cid，则查询当前分类下的search内容
            if (filter === 'current' && cid) {
                request({
                    userName: routerParams.username,
                    categoryId: query.get('cid'),
                    search: query.get('search'),
                    pageNum: page || 1,
                    pageSize: urlPageSize,
                    sortType
                })
            }
            // 如果查询的是所有则cid为空
            if (filter === 'all') {
                request({
                    userName: routerParams.username,
                    categoryId: '',
                    search: query.get('search'),
                    pageNum: page || 1,
                    pageSize: urlPageSize,
                    sortType
                })
            }
        } else {
            // 如果没有filter则直接查询的是所有分类下的
            request({
                userName: routerParams.username,
                categoryId: '',
                search: query.get('search'),
                pageNum: page || 1,
                pageSize: urlPageSize,
                sortType
            })
        }
    }

    function request(data) {
        console.log('--- request ---', data)
        if (requestRef.current) {
            console.log('--- abort ---', data)
            // 防止重复请求
            requestRef.current.abort();
        }
        requestRef.current = new AbortController()
        data.controller = requestRef.current
        console.log('--- data ---', data)
        dispatch(queryAndSearchUrls(data));
    }

    // 查看节点子分类
    function onInnerCategory(data) {
        let cid = query.get('cid')
        let type = query.get('type')
        let page = query.get('page')
        let search = query.get('search')
        const sortType = query.get('sortType')
        let params = [`vid=${data.id}`]
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
        // router.push(`/${routerParams.username}/urlSpace?${params.join('&')}`)
        shallowUpdateRouterParams(params.join('&'))
    }

    // 选中节点
    async function onSelectedNode(item, index) {
        if (onChooseUrlCategory) {
            onChooseUrlCategory()
        }
        window.scrollTo({
            top: 0,
            // behavior: "smooth"
        });
        // dispatch(setSortType('comprehensive'))
        // dispatch(setSearchFilter('current'))
        // dispatch(setUrlPageNum(1))
        let vid = query.get('vid')
        let params = [`cid=${item.id}`]
        params.push(`sortType=comprehensive`)
        if (vid) {
            // 如果存在vid则放到url中
            params.push(`vid=${vid}`)
        }
        // router.push(`/${routerParams.username}/urlSpace?${params.join('&')}`)
        shallowUpdateRouterParams(params.join('&'))
    }

    // 渲染分类
    const renderCategory = useCallback(() => {
        let result = []
        // 根据vid筛选当前要显示的分类
        if (query.get('vid')) {
            // 截取前12个字符并且转换成大写，目的是为了好看^_^
            result = urlCategories.filter(item => item.pid === query.get('vid'))
        } else {
            result = urlCategories.filter(item => item.pid === '0')
        }

        return result.length > 0 ? result.map((item, index) => {
            return <div style={{borderColor: item.isTop ? platFormTheme?.color : 'transparent'}}
                        className={classNames({
                            'py-2 mb-1 px-[calc(12px-0.25rem)] flex items-center justify-between cursor-pointer hover:bg-[#D4CEF1] rounded-md dark:hover:bg-[#2D333B]': true,
                            'bg-[#D4CEF1] dark:bg-[#2D333B] hover:bg-[#D4CEF1] dark:hover:bg-[#2D333B]': query.get('cid') === item.id,
                            'border-[transparent]': !item.isTop
                        })} onClick={() => {
                onSelectedNode(item, index)
            }}>
                <div className={'flex items-center justify-between w-full'}>
                    <div className={'w-full flex items-center gap-1 relative'}>
                        <CaretRightOutlined className={''} onClick={(e) => {
                            e.stopPropagation()
                            onInnerCategory(item)
                        }}/>
                        <span className={'text-sm'}>{item.name}</span>
                    </div>

                </div>
                {
                    query.get('cid') === item.id ? renderMenus(<EllipsisOutlined />) : null
                }
                {/*{*/}
                {/*  item.isTop ? <div className={styles.right}>*/}
                {/*    <PushpinOutlined className={styles.pinIcon}/>*/}
                {/*  </div> : null*/}
                {/*}*/}
            </div>
        }) : <div className={'flex items-center justify-center min-h-[200px]'}>
            <Empty/>
        </div>
    }, [query, urlCategories])

    function renderMenus(dom) {
        const cid = query.get('cid')
        let res = null
        if (cid) {
            const fs = urlCategories.filter(f => f.id === cid)
            if (fs.length > 0) {
                res = fs[0]
            }
        }
        return <MenuAction data={res}
                           top={onTop}
                           edit={onEdit}
                           delete={onDelete}
                           action={['edit', 'delete', 'top']}>
            {dom}
        </MenuAction>
    }

    return <div className={'overflow-y-hidden'}>
        {
            loadingCategory ? <div className={'h-[100px] flex items-center justify-center'}>
                <Spin indicator={<LoadingOutlined
                    style={{
                        fontSize: 36,
                    }}
                    spin
                />}/>
            </div> : <div className={'px-[calc(12px-0.25rem)] '}>
                {renderCategory()}
            </div>
        }
    </div>
}

export default InnerCategory
