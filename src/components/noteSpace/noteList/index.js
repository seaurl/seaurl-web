'use client'
import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import {List, message, Modal, Tooltip, Divider, Button, Space} from 'antd';
import {
    FileOutlined,
    LockOutlined,
    HistoryOutlined,
    FileTwoTone,
    MenuFoldOutlined,
    PlusOutlined, CaretDownOutlined, MenuOutlined, EllipsisOutlined, StarOutlined, StarFilled
} from "@ant-design/icons";
import {useDispatch, useSelector} from "react-redux";
import {
    addNote,
    deleteNote,
    getMyRecentlyNotes,
    getNoteListByCategoryId,
    setOpenSidebarMobileDrawer,
    setOpenSidebar,
    setFavorite, getNotesListByType
} from '@/lib/slices/noteSpaceSlice'
import dayjs from "dayjs";
import NoteEditDlg from "@/components/dialog/noteEditDlg";
import cns from "classnames/bind";
import {useRouter, useParams, usePathname, useSearchParams} from "next/navigation";
import MenuAction from "@/components/menuAction";
import Empty from "@/components/empty";
import Loading from "@/components/loading";
import classNames from "classnames/bind";
import {shallowUpdateRouterParams} from "@/utils/routerHelp"

const {confirm} = Modal;

