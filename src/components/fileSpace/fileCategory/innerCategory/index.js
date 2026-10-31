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
    BookFilled, LoadingOutlined, EllipsisOutlined, CaretDownOutlined
} from "@ant-design/icons";
import React, {useCallback, useEffect, useState} from "react";
import cns from "classnames/bind";
import {useDispatch, useSelector} from "react-redux";
import {useRouter, usePathname, useParams, useSearchParams} from "next/navigation";

import Empty from "@/components/empty";
import {Space, Spin} from "antd";
import classNames from "classnames/bind";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import MenuAction from "@/components/menuAction";

const InnerCategory = ({onClickFileCategory, isDrawer, onTop, onEdit, onDelete}) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const routerParams = useParams()
    // const {query} = router;
    const query = useSearchParams()
    const {fileCategories, loadingCategory} = useSelector(state => state.fileSpace)
    const {platFormTheme} = useSelector(state => state.system)
    const [isServer, setServer] = useState(true)

    // 查看节点子分类
    function onInnerCategory(data) {
        let cid = query.get('cid')
        let type = query.get('type')
        let username = routerParams.username
        let params = [`vid=${data.id}`]
        if (cid) {
            params.push(`cid=${cid}`)
        }
        if (type) {
            params.push(`type=${type}`)
        }
        // router.push(`/fileSpace?${params.join('&')}`)
        shallowUpdateRouterParams(params.join("&"))
    }

    // 选中节点
    async function onSelectedNode(item, index) {
        let vid = query.get('vid')
        let username = routerParams.username
        let params = [`cid=${item.id}`]
        if (vid) {
            // 如果存在vid则放到url中
            params.push(`vid=${vid}`)
        }
        // router.push(`/fileSpace?${params.join('&')}`)
        shallowUpdateRouterParams(params.join("&"))
    }

    function getTitle() {
        if (query.get('vid')) {
            const result = fileCategories.filter(item => item.id === query.get('vid'))
            if (result.length > 0) {
                return result[0].name
            }
        }
        return ''
    }

    const renderCategory = useCallback(() => {
        let result = []
        // 根据vid筛选当前要显示的分类
        if (query.get('vid')) {
            result = fileCategories.filter(item => item.pid === query.get('vid'))
        } else {
            result = fileCategories.filter(item => item.pid === '0')
        }
        return result.length > 0 ? result.map((item, index) => {
            return <div
                className={classNames({
                    'py-2 mb-1 px-[calc(12px-0.25rem)] flex items-center justify-between cursor-pointer hover:bg-[#D4CEF1] rounded-md dark:hover:bg-[#2D333B]': true,
                    'bg-[#D4CEF1] dark:bg-[#2D333B] hover:bg-[#D4CEF1] dark:hover:bg-[#2D333B]': query.get('cid') === item.id,
                    'border-[transparent]': !item.isTop
                })} onClick={() => {
                if (query.get('cid')) {
                    if (query.get('cid') !== item.id) {
                        onSelectedNode(item, index)
                    }
                } else {
                    onSelectedNode(item, index)
                }
                if (onClickFileCategory) {
                    onClickFileCategory()
                }
            }}>
                <div className={'flex items-center justify-between w-full'}>
                    <div className={'flex items-center gap-1'}>
                        <CaretRightOutlined
                            style={{color: query.get('cid') === item.id ? platFormTheme.background === 'dark'
                                    || (platFormTheme.background === 'system'
                                        && window.matchMedia('(prefers-color-scheme: dark)').matches)?'#fff':platFormTheme?.color : 'inherit'}}
                            className={'text-[#0969da] text-sm'}
                            onClick={(e) => {
                                e.stopPropagation()
                                onInnerCategory(item)
                            }}/>
                        <span
                            style={{color: query.get('cid') === item.id ? platFormTheme.background === 'dark'
                                    || (platFormTheme.background === 'system'
                                        && window.matchMedia('(prefers-color-scheme: dark)').matches)?'#fff':platFormTheme?.color : 'inherit'}}
                            className={'text-sm'}>{item.name}</span>
                    </div>
                    {
                        query.get('cid') === item.id ? renderMenus(<EllipsisOutlined />) : null
                    }

                </div>
            </div>
        }) : <Empty/>
    })

    function renderMenus(dom) {
        const cid = query.get('cid')
        let res = null
        if (cid) {
            const fs = fileCategories.filter(f => f.id === cid)
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
        'w-full overflow-y-auto': true,
        'h-[calc(100vh-121px)]': isDrawer,
        'h-[calc(100vh-180px)]': !isDrawer
    })}>
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
