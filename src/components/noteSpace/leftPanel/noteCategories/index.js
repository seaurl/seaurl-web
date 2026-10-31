'use client'
import {
    CaretRightOutlined,
    PlusOutlined,
    EditOutlined,
    CloseOutlined,
    SettingOutlined,
    LeftOutlined,
    FolderFilled,
    RightOutlined,
    BookFilled,
    LoadingOutlined,
    EllipsisOutlined,
    GlobalOutlined,
    CaretDownOutlined,
    BorderOutlined,
    BookOutlined
} from "@ant-design/icons";
import React, {useCallback, useEffect, useState} from "react";
import cns from "classnames/bind";
import {useDispatch, useSelector} from "react-redux";
import {useRouter, useParams, usePathname, useSearchParams} from "next/navigation";
import dayjs from "dayjs";
import {
    queryNoteCategory,
    getNoteListByCategoryId,
    deleteNoteCategory,
    clearCategory,
    getMyRecentlyNotes
} from "@/lib/slices/noteSpaceSlice";
import Empty from "@/components/empty";
import {Spin} from "antd";
import classNames from "classnames/bind";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import MenuAction from "@/components/menuAction";
import {Tree} from "react-arborist";
import {useSession} from "next-auth/react";
import {tile2nest} from "@/utils/help";
import UrlsSearch from "@/components/search/urlsSearch";
// let cx = cns.bind(styles);
const NoteCategories = ({onClickCategory, isDrawer, onTop, onAdd, onEdit, onDelete, rounded}) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const routerParams = useParams()
    // const {query} = router;
    const query = useSearchParams()

    const {noteCategories, loadingCategory} = useSelector(state => state.noteSpace)
    const {platFormTheme} = useSelector(state => state.system)
    const [treeHeight, setTreeHeight] = useState(0)
    const {data: session} = useSession()
    const [treeData, setTreeData] = useState([])
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

    useEffect(() => {
        const newCategories = _.cloneDeep(noteCategories)
        const d = tile2nest(newCategories)
        setTreeData(d)

    }, [noteCategories])

    function changeResize() {
        const screenHeight = window.innerHeight
        // console.log('--- rounded ----', rounded)
        if (!rounded) {
            setTreeHeight(screenHeight - 195 + 56)
        } else {
            setTreeHeight(screenHeight - 195)
        }
    }

    // 查看节点子分类
    function onInnerCategory(data) {
        // 进入某个列表的时候查询所有pid=该列表的id的数据
        // const result = noteCategories.filter(item => item.pid === data.id)
        // setCurrentCategories(result)
        let cid = query.get('cid')
        let nid = query.get('nid')
        let type = query.get('type')
        let params = [`vid=${data.id}`]
        if (cid) {
            params.push(`cid=${cid}`)
        }
        if (nid) {
            params.push(`nid=${nid}`)
        }
        if (type) {
            params.push(`type=${type}`)
        }
        // router.replace(`/noteSpace?${params.join('&')}`)
        shallowUpdateRouterParams(params.join("&"))
    }

    // 选中笔记分类节点
    async function onSelectedNode(item, index) {
        const cid = query.get('cid')
        if (cid !== item.id) {
            let vid = query.get('vid')
            let params = [`cid=${item.id}`]

            if (vid) {
                // 如果存在vid则放到url中
                params.push(`vid=${vid}`)
            }
            // router.replace(`/noteSpace?${params.join('&')}`)
            shallowUpdateRouterParams(params.join("&"))
        }
    }

    const renderCategory = useCallback(() => {
        let result = []
        // 根据vid筛选当前要显示的分类
        if (query.get('vid')) {
            // 截取前12个字符并且转换成大写，目的是为了好看^_^
            result = noteCategories.filter(item => item.pid === query.get('vid'))
        } else {
            result = noteCategories.filter(item => item.pid === '0')
        }
        // console.log('result=', result)


        return result.length > 0 ? result.map((item, index) => {
            return <div style={{borderColor: item.isTop ? platFormTheme?.color : 'transparent'}} className={classNames({
                'py-2 mb-1 px-[calc(12px-0.25rem)] flex items-center justify-between cursor-pointer hover:bg-[#D4CEF1] rounded-md dark:hover:bg-[#2D333B]': true,
                'bg-[#D4CEF1] dark:bg-[#2D333B] hover:bg-[#D4CEF1] dark:hover:bg-[#2D333B]': query.get('cid') === item.id,
                'border-[transparent]': !item.isTop
            })} onClick={() => {
                onSelectedNode(item, index)
                if (onClickCategory) {
                    onClickCategory()
                }
            }}>
                <div className={'flex items-center justify-between w-full'}>
                    <div className={'w-[80%] flex flex-row gap-1 relative '}>
                        <CaretRightOutlined
                            style={{
                                color: query.get('cid') === item.id ? platFormTheme.background === 'dark'
                                || (platFormTheme.background === 'system'
                                    && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#fff' : platFormTheme?.color : 'inherit'
                            }}
                            onClick={(e) => {
                                e.stopPropagation()
                                onInnerCategory(item)
                            }}/>
                        <span className={'text-sm truncate max-w-[150px]'} style={{
                            color: query.get('cid') === item.id ?
                                platFormTheme.background === 'dark'
                                || (platFormTheme.background === 'system'
                                    && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#fff' : platFormTheme?.color : 'inherit'
                        }}>{item.name}</span>
                    </div>
                    {
                        query.get('cid') === item.id ? renderMenus(<EllipsisOutlined/>) : null
                    }
                </div>
            </div>
        }) : <Empty/>
    }, [noteCategories, query.get('cid'), query.get('vid'), query.get('nid')])

    function renderMenus(dom) {
        const cid = query.get('cid')
        let res = null
        if (cid) {
            const fs = noteCategories.filter(f => f.id === cid)
            if (fs.length > 0) {
                res = fs[0]
            }
        }
        return <MenuAction data={res}
                           add={onAdd}
                           edit={onEdit}
                           delete={onDelete}
                           action={['add', 'edit', 'delete']}>
            {dom}
        </MenuAction>
    }

    function renderPrevIcon(node) {
        if (node.data.id === '0') {
            return <GlobalOutlined/>
        } else if (node.isLeaf) {
            return <BookOutlined/>
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
        /* This node instance can do many things. See the API reference. */
        return (
            <div onClick={() => onSelectedNode(node.data)}>
                <div style={style} className={classNames({
                    'mx-2': true,
                    'bg-[#D4CEF1] dark:bg-[#1C2126] rounded-md': node.isSelected || query.get('cid') === node.data.id
                })} ref={dragHandle}>
                    <div className={'py-2 text-sm pl-2 flex items-center'}>
                        <span className={'text-xs'}>
                            {renderPrevIcon(node)}
                        </span>
                        {node.data.icon ? node.data.icon : null}
                        <div
                            className={'inline-flex items-center justify-between pl-1.5 w-full'}>
                            <span className="truncate max-w-[120px]">{node.data.name}</span>
                            <div className={'pr-2 flex items-center gap-2'} onClick={e => e.stopPropagation()}>
                                {session?.user && query.get('cid') === node.data.id ? renderMenus(<EllipsisOutlined/>)
                                    : null}
                                <div className={classNames({
                                    'text-xs w-[6px] h-[6px] rounded-full  text-[#999] flex items-center justify-center': true,
                                    'bg-[#fff]': node.data.noteCount === 0,
                                    'bg-[#63BA45]': node.data.noteCount > 0 && node.data.noteCount <= 20,
                                    'bg-[#FA5458]': node.data.noteCount > 20
                                    // 'bg-[#A351A4]': node.data.urlCount > 50,
                                })}></div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );
    }

    function onSearch(d) {
        console.log('onSearch-----', d)
        setSearchTerm(d)
    }

    function renderTree() {
        // console.log('--- treeData ---', treeData)
        // 判断是否有匹配的数据
        const hasMatch = noteCategories.length > 0 && searchTerm
            ? noteCategories.some(node => node.name.toLowerCase().includes(searchTerm.toLowerCase()))
            : true;

        return hasMatch ? <Tree data={treeData}
                                width={'100%'}
                                height={treeHeight}
                                selection={query.get('cid')}
                                rowHeight={36}
                                indent={18}
                                searchTerm={searchTerm}
                                searchMatch={(node, term) =>
                                    node.data.name.toLowerCase().includes(term.toLowerCase())
                                }
                                openByDefault={false}
                                disableDrop={true}
                                disableMultiSelection={true}>
            {renderTreeNode}
        </Tree> : <div>
            <Empty/>
        </div>
    }

    return <div className={'overflow-hidden'}>
        <div className={'px-2 pb-2'}>
            <UrlsSearch suffixIcon onSearch={onSearch} defaultValue={''}/>
        </div>
        {renderTree()}
    </div>
}

export default NoteCategories
