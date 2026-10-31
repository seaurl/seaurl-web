'use client'
import {Button, Dropdown, message, Modal, Tag} from "antd";
import {useDispatch, useSelector} from "react-redux";
import Empty from "@/components/empty";
import React, {useEffect, useState} from "react";
import classNames from "classnames/bind";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import {router} from "next/client";
import {useRouter} from "next/navigation";
import Sidebar from "@/components/aiSpace/aiTools/sidebar";
import {deleteAiRole, queryAiTools, queryUsedId, setDataFromServerForAiTools} from '@/lib/slices/aiSpaceSlice'
import {CheckOutlined, CloseOutlined, EditOutlined, PlusOutlined, SearchOutlined} from "@ant-design/icons";
import RoleAddDlg from "@/components/dialog/chatAiDlg/roleAddDlg";

const {confirm} = Modal;

const ClientPage = (props) => {
    const [isServer, setServer] = useState(true)
    const {platFormTheme} = useSelector(state => state.system)

    const router = useRouter()
    const dispatch = useDispatch()
    const {chooseAiTool} = useSelector(state => state.aiSpace)
    const [roleDlg, setRoleDlg] = useState({
        title: '',
        show: false
    })
    useEffect(() => {
        if (isServer) {
            setServer(false)
            console.log('---props.data---', props.data)
            // 1. 创建Map存储A节点（id作为键）
            const nodeMap = new Map();

            // 初始化A节点，添加aiTools属性
            props.data.aiToolsGroup.forEach(item => {
                nodeMap.set(item.id, {...item, aiTools: []});
            });

            // 2. 遍历B，将元素添加到对应A节点的aiTools中
            props.data.aiTools.forEach(item => {
                const parentNode = nodeMap.get(item.groupId);
                if (parentNode) {
                    parentNode.aiTools.push({...item, aiToolId: item.id}); // 浅拷贝避免污染原数据
                }
                // 可选：处理无匹配A的B元素（此处忽略）
            });

            // 3. 返回所有A节点组成的数组（森林）
            console.log('-----------------Array.from(nodeMap.values())---------', Array.from(nodeMap.values()))
            dispatch(setDataFromServerForAiTools({
                aiToolsList: Array.from(nodeMap.values())
            }))
        }
    }, [])

    async function gotoUsed() {
        console.log('chooseditool=', chooseAiTool)
        if (chooseAiTool.aiToolId) {
            const res = await dispatch(queryUsedId({
                aiToolId: chooseAiTool.aiToolId
            }))
            console.log('gotoUsed res = ', res)
            if (res.payload.status === 0) {
                router.push(`/aiSpace/aiUsed?usedId=${res.payload?.data}`)
            }
        }
    }

    return <div className={'flex w-full h-[100vh] overflow-y-auto'}>
        <div
            className={' flex-col w-[360px] border-r border-[#e5eaee] dark:border-[#474747] overflow-y-auto h-[100vh] hidden xl:flex shrink-0'}>
            <Sidebar/>
        </div>
        <div className={'w-full py-4 lg:pt-12 px-[16px] h-[100vh] overflow-y-auto bg-[#f3f4f7]'}>
            <div className={'flex flex-col max-w-screen-sm  mx-auto w-full rounded-xl overflow-hidden shadow-xl'}>
                {
                    chooseAiTool ? <>
                        <div className={classNames({
                            'h-[70px] lg:h-[100px] flex items-end justify-center dark:bg-[#2E3748]': true
                        })} style={{
                            background: platFormTheme.background === 'dark'
                            || (platFormTheme.background === 'system'
                                && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '' : chooseAiTool?.background
                        }}></div>
                        <div
                            className={'flex flex-col bg-[#fff] dark:bg-[#1C2126] px-4 lg:px-10 pb-12 rounded-bl-xl rounded-br-xl '}>
                            <div className={'flex items-center justify-between py-4'}>
                                <div className={'mt-0 lg:mt-[-60px] flex items-start gap-4'}>
                                    <div
                                        className={' rounded-full bg-white w-[60px] h-[60px] lg:w-[120px] lg:h-[120px] flex items-center justify-center shadow'}>
                                        <img src={chooseAiTool?.avatar}
                                             className={'w-[50px] h-[50px] lg:w-[110px] lg:h-[110px] rounded-full'}/>
                                    </div>
                                    <div
                                        className={'flex flex-col lg:flex-row items-start lg:items-center gap-4 text-base lg:text-2xl font-bold lg:text-[#fff] pt-1 text-nowrap'}>
                                        <span>{chooseAiTool?.name}</span>
                                        {/*<Tag color="magenta">限时免费</Tag>*/}
                                        <div className={'lg:hidden block'}>
                                            <Button type={'primary'} shape="round" size={'middle'}
                                                    onClick={gotoUsed}>现在使用</Button>
                                        </div>
                                    </div>
                                </div>
                                <div className={'lg:flex hidden  flex-row items-center gap-4'}>

                                    {
                                        chooseAiTool.uid ? <Dropdown menu={{
                                            onClick: (d) => {
                                                if (d.key === 'edit') {
                                                    setRoleDlg({
                                                        action: 'edit',
                                                        title: '编辑角色',
                                                        show: true,
                                                        groupId: chooseAiTool.groupId,
                                                        data: chooseAiTool
                                                    })
                                                }
                                                if (d.key === 'delete') {
                                                    confirm({
                                                        title: `您确定要删除？`,
                                                        okText: '确定',
                                                        cancelText: '取消',
                                                        onOk: async () => {
                                                            const res = await dispatch(deleteAiRole({
                                                                id: chooseAiTool.id
                                                            }))
                                                            if (res.payload.status === 0 && res.payload.data) {
                                                                message.success('删除成功');
                                                                dispatch(queryAiTools())
                                                            } else {
                                                                message.warning("删除失败");
                                                            }
                                                        }
                                                    });
                                                }
                                            },
                                            items: [{
                                                key: 'edit',
                                                label: '编辑',
                                                icon: <EditOutlined/>
                                            }, {
                                                key: 'delete',
                                                label: '删除',
                                                icon: <CloseOutlined/>,
                                                danger: true,
                                            },]
                                        }} placement="bottom">
                                            <Button icon={<EditOutlined/>} shape={'circle'} size={'large'}
                                                    variant={'text'}></Button>
                                        </Dropdown> : null
                                    }
                                    <Button type={'primary'} shape="round" size={'large'}
                                            onClick={gotoUsed}>现在使用</Button>
                                </div>
                            </div>
                            <div className={'text-[#959598] dark:text-white text-sm lg:text-base'}>
                                {chooseAiTool?.desc}
                            </div>
                            {
                                chooseAiTool.command ? <>
                                    <div className={'py-4'}
                                         style={{color: platFormTheme?.color ?? '#54458a'}}>我是根据以下指令创建的
                                    </div>
                                    <div
                                        className={'p-4 bg-[#F3F4FF] text-[#959598] text-sm rounded-xl dark:text-white dark:bg-[#2e3748]'}>
                                        {chooseAiTool.command}
                                    </div>
                                </> : null
                            }
                        </div>
                    </> : <Empty/>
                }
            </div>
        </div>
        <RoleAddDlg dlg={roleDlg} ok={() => {
            setRoleDlg({
                ...roleDlg,
                ...{
                    show: false
                }
            })
            dispatch(queryAiTools())

        }}
                    close={() => {
                        setRoleDlg({
                            ...roleDlg,
                            ...{
                                show: false
                            }
                        })
                    }}/>
    </div>
}

export default ClientPage
