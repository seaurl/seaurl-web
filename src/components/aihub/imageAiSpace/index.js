'use client'
import React, {useEffect, useMemo, useState, useRef, memo, useCallback, useLayoutEffect} from "react";
import {useDispatch, useSelector} from 'react-redux'

import {useRouter, useSearchParams} from "next/navigation";
import {
    EditOutlined,
    RetweetOutlined,
    SaveOutlined,
    AimOutlined,
    DownloadOutlined,
    UserAddOutlined, LoadingOutlined, DeleteOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import {Typography, Button, Input, Tabs, List, Flex, Tag, Space, Image, Tooltip, Spin, message, Modal} from "antd";
import Empty from "@/components/empty";
import Loading from "@/components/loading";
import {Virtuoso} from 'react-virtuoso'
import ControlPanel from "@/components/aihub/imageAiSpace/controlPanel";
import {queryImageList, resetPage, setDataFromServer, deleteImage} from "@/lib/slices/imageAiSpaceSlice";
import EmptyNote from '@/components/aihub/imageAiSpace/emptyNote'
import FileCreateForAiDlg from "@/components/dialog/fileCreateForAiDlg";
import {marked} from "marked";
import {queryUserAiTools, setCache, updateDt} from "@/lib/slices/aiSpaceSlice";

const {confirm} = Modal;

const ImageAiApace = (serverData) => {
    const router = useRouter();
    const dispatch = useDispatch();
    // const {query} = router;
    const query = useSearchParams()

    const virtuoso = useRef(null);
    const {
        imageList,
        loadingGenerateImage,
        loadingImageList,
        pagination,
        imageRatio,
        isFinished
    } = useSelector(state => state.imageAiSpace)
    const {cache} = useSelector(state => state.aiSpace)

    const dom = useRef(null)
    const isUpdate = useRef(false)

    // const [firstItemIndex, setFirstItemIndex] = useState(pagination.total)
    // const [isServer, setIsServer] = useState(true)
    const onlyOne = useRef(0)
    const [prompt, setPrompt] = useState('')

    const [dlg, setDlg] = useState({
        title: '',
        show: false
    })

    function globalUpdate() {
        if (!isUpdate.current) {
            const usedId = query.get('usedId')
            if (usedId) {
                // 更新时间并置顶
                dispatch(updateDt({
                    usedId
                }))
                dispatch(queryUserAiTools())
            }
            isUpdate.current = true
        }
    }


    useEffect(() => {
        if (virtuoso.current) {
            virtuoso.current.scrollToIndex({
                index: 0,
                align: 'start',
                behavior: 'auto'
            });
        }
        if (!cache.isImageAiRequest){
            dispatch(setCache({
                which: 'imageAi',
                value: true
            }))
            if (onlyOne.current === 0){
                dispatch(queryImageList())
                onlyOne.current = 1
            }
        }
    }, [])

    // useEffect(() => {
    //     if (loadingGenerateImage && virtuoso.current) {
    //         virtuoso.current.scrollToIndex({
    //             index: 0,
    //             align: 'start',
    //             behavior: 'auto'
    //         });
    //     }
    //
    // }, [loadingGenerateImage])


    async function initData() {
        await dispatch(resetPage())
        dispatch(setDataFromServer({
            imageList: serverData?.imageList
        }))
    }


    // const [users, setUsers] = useState(() => generateUsers(INITIAL_ITEM_COUNT, START_INDEX))

    const prependItems = useCallback(async () => {
        // console.log('-----prependItems---------')
        // console.log('-----, firstItemIndex---------', firstItemIndex)
        // const nextFirstItemIndex = 0
        //
        // console.log('nextFirstItemIndex ===', nextFirstItemIndex)
        // setFirstItemIndex(() => nextFirstItemIndex)
        //
        // console.log('-----, nextFirstItemIndex---------', nextFirstItemIndex)
        console.log('state.pagination', pagination)
        console.log('state.imageList', imageList)
        if (!isFinished) {
            dispatch(queryImageList())
        }

        return false
    }, [pagination])

    function getWidth(d) {
        if (d === '1024*1024') {
            return '300px'
        }
        if (d === '720*1280') {
            return '300px'
        }
        if (d === '1280*720') {
            return '300px'
        }
    }

    function getHeight(d) {
        if (d === '1024*1024') {
            return '300px'
        }
        if (d === '720*1280') {
            return `${300 * 1280 / 720}px`
        }
        if (d === '1280*720') {
            return `${300 * 720 / 1280}px`
        }
    }

    function gotoDownload(item) {
        if (item?.imageSrc) {
            fetch(item.imageSrc)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error fetching image: ${response.statusText}`);
                    }
                    return response.blob();
                })
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${item.prompt}.png` || 'image.jpg';
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    URL.revokeObjectURL(url); // 释放URL
                    document.body.removeChild(link);
                })
                .catch(error => {
                    console.error('Error downloading image:', error);
                });
        }
    }

    function gotoEdit(item) {
        if (item?.prompt) {
            setPrompt(item.prompt)
        }
    }

    function gotoSave(item) {
        if (item?.imageSrc) {
            setDlg({
                title: '保存到我的文件',
                show: true,
                // 使用marked把markdown格式转换成html格式供ckeditor富文本编辑器使用
                imageItem: item
            })
        }
    }

    async function gotoDelete(item) {
        if (item?.imageAiId) {
            confirm({
                title: `您确定要删除该图片？`,
                okText: '确定',
                cancelText: '取消',
                onOk: async () => {
                    const res = await dispatch(deleteImage({
                        imageAiId: item?.imageAiId
                    }))
                    console.log('delete image res =', res)
                    if (res.payload.status === 0 && res.payload.data) {
                        message.success("删除成功");
                        await dispatch(resetPage())
                        dispatch(queryImageList())
                    } else {
                        message.error("删除失败")
                    }
                }
            })

        }
    }


    function renderDelete(item) {
        return <Tooltip placement="top"
                        title={'删除图片'}
                        onClick={() => gotoDelete(item)}>
            <Button danger icon={<DeleteOutlined/>}></Button>
        </Tooltip>
    }


    return <div className={'flex items-start flex-row-reverse w-full'} style={{overflowAnchor: 'none'}} onClick={globalUpdate}>
        <div className={'w-full'} style={{overflowAnchor: 'none'}}>
            {
                loadingImageList && pagination.pageNum === 1 ?
                    <div className={'flex items-center justify-center w-full'}>
                        <Loading/>
                    </div> : imageList.length === 0 ? <EmptyNote/> : <Virtuoso
                        ref={virtuoso}
                        style={{height: 'calc(100vh - 60px)'}}
                        data={imageList}
                        endReached={prependItems}
                        context={{isFinished, loadingImageList}}
                        components={{
                            Footer: ({context: {loadingImageList, isFinished}}) => {
                                return <div className={'flex items-center justify-center w-full'}>
                                    {!isFinished && imageList.length > 0 && imageList[0].status === "2" ? <Loading/> : null}
                                </div>
                            }
                        }}
                        itemContent={(index, item) => {
                            return (
                                <div className={'px-[16px] py-[12px] flex items-start flex-row gap-[22px]'}>
                                    <div className={'hidden items-center flex-col lg:flex'}>
                                    <span className={'text-xl font-medium'}>
                                        {dayjs(item.createdDt).format('MM-DD')}
                                    </span>
                                        <span className={'text-sm'}>
                                        {dayjs(item.createdDt).format('HH:mm')}
                                    </span>
                                    </div>
                                    <div className={'relative'}>
                                        <div className={'text-base flex justify-between'}>
                                            {item.prompt}
                                            <span
                                                className={'inline-block lg:hidden pl-1 text-sm text-[#666]'}>{dayjs(item.createdDt).format('MM-DD HH:mm')}</span>
                                        </div>
                                        <div className={''}>
                                            <Tag color="magenta">文本生成图像</Tag>
                                            <Tag color="magenta">{item.ratio}</Tag>
                                        </div>
                                        <div className={'pt-[12px]'}
                                             style={{width: getWidth(item.ratio), height: getHeight(item.ratio)}}>
                                            {item.imageSrc ? <Image width={'100%'} src={item.imageSrc}/> :
                                                <div
                                                    className={'flex items-center justify-center bg-[#fafafa] dark:bg-[#1c2127] rounded-xl'}
                                                    style={{width: getWidth(imageRatio), height: getHeight(imageRatio)}}>
                                                    {imageList.length > 0 && imageList[0].status === "2" && index === 0 ?
                                                        <Loading/> :
                                                        <Empty title={'暂无图片'}/>}
                                                </div>
                                            }
                                        </div>
                                        {
                                            item?.imageSrc ? <div className={'pt-[18px] w-[300px]'}>
                                                <Flex gap="small" justify="center">
                                                    <Tooltip placement="top" title={'重新编辑'}>
                                                        <Button icon={<RetweetOutlined/>}
                                                                onClick={() => gotoEdit(item)}></Button>
                                                    </Tooltip>
                                                    <Tooltip placement="top" title={'下载图片'}>
                                                        <Button icon={<DownloadOutlined/>}
                                                                onClick={() => gotoDownload(item)}></Button>
                                                    </Tooltip>
                                                    <Tooltip placement="top" title={'保存到我的文件'}
                                                             onClick={() => gotoSave(item)}>
                                                        <Button icon={<SaveOutlined/>}></Button>
                                                    </Tooltip>
                                                    {renderDelete(item)}
                                                </Flex>
                                            </div> : null
                                        }
                                    </div>
                                </div>
                            )
                        }}
                    />
            }

        </div>
        <div className={'w-[460px] border-r border-[#e5eaee] dark:border-[#474747] hidden lg:block'}>
            <ControlPanel prompt={prompt}/>
        </div>
        <FileCreateForAiDlg dlg={dlg}/>
    </div>
}

export default ImageAiApace