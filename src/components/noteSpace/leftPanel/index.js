'use client'
import {
    CaretDownOutlined,
    CaretRightOutlined, ClockCircleOutlined,
    CloseOutlined,
    EditOutlined,
    FormOutlined, HistoryOutlined, LeftOutlined,
    PlusOutlined,
    ReloadOutlined, StarFilled, VerticalAlignTopOutlined
} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import {Button, Empty, message, Space, Modal} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {useRouter, useParams, usePathname, useSearchParams} from "next/navigation";
import NoteCategoryDlg from "@/components/dialog/noteCategoryDlg";
import {
    queryNoteCategory,
    getNoteListByCategoryId,
    deleteNoteCategory,
    clearCategory,
    setNoteCategoryTop
} from "@/lib/slices/noteSpaceSlice";
import InnerCategory from "./innerCategory";
import MenuAction from "@/components/menuAction";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import classNames from "classnames/bind";
import NoteCategories from "@/components/noteSpace/leftPanel/noteCategories";

const {confirm} = Modal;

const LeftPanel = ({userInfo, onClickCategory, isDrawer, rounded}) => {
    const [dlg, setDlg] = useState({
        action: '',
        title: '',
        show: false,
        loading: false
    })
    const dispatch = useDispatch();
    const router = useRouter();
    const routerParams = useParams()
    // const {query} = router;
    const query = useSearchParams()

    const {noteCategories,noteCount} = useSelector(state => state.noteSpace)

    // 点击添加按钮
    function btnAdd() {
        const cid = query.get('cid')
        setDlg({
            title: '添加笔记分类',
            action: 'add',
            show: true,
            id: cid || '',
            loading: false
        })
    }

    function btnEdit() {
        // setShowAction(!showAction)
        // dispatch(setShowSetting(!showAction))
        if (query.get('cid')) {
            const fs = noteCategories.filter(f => f.id === query.get('cid'))
            if (fs.length > 0) {
                setDlg({
                    title: '编辑笔记分类',
                    action: 'edit',
                    show: true,
                    loading: false,
                    id: fs[0].id,
                    input: fs[0].name
                })
                return
            }
        }
        message.warning('请先选择笔记分类');
    }

    async function btnDelete() {
        const cid = query.get('cid')
        const vid = query.get('vid')
        const nid = query.get('nid')

        if (cid) {
            if (nid) {
                return message.warning('请先删除笔记');
            }
            const fs = noteCategories.filter(f => f.id === cid)
            if (fs.length > 0) {
                confirm({
                    title: `您确定要删除[${fs[0].name}]？`,
                    okText: '确定',
                    cancelText: '取消',
                    onOk: async () => {
                        const res = await dispatch(deleteNoteCategory({
                            id: fs[0].id
                        }));
                        if (res.payload.status === 0) {
                            message.success('删除成功');

                            //否则 查询主分类列表
                            const res = await dispatch(queryNoteCategory())

                            console.log('delete res =', res)
                            if (res?.payload?.status === 0 && res?.payload?.data?.length > 0) {

                                // 查询pid=0的所有分类，也就是一级分类
                                let result = []
                                let params = []
                                if (vid) {
                                    params.push(`vid=${vid}`)
                                    // 如果有vid说明进入了子分类，这时候，再判断子分类是否有数据，如果有，则设置cid为子分类第1条数据，否则不设置cid,并且查询最近笔记列表
                                    result = res?.payload?.data?.filter(item => item.pid === vid)
                                    if (result.length > 0) {
                                        params.push(`cid=${result[0].id}`)
                                    }
                                } else {
                                    result = res?.payload?.data?.filter(item => item.pid === '0')
                                    params.push('cid=' + result[0].id)
                                }


                                if (params.length > 0) {
                                    // router.replace(`/noteSpace?${params.join('&')}`)
                                    shallowUpdateRouterParams(params.join('&'))
                                } else {
                                    // router.replace(`/noteSpace`)
                                    shallowUpdateRouterParams("")
                                }
                            }else{
                                shallowUpdateRouterParams("")
                            }
                        } else {
                            message.warning(res.payload.message)
                        }
                    }
                });
            }

        } else {
            message.warning('请先选择网址分类');
        }

    }

    function btnRefresh() {
        dispatch(queryNoteCategory())
    }


    // 回到上级
    async function back() {
        let cid = query.get('cid')
        let vid = query.get('vid')
        let nid = query.get('nid')
        let type = query.type
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
            const prevNode = noteCategories.filter(item => item.id === vid)
            if (prevNode.length > 0) {
                const pid = prevNode[0].pid
                if (pid !== '0') {
                    params.push(`vid=${pid}`)
                }
            }
        }
        if (params.length > 0) {
            // router.replace(`/noteSpace?${params.join('&')}`)
            shallowUpdateRouterParams(params.join('&'))
        } else {
            // 如果参数为空，说明在第一级，就不需要带任何?a=b这样的参数了
            // router.replace(`/noteSpace`)
            shallowUpdateRouterParams("")
        }
    }

    function getTitle() {
        if (query.get('vid')) {
            const result = noteCategories.filter(item => item.id === query.get('vid'))
            if (result.length > 0) {
                return result[0].name
            }
        }
        return ''
    }

    // 设置置顶或取消置顶
    async function btnTop() {
        if (query.get('cid')) {
            const fs = noteCategories.filter(f => f.id === query.get('cid'))

            const res = await dispatch(setNoteCategoryTop({
                cid: fs[0].id,
                isTop: !fs[0].isTop
            }))
            console.log('setUrlCategoryTop res=', res)
            if (res.payload.data) {
                dispatch(queryNoteCategory())
            }
        } else {
            message.warning('请先选择笔记分类');
        }
    }

    function renderMenus() {
        const fs = noteCategories.filter(f => f.id === query.get('cid'))
        return <MenuAction data={fs.length > 0 ? fs[0] : []}
                           add={btnAdd}
                           edit={btnEdit}
                           delete={btnDelete}
                           top={btnTop}
                           refresh={btnRefresh}
                           action={['add', 'edit', 'delete', 'top', 'refresh']}>
            <Space size={4}>
                <PlusOutlined/>
                <CaretDownOutlined/>
            </Space>
        </MenuAction>
    }

    function goto(type) {
        if (type){
            shallowUpdateRouterParams(`type=${type}`)
        }
    }

    return <div className={classNames({
        'h-full': true,
        'rounded-ss-2xl dark:rounded-ss-none': false
    })}>
        <div className={'grid grid-cols-2 grid-rows-1 gap-2 px-3 pt-3 pb-2'}>
            <div
                className={classNames({
                    'flex items-center justify-center gap-2 text-sm w-full p-3 rounded-lg cursor-pointer hover:bg-[#d4cef1] dark:hover:bg-[#1C2126] shadow': true,
                    'bg-[#d4cef1] dark:bg-[#1C2126]': query.get('type') === 'frequently',
                    'bg-[#fff] dark:bg-[#000]': query.get('type') !== 'frequently'
                })} onClick={() => goto('frequently')}>
                <ClockCircleOutlined/>
                常用({noteCount?.frequently > 60 ? 60 : noteCount?.frequently || 0})
            </div>
            <div
                className={classNames({
                    'flex items-center justify-center gap-2 text-sm w-full p-3 rounded-lg cursor-pointer hover:bg-[#d4cef1] dark:hover:bg-[#1C2126] shadow': true,
                    'bg-[#d4cef1] dark:bg-[#1C2126]': query.get('type') === 'favorite',
                    'bg-[#fff] dark:bg-[#000]': query.get('type') !== 'favorite'
                })} onClick={() => goto('favorite')}>
                <StarFilled/>
                收藏({noteCount?.favorite > 60 ? 60 : noteCount?.favorite || 0})
            </div>
        </div>
        <div
            className={'w-full py-1 pr-[8px] pl-[12px] inline-flex items-center justify-between '}>
            <div className={'font-medium text-sm'}>
                {/*<FormOutlined className={'pr-[6px]'}/>*/}
                笔记分类
            </div>
            <div className={'cursor-pointer'}>
                {renderMenus()}
            </div>
        </div>
        <div className={'relative pt-1'}>
            <NoteCategories isDrawer={isDrawer}
                            rounded={rounded}
                            onAdd={btnAdd}
                            onEdit={btnEdit}
                            onDelete={btnDelete}
                            onTop={btnTop}
                            onClickCategory={onClickCategory}/>
            {/*<InnerCategory*/}
            {/*    isDrawer={isDrawer}*/}
            {/*    onEdit={btnEdit}*/}
            {/*    onDelete={btnDelete}*/}
            {/*    onTop={btnTop}*/}
            {/*    onClickCategory={onClickCategory}/>*/}
        </div>
        <NoteCategoryDlg dlg={dlg}/>
    </div>
}

export default LeftPanel
