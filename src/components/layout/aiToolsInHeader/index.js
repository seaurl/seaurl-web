'use client'
import React, {useEffect, useState} from 'react';
import IconFont from "@/utils/iconFont";
import UrlAddDlg from '@/components/dialog/urlAddDlg'
import {Avatar, Button, Divider, Dropdown, theme, Tooltip} from "antd";
import {CaretDownOutlined, OpenAIOutlined} from "@ant-design/icons";
import {useDispatch, useSelector} from "react-redux";
import {withRouter} from "@/hoc/withRouter";
import {queryUserAiTools, setAiToolsWillChange, setUserAiTool} from "@/lib/slices/aiSpaceSlice";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";

const {useToken} = theme;

const AiToolsInHeader = ({routerPush}) => {
    const [showDlg, setShowDlg] = useState(false)
    const {userAiToolsList} = useSelector(state => state.system)
    const {chooseUserAiTool} = useSelector(state => state.aiSpace)

    const dispatch = useDispatch();
    const {token} = useToken();
    const contentStyle = {
        backgroundColor: token.colorBgElevated,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary
    };
    const menuStyle = {
        boxShadow: 'none',
        height: '600px',
        overflowY: 'auto',
    };
    // useEffect(() =>{
    //   getData()
    // }, [])
    //
    // function getData() {
    //   dispatch(queryUserAiTools())
    // }

    function getAiToolList() {
        if (userAiToolsList.length > 0) {
            let rs = userAiToolsList.map((item, index) => {
                if (item?.type === 'all') {
                    return {
                        key: 'all',
                        label: <div className={'w-full flex items-center justify-between py-1'}>
                            <span className={'font-medium text-base'} onClick={() => {

                            }}>最近使用</span>
                            <span className={'text-sm hover:underline'} onClick={() => {
                                routerPush(`/aiSpace/aiTools`)
                            }}>查看全部</span>
                        </div>
                    }
                } else {
                    return {
                        key: item?.usedId,
                        label: <div className={'w-[210px] py-2'}>{item?.name}</div>,
                        icon: <Avatar size={26} src={item?.avatar}/>
                    }
                }

            })
            rs.splice(1, 0, {type: 'divider'})
            // console.log('rss-',rs)
            return rs
        }
        return []
    }

    function onMenuClick(key, item, index) {
        if (key) {
            if (key === 'all') {
                // routerPush(`/aiSpace/aiTools`)
            } else {
                const fs = userAiToolsList.filter(f => f.usedId === key)
                // console.log('---fs----', fs)
                if (fs.length > 0) {
                    onChooseTool(fs[0])
                }
            }
        }
    }

    function onChooseTool(data) {
        // 判断是否是画流程图工具，是的话就拦截
        // 1、注意：这种拦截只在工具和工具间切换有用，如果你想在其它跳转也加这个拦截也是可行的，不过觉得不太优雅，后面如果用户反馈需要的话再加吧
        // 2、更新：只有组件间切换需要缓存，切换到其它页面一律清除工具中的缓存
        //注意：因为组件卸载的时候drawioRef=null，所以发送不了消息，也就获取不了drawio中的图形数据，所以才曲线解决
        if (chooseUserAiTool?.type === 'drawio') {
            // 调用redux保存cb，
            // 如果执行完成之后，就要调用cb来跳转工具页面了
            // 注意这里的a是拦截工具执行aiToolsWillChangeFunc时传递的function(){}
            // 注意：因为drawio使用的是iframe形式，并且发起请求和接收请求不是在一个方法中完成请求和接收，
            // 所以这里就出现了参数传递的复杂性，而其它的工具应该不会这么复杂
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
        dispatch(setUserAiTool({
            chooseUserAiTool: data
        }))
        routerPush(`/aiSpace/aiUsed?usedId=${data.usedId}`)
    }

    return <div>
        <div className='flex items-center h-[56px]'>
            <Tooltip title="工具" placement={'bottom'}>
                {userAiToolsList.length > 0 ? <Dropdown
                    placement={'bottom'}
                    trigger={['click']}
                    overlayStyle={{
                        paddingTop: '12px',
                        zIndex: 100
                    }}
                    dropdownRender={(menu) => (
                        <div style={contentStyle}>
                            {React.cloneElement(menu, {
                                style: menuStyle,
                            })}
                        </div>)}
                    menu={{
                        items: getAiToolList(),
                        onClick: (e) => {
                            onMenuClick(e.key)
                        },
                    }}>
                    <div className={'cursor-pointer px-0.5'}>
                        <OpenAIOutlined/>
                    </div>
                </Dropdown> : <OpenAIOutlined onClick={() => {
                    routerPush(`/aiSpace/aiUsed`)
                }}/>}
            </Tooltip>
        </div>
    </div>
}

export default withRouter(AiToolsInHeader);