const NoteList = ({userInfo, onOpenNoteCategory, onClickNoteList, isDrawer}) => {
    const router = useRouter();
    const routerParams = useParams()
    // const {query} = router;
    const query = useSearchParams()
    const dispatch = useDispatch();

    const {notes, loadingNotes, noteCategories, openSidebarMobileDrawer, openSidebar} = useSelector(state => state.noteSpace)
    const {platFormTheme, isMobile, isMdScreen} = useSelector(state => state.system)

    const [isServer, setServer] = useState(true)

    const [dlg, setDlg] = useState({
        action: '',
        title: '',
        show: false,
        loading: false
    })
    const abortControllerRef = useRef(null)

    useEffect(() => {

        return () => {
            if (abortControllerRef.current?.abort) {
                abortControllerRef.current.abort();
            }
        }
    }, [])

    useLayoutEffect(() => {
        if (isServer) {
            setServer(false)
        } else {
            // 1、如果没cid则会走serverPage查询最近的笔记列表
            // 2、当点击查询最近笔记列表时，cid肯定是空的，所以也不能走这里
            if (query.get('cid')) {
                getNoteListAndSetNid()
            }
        }
    }, [query.get('cid')])

    async function getNoteListAndSetNid() {
        const cid = query.get('cid')
        const nid = query.get('nid')
        const vid = query.get('vid')
        if (cid) {
            if (abortControllerRef.current?.abort) {
                abortControllerRef.current.abort();
            }
            // 创建新的 AbortController
            abortControllerRef.current = new AbortController();
            const res = await dispatch(getNoteListByCategoryId({
                categoryId: cid,
                abortController: abortControllerRef.current
            }))
            if (nid) {

            } else {
                if (res?.payload?.data && res?.payload?.data?.length > 0) {
                    let p = ['nid=' + res?.payload?.data[0].id]
                    if (cid) {
                        p.push('cid=' + cid)
                    }
                    if (vid) {
                        p.push('vid=' + vid)
                    }
                    shallowUpdateRouterParams(p.join('&'))
                }
            }
        } else {

            //注意：没有cid就不能走这里

            // 如果没有cid，则查询最近笔记
            // const res = await dispatch(getMyRecentlyNotes())
            // if (res?.payload?.data && res?.payload?.data?.length > 0) {
            //     let p = ['nid=' + res?.payload?.data[0].id]
            //     if (cid) {
            //         p.push('cid=' + cid)
            //     }
            //     if (vid) {
            //         p.push('vid=' + vid)
            //     }
            //     shallowUpdateRouterParams(p.join('&'))
            // }
        }
    }

    async function btnAdd() {
        const cid = query.get('cid')
        if (cid) {
            await dispatch(addNote({
                title: '无标题',
                categoryId: cid
            }))
            const _nid = await queryNotes(cid)
            console.log('call=', _nid)
            if (_nid) {
                resetRouter(_nid)
            }
        } else {
            message.warning('请先选择笔记分类');
        }
    }

    // 重置路由
    function resetRouter(_nid) {
        let type = query.get('type')
        let cid = query.get('cid')
        let params = []

        if (type) {
            params.push(`type=${type}`)
        }
        if (cid) {
            params.push(`cid=${cid}`)
        }
        if (_nid) {
            params.push(`nid=${_nid}`)
        }
        // router.replace(`/noteSpace?${params.join('&')}`)
        shallowUpdateRouterParams(params.join('&'))
    }

    async function queryNotes(cid) {
        if (abortControllerRef.current?.abort) {
            abortControllerRef.current.abort();
        }
        // 创建新的 AbortController
        abortControllerRef.current = new AbortController();
        const res = await dispatch(getNoteListByCategoryId({
            categoryId: cid,
            abortController: abortControllerRef.current
        }))
        console.log('queryNotes res=', res)
        if (res.payload.status === 0 && res.payload.data.length > 0) {
            return res.payload.data[0].id
        }
        return ''
    }

    async function gotoMyNote() {
        const vid = query.get('vid')
        const _notes = await dispatch(getMyRecentlyNotes())

        if (onClickNoteList) {
            onClickNoteList()
        }
        if (_notes?.payload?.status === 0 && _notes?.payload?.data?.length > 0) {
            let str = `nid=${_notes?.payload?.data[0].id}`
            if (vid) {
                str += '&vid=' + vid
            }
            shallowUpdateRouterParams(str)
        } else {
            if (vid) {
                shallowUpdateRouterParams(`vid=${vid}`)
            } else {
                shallowUpdateRouterParams(``)
            }
        }
    }

    // 选中笔记
    function handlerChooseNote(item) {
        let cid = query.get('cid')
        let type = query.get('type')
        let params = []
        if (cid) {
            params.push(`cid=${cid}`)
        }
        if (type) {
            params.push(`type=${type}`)
        }
        if (item) {
            params.push(`nid=${item.id}`)
            if (params.length > 0) {
                // router.replace(`/noteSpace?${params.join('&')}`)
                shallowUpdateRouterParams(params.join('&'))
            } else {
                // router.replace(`/noteSpace`)
                shallowUpdateRouterParams("")
            }
        }
    }

    // 移动笔记
    function btnMove() {
        if (!query.get('nid')) {
            message.warning('请先选择笔记');
        } else {
            setDlg({
                title: '移动笔记',
                show: true,
                loading: false
            })
        }
    }

    async function getNotesList() {
        const res = await dispatch(getNotesListByType({
            type: query.get('type')
        }))
        if (res.payload.status === 0) {
            if (res.payload.data.length > 0) {
                shallowUpdateRouterParams('type=' + query.get('type') + '&nid=' + res.payload.data[0].id)
            } else {
                shallowUpdateRouterParams('type=' + query.get('type'))
            }
        }
    }

    async function btnFavorite(d, d2) {
        console.log('ddd222-', d2)
        const type = query.get('type')
        const nid = query.get('nid')
        const cid = query.get('cid')
        let _note = null
        if (nid) {
            const fs = notes.filter(f => f.id === nid)
            if (fs.length > 0) {
                _note = fs[0]
            }
        }
        console.log('_note-', _note)
        if (_note) {
            const res = await dispatch(setFavorite({
                noteId: query.get('nid'),
                isFavorite: !_note.isFavorite
            }))
            console.log('setFavorite res=', res)
            if (res.payload.status === 0) {
                message.success(!_note.isFavorite ? '收藏成功' : '取消收藏成功');
                if (cid) {
                    if (abortControllerRef.current?.abort) {
                        abortControllerRef.current.abort();
                    }
                    // 创建新的 AbortController
                    abortControllerRef.current = new AbortController();
                    await dispatch(getNoteListByCategoryId({
                        categoryId: cid,
                        abortController: abortControllerRef.current
                    }))
                } else if (type) {
                    getNotesList()
                }
            } else {
                message.error(!_note.isFavorite ? '收藏失败' : '取消收藏失败');
            }
        }
    }

    // 删除笔记
    async function btnDelete() {
        const type = query.get('type')
        const nid = query.get('nid')
        const cid = query.get('cid')
        if (nid) {
            const fs = notes.filter(f => f.id === nid)
            if (fs.length > 0) {
                confirm({
                    title: `您确定要删除"${fs[0].title}"笔记`,
                    okText: '确定',
                    cancelText: '取消',
                    onOk: async () => {
                        const res = await dispatch(deleteNote({
                            id: nid
                        }));
                        if (res.payload.status === 0) {
                            message.success('删除成功');
                            let noteRes = []
                            // 查询是否有cid，没有则查最近使用的
                            if (cid) {
                                if (abortControllerRef.current?.abort) {
                                    abortControllerRef.current.abort();
                                }
                                // 创建新的 AbortController
                                abortControllerRef.current = new AbortController();
                                noteRes = await dispatch(getNoteListByCategoryId({
                                    categoryId: cid,
                                    abortController: abortControllerRef.current
                                }))
                            } else {
                                noteRes = await dispatch(getNotesListByType({
                                    type: query.get('type')
                                }))
                            }
                            if (noteRes?.payload?.status === 0 && noteRes?.payload?.data?.length > 0) {
                                resetRouter(noteRes?.payload?.data[0].id || '')
                            }

                        } else {
                            message.warning(res.payload.message)
                        }
                    }
                });
            }
        } else {
            message.warning('请先选择笔记');
        }
    }


    function replaceHtml(d) {
        return d.replaceAll("&nbsp;", " ")
            .replaceAll("&lt;", "<")
            .replaceAll("&gt;", ">")
            .replaceAll("&amp;", "&")
            .replaceAll("&quot;", "\"")
            .replaceAll("&apos;", "'");
    }

    function removeHtmlTags(html) {
        // 创建一个临时的DOM元素
        var tempElement = document.createElement("div");
        // 设置其innerHTML为富文本内容
        tempElement.innerHTML = html;

        // 使用textContent或innerText获取纯文本内容
        return replaceHtml(tempElement.textContent) || replaceHtml(tempElement.innerText) || "";
    }

    function getCateName() {
        if (query.get('cid')) {
            const fs = noteCategories.filter(f => f.id === query.get('cid'))
            if (fs.length > 0) {
                return fs[0].name
            }
        }
        if (query.get('type') === 'frequently') {
            return '常用笔记'
        }
        if (query.get('type') === 'favorite') {
            return '收藏笔记'
        }
        return ''
    }

    function renderIcon() {
        if (isMdScreen || isMobile) {
            return !openSidebarMobileDrawer ? <MenuOutlined/> : <MenuFoldOutlined/>
        } else {
            return !openSidebar ? <MenuOutlined/> : <MenuFoldOutlined/>
        }
    }

    function renderMenus(dom, noteData) {
        // const cid = query.get('cid')
        // let res = null
        // if (cid) {
        //     const fs = notes.filter(f => f.id === cid)
        //     if (fs.length > 0) {
        //         res = fs[0]
        //     }
        // }
        return <MenuAction data={noteData}
                           move={btnMove}
                           delete={btnDelete}
                           favorite={btnFavorite}
                           action={['move', 'favorite', 'delete']}>
            {dom}
        </MenuAction>
    }

    function getChooseNote() {
        const nid = query.get('nid')
        const cid = query.get('cid')
        let _note = null
        if (nid) {
            const fs = notes.filter(f => f.id === nid)
            if (fs.length > 0) {
                _note = fs[0]
            }
        }
        return _note
    }

    return <div className={classNames({
        'bg-white dark:bg-[#141414] h-screen': true,
    })}>
        <div
            className={'w-full h-[60px] px-2 inline-flex items-center justify-between border-b border-[#ddd] dark:border-[#474747]'}>
            <div className={'flex items-center font-bold gap-1 truncate'}>
                <div
                    className={'flex items-center justify-center cursor-pointer hover:bg-[#eee] dark:hover:bg-[#2E333C] w-[36px] h-[36px] rounded-full'}
                    onClick={() => {
                        if (isMdScreen || isMobile) {
                            dispatch(setOpenSidebarMobileDrawer(!openSidebarMobileDrawer))
                            dispatch(setOpenSidebar(false))
                        } else {
                            dispatch(setOpenSidebarMobileDrawer(false))
                            dispatch(setOpenSidebar(!openSidebar))
                        }
                    }}>
                    {/*<Button size={'small'} icon={<MenuFoldOutlined className={'text-xl cursor-pointer'}/>}*/}
                    {/*        onClick={() => {*/}
                    {/*            if (onOpenNoteCategory) {*/}
                    {/*                onOpenNoteCategory()*/}
                    {/*            }*/}
                    {/*        }}/>*/}
                    {renderIcon()}
                </div>
                <span className={'truncate text-sm'}>
                    {getCateName()}
                </span>
            </div>
            <div className={'cursor-pointer flex items-center gap-2'}>
                {/*<div className={'flex items-center justify-center'}>*/}
                {/*    <Tooltip title="最近常用" placement={'bottom'}>*/}
                {/*        <HistoryOutlined onClick={gotoMyNote}/>*/}
                {/*    </Tooltip>*/}
                {/*</div>*/}
                <MenuAction
                    data={getChooseNote()}
                    add={btnAdd}
                    move={btnMove}
                    delete={btnDelete}
                    favorite={btnFavorite}
                    action={['add', 'move', 'favorite', 'delete']}>
                    <Space size={4}>
                        <PlusOutlined/>
                        <CaretDownOutlined/>
                    </Space>
                </MenuAction>
            </div>
        </div>
        <div className={'overflow-y-auto h-[calc(100vh-60px)]'} id="noteList">
            {
                loadingNotes ? <div className={'w-full flex items-center justify-center'}>
                    <Loading/>
                </div> : notes?.length > 0 ?
                    notes.map((item, index) => (
                        <div key={index} className={classNames({
                            'flex flex-col px-[12px] py-[16px] dark:hover:bg-[#2D333B] cursor-pointer': true,
                            'bg-[#d4cef1] dark:bg-[#2D333B] dark:hover:bg-[#2D333B]': query.get('nid') === item.id
                        })} onClick={() => {
                            handlerChooseNote(item)
                            if (onClickNoteList) {
                                onClickNoteList()
                            }
                        }}>
                            <div
                                style={{
                                    color: query.get('nid') === item.id ? platFormTheme.background === 'dark'
                                    || (platFormTheme.background === 'system'
                                        && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#fff' : platFormTheme?.color : 'inherit'
                                }}
                                className={'font-normal w-full flex items-center justify-between  '}>
                                <div className={'overflow-hidden whitespace-nowrap cursor-pointer truncate text-sm font-medium'}>
                                    {
                                        !item.isFavorite ? <FileTwoTone className={'pr-1'}/> :
                                            <span className={'text-[#faca08]'}><StarFilled className={'pr-1'}/></span>
                                    }
                                    {item.title}
                                </div>
                                <div className={'text-xs text-[#9ea3a8] text-nowrap'}>
                                    {dayjs(dayjs.utc(item.updatedDt).local()).fromNow()}
                                </div>
                            </div>
                            <div className={'flex items-center justify-between pt-1'}>
                                <span className={' text-xs text-[#666] truncate'}>
                                    {removeHtmlTags(item.content)}
                                </span>
                                {
                                    query.get('nid') === item.id ? renderMenus(<EllipsisOutlined
                                            onClick={e => e.stopPropagation()}/>, item) :
                                        <span className={'w-[16px] h-[16px]'}></span>
                                }
                            </div>
                        </div>
                    ))
                    : <Empty/>
            }
        </div>
        <NoteEditDlg dlg={dlg}/>
    </div>
}

export default NoteList
