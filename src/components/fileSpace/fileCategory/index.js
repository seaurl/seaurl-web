'use client'
import {
    CaretRightOutlined,
    CloseOutlined,
    EditOutlined,
    FormOutlined,
    LeftOutlined,
    PlusOutlined,
    FolderOutlined,
    ReloadOutlined, CaretDownOutlined, TeamOutlined, UsergroupAddOutlined
} from "@ant-design/icons";
import React, {useCallback, useEffect, useState} from "react";
import {Button, Empty, message, Space, Modal, Progress, Input, Segmented} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {useRouter, useParams, usePathname, useSearchParams} from "next/navigation";
import {
    queryFileCategory,
    deleteFileCategory,
    setFileCategoryTop
} from "@/lib/slices/fileSpaceSlice";
import InnerCategory from "./innerCategory";
import FileCategoryDlg from "../../dialog/fileCategoryDlg";
import MenuAction from "@/components/menuAction";

import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import classNames from "classnames/bind";

const {confirm} = Modal;

const FileCategory = ({onClickFileCategory, isDrawer, rounded}) => {
    const [dlg, setDlg] = useState({
        action: '',
        title: '',
        show: false,
        loading: false
    })
    const dispatch = useDispatch();
    const router = useRouter();
    // const {query} = router;
    const routerParams = useParams()
    const query = useSearchParams()
    const {fileCategories, files, myFileSize} = useSelector(state => state.fileSpace)


    // useEffect(() => {
    //     // 当文件列表变化的时候重新计算下用户总用量
    //     dispatch(getSumFileSize()).then(res => {
    //         getSizePercent()
    //     })
    //
    // }, [files])


    // 点击添加按钮
    function btnAdd() {
        setDlg({
            title: '添加文件分类',
            action: 'add',
            show: true,
            loading: false
        })
    }

    function btnEdit() {
        const cid = query.get('cid')

        if (cid) {
            const fs = fileCategories.filter(f => f.id === cid)
            if (fs.length > 0) {
                setDlg({
                    title: '编辑笔记分类',
                    action: 'edit',
                    show: true,
                    loading: false,
                    id: cid,
                    input: fs[0].name
                })
            }

        } else {
            message.warning('请先选择文件分类');
        }
    }

    async function btnDelete() {
        const cid = query.get('cid')
        const vid = query.get('vid')
        if (cid) {
            const fs = fileCategories.filter(f => f.id === cid)
            if (fs.length > 0) {
                confirm({
                    title: `您确定要删除[${fs[0].name}]？`,
                    okText: '确定',
                    cancelText: '取消',
                    onOk: async () => {
                        const res = await dispatch(deleteFileCategory({
                            id: cid
                        }));
                        if (res.payload.status === 0) {
                            message.success('删除成功');

                            const res = await dispatch(queryFileCategory())
                            console.log('queryFileCategory res=', res)
                            if (res?.payload?.status === 0 && res?.payload?.data?.length > 0) {

                                // 查询pid=0的所有分类，也就是一级分类
                                let result = []
                                let params = []
                                if (vid) {
                                    params.push(`vid=${vid}`)
                                    // 如果有vid说明进入了子分类，这时候，再判断子分类是否有数据，如果有，则设置cid为子分类第1条数据，否则不设置cid
                                    result = res?.payload?.data?.filter(item => item.pid === vid)
                                    if (result.length > 0) {
                                        params.push(`cid=${result[0].id}`)
                                    }
                                } else {
                                    result = res?.payload?.data?.filter(item => item.pid === '0')
                                    params.push('cid=' + result[0].id)
                                }


                                if (params.length > 0) {
                                    // router.replace(`/fileSpace?${params.join('&')}`)
                                    shallowUpdateRouterParams(params.join('&'))
                                } else {
                                    // router.replace(`/fileSpace`)
                                    shallowUpdateRouterParams("")
                                }
                            } else {
                                shallowUpdateRouterParams("")
                            }
                        } else {
                            message.warning(res.payload.message)
                        }
                    }
                });
            }
        } else {
            message.warning('请先选择文件分类');
        }

    }

    function btnRefresh() {
        dispatch(queryFileCategory())
    }

    //把字节转换成正常文件大小
    function byteConvert(bytes) {
        if (isNaN(bytes)) {
            return '';
        }
        const symbols = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        let exp = Math.floor(Math.log(bytes) / Math.log(2));
        if (exp < 1) {
            exp = 0;
        }
        const i = Math.floor(exp / 10);
        bytes = bytes / Math.pow(2, 10 * i);

        if (bytes.toString().length > bytes.toFixed(2).toString().length) {
            bytes = bytes.toFixed(2);
        }
        return bytes + ' ' + symbols[i];
    }

    function getSizePercent() {
        console.log('total sum', myFileSize)
        const myFileSizeGb = myFileSize / 1024 / 1024 / 1024
        const r = 100 * myFileSizeGb / 5
        return r
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

    // 回到上级
    async function back() {
        let cid = query.get('cid')
        let vid = query.get('vid')
        let nid = query.get('nid')
        let type = query.get('type')
        let username = routerParams?.username
        let params = []

        if (cid) {
            params.push(`cid=${cid}`)
        }
        if (nid) {
            params.push(`nid=${nid}`)
        }
        if (type) {
            params.push(`type=${type}`)
        }
        if (vid) {
            // 根据出的id查询前置的节点
            const prevNode = fileCategories.filter(item => item.id === vid)
            if (prevNode.length > 0) {
                const pid = prevNode[0].pid
                if (pid !== '0') {
                    params.push(`vid=${pid}`)
                }
            }
        }
        if (params.length > 0) {
            // router.push(`/fileSpace?${params.join('&')}`)
            shallowUpdateRouterParams(params.join("&"))
        } else {
            // 如果参数为空，说明在第一级，就不需要带任何?a=b这样的参数了
            // router.push(`/fileSpace`)
            shallowUpdateRouterParams("")
        }
    }

    // 设置置顶或取消置顶
    async function btnTop() {
        // console.log('chooseFileCategory=', chooseFileCategory)

        const cid = query.get('cid')

        if (cid) {
            const fs = fileCategories.filter(f => f.id === cid)
            if (fs.length > 0) {
                const res = await dispatch(setFileCategoryTop({
                    cid: cid,
                    isTop: !fs[0].isTop
                }))
                console.log('setUrlCategoryTop res=', res)
                if (res.payload.data) {
                    dispatch(queryFileCategory())
                }
            }
        } else {
            message.warning('请先选择文件分类');
        }
    }

    function renderMenus() {
        const cid = query.get('cid')
        let res = null
        if (cid) {
            const fs = fileCategories.filter(f => f.id === cid)
            if (fs.length > 0) {
                res = fs[0]
            }
        }
        return <MenuAction data={res} top={btnTop} add={btnAdd} edit={btnEdit} delete={btnDelete}
                           refresh={btnRefresh}
                           action={['add', 'edit', 'delete', 'top', 'refresh']}>
            <Space size={4}>
                <PlusOutlined/>
                <CaretDownOutlined/>
            </Space>
        </MenuAction>
    }

    return <div>
        <div className={classNames({
            'bg-[#e9e8f0] dark:bg-[#141414] dark:border-r dark:border-[#474747]': true,
            'rounded-ss-2xl dark:rounded-ss-none': !!rounded
        })}>
            <div
                className={'w-full h-[60px] pr-[8px] pl-[12px] inline-flex items-center justify-between '}>
                {query.get('vid') ? <div className={''} onClick={() => {
                    back()
                }}>
                    <div className={'text-xs text-[#666] font-medium flex items-center'}>
                        <LeftOutlined className={'cursor-pointer'}/>
                        <div className={'font-medium pl-[8px] text-sm cursor-pointer'}>
                            {getTitle()}
                        </div>
                    </div>
                </div> : <div className={'font-medium cursor-pointer text-md'}>
                    <FolderOutlined className={'pr-[6px]'}/>文件分类
                </div>}
                <div className={'cursor-pointer'}>
                    {renderMenus()}
                </div>
            </div>

            <div className={'relative'}>
                <InnerCategory
                    isDrawer={isDrawer}
                    onClickFileCategory={onClickFileCategory}
                    onTop={btnTop}
                    onEdit={btnEdit}
                    onDelete={btnDelete}/>
            </div>
            <div className={'p-[12px] cursor-pointer hover:bg-[#D4CEF1] dark:hover:bg-[#2E333C]'}>
                <div className={'text-[#333] text-xs dark:text-white'}>
                    已用{myFileSize === 0 ? '0' : byteConvert(myFileSize)} / 5 GB
                </div>
                <Progress percent={getSizePercent()}
                          showInfo={false}
                          percentPosition={{
                              align: 'center',
                              type: 'outer',
                          }}
                          size="small"/>
            </div>
        </div>
        <FileCategoryDlg dlg={dlg}/>
    </div>
}

export default FileCategory
