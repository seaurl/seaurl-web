'use client'
import dynamic from 'next/dynamic'
import {Row, Col, Input, Space, Button, List, Typography, Empty, Drawer, message, theme} from 'antd'
import {
    getNoteListByCategoryId,
    addNote,
    setDataFromServer, setOpenNoteListMobileDrawer, setOpenSidebar, setOpenSidebarMobileDrawer, getNotesListByType
} from '@/lib/slices/noteSpaceSlice'

import React, {memo, useEffect, useState, Suspense, useLayoutEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import LeftPanel from "@/components/noteSpace/leftPanel";
import NoteList from "@/components/noteSpace/noteList";
import {useRouter, useParams, usePathname, useSearchParams} from "next/navigation";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import NoteEditor from "@/components/noteSpace/noteEditor"
import {MenuFoldOutlined} from "@ant-design/icons";
import Loading from "@/components/loading";
import classNames from "classnames/bind";
import {getUrlListByType} from "@/lib/slices/urlSpaceSlice";

const NoteSpace = (serverData) => {
    const router = useRouter();
    const dispatch = useDispatch();
    // const {query} = router;
    const routerParams = useParams()
    const [open, setOpen] = useState(false);
    const [childrenOpen, setChildrenOpen] = useState(false);
    const {token} = theme.useToken();

    // const {query} = router;
    const query = useSearchParams()
    const {isMobile, isXlScreen, isMdScreen} = useSelector(state => state.system)
    const {
        notes,
        loadingCategory,
        loadingNotes,
        loadingNote,
        openSidebar,
        openSidebarMobileDrawer,
        openNoteListMobileDrawer
    } = useSelector(state => state.noteSpace)

    const [isServer, setServer] = useState(true)

    useLayoutEffect(() => {
        if (isServer) {
            dispatch(setDataFromServer({
                noteCategories: serverData.noteCategories,
                notes: serverData.notes,
                noteCount: serverData.noteCount,
            }))
            if (query.get('cid')) {
                if (!query.get('nid')) {
                    if (serverData.notes?.length > 0) {
                        // 默认选中第一条数据
                        shallowUpdateRouterParams('cid=' + query.get('cid') + '&nid=' + serverData.notes[0].id)
                    } else {
                        // 默认选中第一条数据
                        shallowUpdateRouterParams('cid=' + query.get('cid'))
                    }
                }
            } else if (query.get('type')) {
                if (!query.get('nid')) {
                    if (serverData.notes?.length > 0) {
                        // 默认选中第一条数据
                        shallowUpdateRouterParams('type=' + query.get('type') + '&nid=' + serverData.notes[0].id)
                    } else {
                        // 默认选中第一条数据
                        shallowUpdateRouterParams('type=' + query.get('type'))
                    }
                }
            } else {
                if (!query.get('nid')) {
                    if (serverData.notes?.length > 0) {
                        shallowUpdateRouterParams('type=frequently' + '&nid=' + serverData.notes[0].id)
                    } else {
                        shallowUpdateRouterParams('type=frequently')
                    }
                }
            }
            setServer(false)
        }
    }, [])

    useEffect(() => {
        if (query.get('type')) {
            getNotesList()
        }
    }, [query.get('type')])

    // 监听变化
    useEffect(() => {
        dispatch(setOpenNoteListMobileDrawer(false))
        // 初始化两个面板的显示条件
        if (isMobile) {
            dispatch(setOpenSidebar(false))
            dispatch(setOpenSidebarMobileDrawer(false))
        }
    }, [isMobile]);

    useEffect(() => {
        // dispatch(setOpenNoteListMobileDrawer(false))
        // // 初始化两个面板的显示条件
        if (isMdScreen) {
            dispatch(setOpenSidebar(false))
            dispatch(setOpenSidebarMobileDrawer(false))
        }
    }, [isMdScreen]);

    useEffect(() => {
        if (isXlScreen) {
            dispatch(setOpenSidebar(true))
            dispatch(setOpenSidebarMobileDrawer(false))
        }
    }, [isXlScreen]);

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

    return <div className={'overflow-hidden h-[100vh]'}>
        <div className={'flex flex-row'}>
            <div className={classNames({
                'flex-col': true,
                'w-0': !openSidebar,
                'w-[260px] border-r border-[#e5e5e5] dark:border-[#474747]': openSidebar
            })}>
                <LeftPanel userInfo={serverData.userInfo}/>
                {/*<UserHeader userInfo={props.userInfo}/>*/}
            </div>
            <div className={'hidden md:block shrink-0 w-[300px] border-r border-[#ddd] dark:border-[#474747]'}>
                {
                    query.get('cid') || notes ? <NoteList userInfo={serverData.userInfo}/> :
                        <div className={'flex items-center justify-center h-[100vh]'}>
                            <div
                                className={'inline-block text-[#333] dark:text-white text-xl font-bold'}>请先选择笔记分类
                            </div>
                        </div>
                }
            </div>
            <div className={classNames({
                'bg-white dark:bg-[#141414] shirk-0': true,
                'w-screen': isMobile,
                'w-[calc(100vw-300px)]': isMdScreen || (isXlScreen && !openSidebar),
                'w-[calc(100vw-620px)]': isXlScreen && openSidebar
            })}>
                <NoteEditor onOpenDrawer={() => {
                    setOpen(true)
                }}/>
            </div>
        </div>
        <Drawer styles={{
            body: {
                padding: '0',
            },
        }}
                title={null}
                width={320}
                closable={false}
                placement="left"
                onClose={() => dispatch(setOpenNoteListMobileDrawer(false))}
                open={openNoteListMobileDrawer}>
            <div className={'w-full'}>
                {
                    query.get('cid') || notes ?
                        <NoteList isDrawer userInfo={serverData.userInfo}
                                  onClickNoteList={() => {
                                      // dispatch(setOpenNoteListMobileDrawer(false))
                                  }}
                                  onOpenNoteCategory={() => {
                                      setChildrenOpen(true)
                                  }}/> :
                        <div className={'flex items-center justify-center h-[100vh]'}>
                            <div
                                className={'inline-block text-[#333] dark:text-white text-xl font-bold'}>请先选择笔记分类
                            </div>
                        </div>
                }
            </div>

        </Drawer>
        <Drawer
            title=""
            styles={{
                body: {
                    padding: '0',
                },
            }}
            placement="left"
            width={320}
            zIndex={2000}
            closable={false}
            onClose={() => dispatch(setOpenSidebarMobileDrawer(false))}
            open={openSidebarMobileDrawer}>
            <div className={'w-full flex flex-col'}>
                <LeftPanel
                    isDrawer
                    rounded={false}
                    userInfo={serverData.userInfo}
                    onClickCategory={() => {
                        // dispatch(setOpenMobileDrawer(false))
                    }}/>
                {/*<UserHeader userInfo={props.userInfo}/>*/}
            </div>
        </Drawer>
    </div>
}
export default NoteSpace;
