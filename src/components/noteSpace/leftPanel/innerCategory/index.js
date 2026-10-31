'use client'
import {
    CaretRightOutlined,
    PlusOutlined,
    EditOutlined,
    CloseOutlined,
    SettingOutlined,
    LeftOutlined,
    FolderFilled,
    RightOutlined, BookFilled, LoadingOutlined, EllipsisOutlined
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
// let cx = cns.bind(styles);
const InnerCategory = ({onClickCategory, isDrawer, onTop, onEdit, onDelete}) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const routerParams = useParams()
    // const {query} = router;
    const query = useSearchParams()

    const {noteCategories, loadingCategory} = useSelector(state => state.noteSpace)
    const {platFormTheme} = useSelector(state => state.system)

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
                        <span className={'text-sm truncate'} style={{
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
                           top={onTop}
                           edit={onEdit}
                           delete={onDelete}
                           action={['edit', 'delete', 'top']}>
            {dom}
        </MenuAction>
    }

    return <div className={classNames({
        'overflow-y-auto': true,
        'h-[calc(100vh-60px)]': isDrawer,
        'h-[calc(100vh-113px)]': !isDrawer,
    })}>
        <div className={''}>
            {
                loadingCategory ? <div
                    style={{
                        height: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}><Spin indicator={<LoadingOutlined
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
    </div>
}

export default InnerCategory
