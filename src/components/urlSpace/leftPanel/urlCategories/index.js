'use client'
import {
    AppstoreOutlined, BookOutlined, BorderOutlined,
    CaretDownOutlined,
    CaretRightOutlined,
    EllipsisOutlined, FileOutlined, FileTextOutlined, FolderOpenOutlined, FolderOutlined,
    GlobalOutlined,
    LoadingOutlined, PlusOutlined, StarOutlined, TagOutlined, WalletOutlined
} from "@ant-design/icons";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {Space, Spin} from 'antd'
import classNames from "classnames/bind";
import {useDispatch, useSelector} from "react-redux";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {moveCategory, queryAndSearchUrls, setSearchUrlValue} from '@/lib/slices/urlSpaceSlice'
import Empty from '@/components/empty'
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import MenuAction from "@/components/menuAction";
import {Tree} from "react-arborist";
import {tile2nest} from "@/utils/help";
import {useSession} from "next-auth/react";
import UrlsSearch from "@/components/search/urlsSearch";

const UrlCategories = ({onChooseUrlCategory, onRefresh, onAdd, onEdit, onDelete, rounded}) => {
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
    const [treeHeight, setTreeHeight] = useState(0)
    const {data: session} = useSession()
    const [treeData, setTreeData] = useState([])
    const treeRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        changeResize()
        window.addEventListener('resize', changeResize);
        return () => {
            window.removeEventListener('resize', changeResize);
        }
    }, [])

    useEffect(() => {
        changeResize()
    }, [rounded]);

    function changeResize() {
        const screenHeight = window.innerHeight
        // console.log('--- rounded ----', rounded)
        if (!rounded) {
            setTreeHeight(screenHeight - 246 + 56)
        } else {
            setTreeHeight(screenHeight - 246)
        }
    }

    useEffect(() => {

        if (query.get('cid') && treeRef.current) {
            const fs = urlCategories.filter(f => f.id === query.get('cid'))
            if (fs.length > 0) {
                if (fs[0].pid){
                    treeRef.current.open(fs[0].pid)
                }
            }
        }

        const newCategories = _.cloneDeep(urlCategories)
        const d = tile2nest(newCategories)
        setTreeData(d)

    }, [urlCategories])

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
                    sortType: query.get('sortType') || 'comprehensive'
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
                        sortType: query.get('sortType') || 'comprehensive'
                    })
                }
            }
        }
    }, [query.get('cid'), query.get('search'), query.get('page'), query.get('sortType')])


    function searchBy() {
        let cid = query.get('cid')
        let filter = query.get('filter')
        let search = query.get('search')
        let sortType = query.get('sortType') || 'comprehensive'
        let page = query.get('page') || 1

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

    function renderMenus(dom) {
        const cid = query.get('cid')
        let res = null
        if (cid) {
            const fs = urlCategories.filter(f => f.id === cid)
            if (fs.length > 0) {
                res = fs[0]
            }
        }
        console.log('--- res ---', res)
        return <MenuAction data={res}
                           add={onAdd}
                           edit={onEdit}
                           delete={onDelete}
                           action={['add','edit', 'delete']}>
            {dom}
        </MenuAction>
    }

    function renderPrevIcon(node) {
        if (node.data.id === '0') {
            return <GlobalOutlined/>
        } else if (node.isLeaf) {
            return <BookOutlined />
        } else {
            if (node.isOpen) {
                return <CaretDownOutlined onClick={(e) => {
                    e.stopPropagation()
                    node.toggle()
                }}/>
            } else {
                return <CaretRightOutlined onClick={(e) => {
                    e.stopPropagation()
                    node.toggle()
                }}/>
            }
        }
    }

    function renderTreeNode({node, style, dragHandle}) {
        console.log('---------mmoe=',node)
        /* This node instance can do many things. See the API reference. */
        return (
            <div onClick={() => onSelectedNode(node.data)}>
                <div style={style} className={classNames({
                    'mx-2': true,
                    'bg-[#D4CEF1] dark:bg-[#1C2126] rounded-md': node.isSelected || query.get('cid') === node.data.id
                })} ref={dragHandle}>
                    <div className={'py-2 text-sm pl-2 flex items-center'}>
                        <div className={'text-xs'}>
                            {renderPrevIcon(node)}
                        </div>
                        {node.data.icon ? node.data.icon : null}
                        <div
                            className={'inline-flex items-center justify-between pl-1.5 w-full'}>
                            {node.data.name}
                            <div className={'pr-2 flex items-center gap-2'} onClick={e => e.stopPropagation()}>
                                {session?.user?.name === routerParams.username && query.get('cid') === node.data.id ? renderMenus(
                                        <EllipsisOutlined/>)
                                    : null}
                                {
                                    node.data.urlCount === 0
                                }
                                {/*<div className={'text-xs w-[6px] h-[6px] rounded-full bg-[#FA5457] text-[#999] flex items-center justify-center'}></div>*/}
                                {/*<div className={'text-xs w-[6px] h-[6px] rounded-full bg-[#F58319] text-[#999] flex items-center justify-center'}></div>*/}
                                {/*<div className={'text-xs w-[6px] h-[6px] rounded-full bg-[#63BA47] text-[#999] flex items-center justify-center'}></div>*/}
                                <div className={classNames({
                                    'text-xs w-[6px] h-[6px] rounded-full  text-[#999] flex items-center justify-center': true,
                                    'bg-[#fff]': node.data.urlCount === 0,
                                    'bg-[#9be9a8]': node.data.urlCount > 0 && node.data.urlCount <= 10,
                                    'bg-[#30a14e]': node.data.urlCount > 10 && node.data.urlCount <= 50,
                                    'bg-[#216e39]': node.data.urlCount > 50,
                                })}></div>

                        </div>
                        </div>
                    </div>
                </div>
            </div>

        );
    }

    function onSearch(d){
        console.log('onSearch-----', d)
        setSearchTerm(d)
    }

    function renderTree() {
        // console.log('--- treeData ---', treeData)
        // 判断是否有匹配的数据
        const hasMatch = urlCategories.length > 0 && searchTerm
            ? urlCategories.some(node =>  node.name.toLowerCase().includes(searchTerm.toLowerCase()))
            : true;

       return  hasMatch ? <Tree data={treeData}
                         ref={treeRef}
                         width={'100%'}
                         height={treeHeight}
                         selection={query.get('cid')}
                         searchTerm={searchTerm}
                         searchMatch={(node, term) =>
                             node.data.name.toLowerCase().includes(term.toLowerCase())
                         }
                         rowHeight={36}
                         indent={18}
                         openByDefault={false}
                         disableDrop={true}
                         disableMultiSelection={true}>
            {renderTreeNode}
        </Tree> : <div>
            <Empty/>
        </div>
    }
    return <div className={'overflow-y-hidden'}>
        <div className={'px-2 pb-2'}>
            <UrlsSearch suffixIcon onSearch={onSearch} defaultValue={''}/>
        </div>
        {renderTree()}

    </div>
}

export default UrlCategories
