'use client'
import React, {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import classNames from "classnames/bind";
import {useDispatch, useSelector} from "react-redux";
import {queryAiTools, setAiTool} from '@/lib/slices/aiSpaceSlice'
import {Button} from "antd";
import {PlusOutlined, ArrowLeftOutlined} from "@ant-design/icons";
import RoleAddDlg from "@/components/dialog/chatAiDlg/roleAddDlg";

const Sidebar = (props) => {
    const {data: session} = useSession()
    const router = useRouter();
    const dispatch = useDispatch()

    const {chooseAiTool, aiToolsList} = useSelector(state => state.aiSpace)
    const [roleDlg, setRoleDlg] = useState({
        title: '',
        show: false
    })

    useEffect(() => {

    }, [])

    function onChooseTool(data) {
        if (props.onClickTool) {
            props.onClickTool()
        }
        dispatch(setAiTool({
            chooseAiTool: data
        }))
    }

    function onRoleClick(d) {
        console.log('onRoleClick=', d)
        setRoleDlg({
            action: 'add',
            title: '添加角色',
            show: true,
            groupId: d.id,
        })
    }

    function renderAiTools() {
        return aiToolsList.map((item, index) => {
            console.log('item.aiToolsInHeader=', item.aiTools)
            return <div key={index}>
                <div
                    className={'flex items-center justify-between text-md font-medium px-3 py-2 border-b border-[#EDEDF3] dark:border-[#474747] bg-transparent'}>
                    <span>{item.name}</span>
                    {
                        item.name === '角色' ? <div><Button icon={<PlusOutlined/>} onClick={() => {
                            onRoleClick(item)
                        }}>添加角色</Button></div> : null
                    }
                </div>
                {
                    item.aiTools.map((item2, index2) => {
                        return <div className={classNames({
                            'flex items-start flex-row gap-2 p-3 cursor-pointer hover:bg-[#eee] dark:hover:bg-[#2E333C]': true,
                            'bg-[#eee] dark:bg-[#2E333C]': item2.id === chooseAiTool?.aiToolId
                        })} key={index2} onClick={() => onChooseTool(item2)}>
                            <div
                                className={'flex items-center justify-center rounded-full shrink-0 w-[48px] h-[48px] shadow bg-white'}>
                                <img src={item2.avatar} className={'w-[42px] h-[42px] rounded-full'}/>
                            </div>
                            <div className={'flex flex-col truncate w-full'}>
                                <div className={'text-md font-medium'}>{item2.name}</div>
                                <span className={'text-sm truncate text-[#959598]'}>{item2.desc}</span>
                            </div>
                        </div>
                    })
                }
            </div>
        })
    }

    return <>
        <div className={'flex items-center gap-2 px-3 py-3 border-b border-[#EDEDF3] dark:border-[#474747]'}>
            <Button type="text" icon={<ArrowLeftOutlined />} size="small" onClick={() => props.routerPush('/aiSpace/aiUsed')}>返回</Button>
        </div>
        {renderAiTools()}
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
    </>
};

export default withRouter(Sidebar);
