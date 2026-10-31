'use client'
import {useRouter, useParams, usePathname, useSearchParams} from "next/navigation";
import {useDispatch, useSelector} from "react-redux";
import React, {memo, useEffect, useState} from "react";
import {
    setDataFromServer, setOpenMobileDrawer
} from '@/lib/slices/fileSpaceSlice'
import FileCategory from '@/components/fileSpace/fileCategory'
import FileList from "@/components/fileSpace/fileList";
import {Drawer, theme} from "antd";

import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import classNames from "classnames/bind";
import FileSidebar from "@/components/fileSpace/fileSidebar";

const ClientPage = (props) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const routerParams = useParams()
    // const {query} = router;
    const query = useSearchParams()
    const [openDrawer, setOpenDrawer] = useState(false);
    const {isMobile} = useSelector(state => state.system)
    const {openMobileDrawer, openSidebar} = useSelector(state => state.fileSpace)
    const {token} = theme.useToken();

    // const {fileCategories} = useSelector(state => state.fileSpace)
    const [isServer, setServer] = useState(true)

    useEffect(() => {
        if (isServer) {
            console.log('props=server=', props)
            // 将服务端获取的数据设置到客户端redux中
            dispatch(setDataFromServer({
                // fileCategories: props.fileCategories,
                files: props.files
            }))
            setServer(false)

            // 如果没有选择分类，则默认选中
            // if (!query.get('cid') && !query.get('vid') && props.fileCategories.length > 0) {
            //     const fc = props.fileCategories.filter(item => item.pid === '0')
            //     // router.replace(`/fileSpace?cid=${fc[0].id}&t=${Date.now()}`)
            //     shallowUpdateRouterParams(`cid=${fc[0].id}`)
            // }
        }
    }, [])

    return <div className={'w-full h-[100vh] overflow-hidden'}>
        <div className={'flex flex-row h-full'}>
            <div
                className={classNames({
                    'flex-col w-[260px] shrink-0 border-r border-[#e5e5e5] dark:border-[#474747] h-full': true,
                    'hidden': !openSidebar,
                    'md:flex': openSidebar
                })}>
                <FileSidebar/>
                {/*<FileCategory rounded/>*/}
                {/*<UserHeader userInfo={props.userInfo}/>*/}
            </div>
            <div className={classNames({
                'flex-1 z-20 h-[100vh]': true,
                'w-full': !openSidebar,
                'md:w-[calc(100vw-320px)]': openSidebar
            })}>
                <FileList userInfo={props.userInfo}/>
            </div>
        </div>
        {
            openMobileDrawer ? <Drawer styles={{
                body: {
                    padding: '0',
                },
            }} title="" closable={false} width={320} placement="left"
                                       onClose={() => dispatch(setOpenMobileDrawer(false))} open={openMobileDrawer}>
                <div className={'w-[320px] flex flex-col'}>
                    <FileSidebar isDrawer/>
                    {/*<FileCategory isDrawer onClickFileCategory={() => {*/}
                    {/*    dispatch(setOpenMobileDrawer(false))*/}
                    {/*}}/>*/}
                </div>
            </Drawer> : null
        }
    </div>
}

export default ClientPage;
