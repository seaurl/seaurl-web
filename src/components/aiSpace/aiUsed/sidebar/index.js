'use client'
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import classNames from "classnames/bind";
import {useDispatch, useSelector} from "react-redux";
import {queryUserAiTools, removeUserAiTool, setAiToolsWillChange, setUserAiTool} from '@/lib/slices/aiSpaceSlice'
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import {Button, Dropdown, message, Tooltip} from "antd";
import {CloseCircleOutlined, CloseOutlined, EllipsisOutlined, SearchOutlined, ShoppingOutlined} from "@ant-design/icons";
import Empty from "@/components/empty";
import {data} from "autoprefixer";
import MenuAction from "@/components/menuAction";

const Sidebar = (props) => {
    const {data: session} = useSession()
    const router = useRouter();
    const dispatch = useDispatch()
    const query = useSearchParams()

    const {chooseUserAiTool, userAiToolsList} = useSelector(state => state.aiSpace)

    function onChooseTool(data) {
        // 判断是否是画流程图工具，是的话就拦截
        // 1、注意：这种拦截只在工具和工具间切换有用，如果你想在其它跳转也加这个拦截也是可行的，不过觉得不太优雅，后面如果用户反馈需要的话再加吧
        // 2、更新：只有组件间切换需要缓存，切换到其它页面一律清除工具中的缓存
        if (chooseUserAiTool?.type === 'drawio') {
            // 调用redux保存cb，
            // 如果执行完成之后，就要调用cb来跳转工具页面了
            // 注意这里的a是拦截工具执行aiToolsWillChangeFunc时传递的function(){}
            // 注意：因为drawio使用的是iframe形式，并且发起请求和接收请求不是在一个方法中完成请求和接收，
            // 所以这里就出现了参数传递的复杂性，而其它的工具应该不会这么复杂
            // 注意：因为组件卸载的时候drawioRef=null，所以发送不了消息，也就获取不了drawio中的图形数据，所以才曲线解决
            dispatch(setAiToolsWillChange((exportDrawioXml) => {
                // exportDrawioXml就是从拦截的工具传递过来的参数，并且是function
                if (exportDrawioXml) {
                    // 如果存在a这个function则执行a，并且将跳转做为参数传递给具体的工具中
                    exportDrawioXml(() => startChangeTools(data))
                }
            }))
        } else {
            // 如果是其它的工具，则直接跳转
            dispatch(setAiToolsWillChange(null))
            startChangeTools(data)
        }
    }

    function startChangeTools(data) {
        if (props.onClickTool) {
            props.onClickTool()
        }

        dispatch(setUserAiTool({
            chooseUserAiTool: data
        }))

        shallowUpdateRouterParams('usedId=' + data.usedId)
    }

    async function onRemove(data) {
        console.log('data=', data)
        if (data.usedId) {
            const res = await dispatch(removeUserAiTool({
                usedId: data.usedId
            }))
            if (data.usedId === query.get('usedId')) {
                shallowUpdateRouterParams("")
            }
            if (res.payload.status === 0 && res.payload.data) {
                dispatch(queryUserAiTools())
            }
        }
    }

    function renderMenus(dom, item) {
        // const cid = query.get('usedId')
        // let res = null
        // if (cid) {
        //     const fs = chooseUserAiTool.filter(f => f.usedId === cid)
        //     if (fs.length > 0) {
        //         res = fs[0]
        //     }
        // }
        return <MenuAction data={item}
                           delete={() => {
                               onRemove(item)
                           }}
                           action={['delete']}>
            {dom}
        </MenuAction>
    }

    function renderAiTools() {
        return userAiToolsList.map((item, index) => {
            return <div className={classNames({
                'flex items-center flex-row gap-2 p-3 cursor-pointer hover:bg-[#eee] dark:hover:bg-[#2E333C]': true,
                'bg-[#eee] dark:bg-[#2E333C]': query.get('usedId') === item?.usedId
            })} key={index} onClick={() => onChooseTool(item)}>
                <div className={'flex items-center justify-between gap-2 w-full'}>
                    <div
                        className={'flex items-center justify-center rounded-full shrink-0 w-[32px] h-[32px] shadow bg-white'}>
                        <img src={item.avatar} className={'w-[24px] h-[24px] rounded-full'}/>
                    </div>
                    <div className={'flex flex-col truncate w-full'}>
                        <div className={'text-sm'}>{item.name}</div>
                        {/*<span className={'text-sm truncate text-[#959598]'}>{item.desc}</span>*/}
                    </div>
                </div>
                {
                    query.get('usedId') === item?.usedId ? renderMenus(<EllipsisOutlined />, item) : null
                }

                {/*{*/}
                {/*    query.get('usedId') === item.usedId ?*/}
                {/*        <div className={'flex items-center'}>*/}
                {/*            <Button shape="circle" icon={<CloseOutlined style={{fontSize: '12px'}}/>} size={'small'} onClick={(e) => {*/}
                {/*                e.stopPropagation(); // 阻止事件冒泡*/}
                {/*                onRemove(item)*/}
                {/*            }}></Button>*/}
                {/*        </div> : null*/}
                {/*}*/}
            </div>
        })
    }

    return <div className={'flex flex-col h-full'}>
        <div
            className={'flex items-center justify-between px-3 py-3 border-b border-[#EDEDF3] dark:border-[#474747] sticky top-0 bg-white dark:bg-[#141414]'}>
            <span className={'text-md font-medium'}>工具</span>
            <Tooltip title="工具商店" placement="bottom">
                <Button type="text" size="small" icon={<ShoppingOutlined />} onClick={() => props.routerPush('/aiSpace/aiTools')} />
            </Tooltip>
        </div>

        {userAiToolsList.length > 0 ? <div className={'h-full overflow-y-auto'}>
            {renderAiTools()}
        </div> : <div>
            <Empty/>
        </div>}
    </div>
};

export default withRouter(Sidebar);