'use client'
import {Button, Dropdown, theme, Tooltip} from "antd";
import {
    CloudUploadOutlined,
    EllipsisOutlined,
    ExclamationCircleFilled,
    LockOutlined,
    PlusOutlined,
    StarFilled
} from "@ant-design/icons";
import Empty from "@/components/empty";
import React, {useState} from "react";
import classNames from "classnames";
import dayjs from "dayjs";
import {useSelector} from "react-redux";
import {buildFaviconUrl} from "@/utils/favicon";

const ClientPage = () => {
    const [chooseType, setChooseType] = useState('all');
    const [list, setList] = useState([{
        name: '111',
        desc: '2222'
    },{
        name: '111',
        desc: '2222'
    },{
        name: '111',
        desc: '2222'
    },{
        name: '111',
        desc: '2222'
    },{
        name: '111',
        desc: '2222'
    },{
        name: '111',
        desc: '2222'
    },{
        name: '111',
        desc: '2222'
    },{
        name: '111',
        desc: '2222'
    },{
        name: '111',
        desc: '2222'
    },{
        name: '111',
        desc: '2222'
    },{
        name: '111',
        desc: '2222'
    }]);
    const {platFormTheme, isMobile} = useSelector(state => state.system)
    const [displayMode, setDisplayMode] = useState('app')
    const {token} = theme.useToken();


    function renderIcon(url) {
        let content = null;
        // if (url.url.startsWith('https')){
        if (url.favicon) {
            content = <img className={'w-[20px] h-[20px] inline-block shrink-0'} src={buildFaviconUrl(url)}/>
        } else {
            content = <span className={'flex items-center'}>sdf</span>
        }
        return <div
            style={{
                background: platFormTheme.background === 'dark'
                || (platFormTheme.background === 'system'
                    && window.matchMedia('(prefers-color-scheme: dark)').matches) ?
                    displayMode === 'list' ? '#1C2126' : '#141414' : 'linear-gradient(45deg, #dadada 0%, #fff 50%, #dadada 100%)'
            }}
            className={classNames({
                'bg-[#fafafa] dark:bg-[#333]  flex items-center justify-center rounded-full shrink-0': true,
                'w-[40px] h-[40px] min-w-[18px] min-h-[18px] bg-[#fafafa] dark:bg-[#1C2126] rounded-full shrink-0': displayMode === 'app',
                'w-[48px] h-[48px] bg-[#fafafa] dark:bg-[#1C2126] rounded-full shrink-0': displayMode === 'list',
                'w-[36px] h-[36px] bg-[#fafafa] dark:bg-[#1C2126] rounded-full shrink-0': displayMode === 'mini'
            })}>
            {
                content
            }

        </div>
    }

    return <div className={'flex flex-row w-full h-[100vh] bg-[#f3f4f7]'}>
        {/*<div className={'w-[250px] h-full flex-shrink-0 border-r border-[#ddd]'}>*/}
        {/*    <div className={'p-3 flex items-center justify-between border-b border-[#ddd]'}>*/}
        {/*        <div className={'font-medium'}>MCP分类</div>*/}
        {/*        <div><Button size={'small'} type="text" icon={<PlusOutlined/>}></Button></div>*/}
        {/*    </div>*/}
        {/*    <div>*/}
        {/*        <Empty/>*/}
        {/*    </div>*/}
        {/*</div>*/}
        <div className={'w-full'}>
            <div className={'p-3 w-full flex items-center justify-between border-b border-[#ddd] bg-white'}>
                <div className={'flex items-center gap-2'}>
                    <span className={'font-medium'}>
                    工具列表
                    </span>
                    {/*<Button size={'small'} type="text" icon={<CloudUploadOutlined />}></Button>*/}
                </div>
                <div></div>
            </div>
            <div className={'p-4 flex items-center gap-2'}>
                <span className={classNames({
                    'p-1 rounded-2xl w-[80px] flex items-center justify-center text-sm cursor-pointer': true,
                    'bg-[#D4CEF1]': chooseType === 'all',
                    'bg-[#eee': chooseType !== 'all',
                })} onClick={() => {
                    setChooseType('all')
                }}>全部</span>
                <span className={classNames({
                    'p-1 rounded-2xl w-[80px] flex items-center justify-center text-sm cursor-pointer': true,
                    'bg-[#D4CEF1]': chooseType === 'installed',
                    'bg-[#eee': chooseType !== 'all',
                })} onClick={() => {
                    setChooseType('installed')
                }}>已安装</span>
            </div>
            <div className={'px-4 w-full '}>
                <div className={'grid grid-cols-auto-300 auto-rows-max gap-[16px] '}>
                    {list.map((url, index) => {
                        return (
                            <div className={'items-stretch'} key={index}>
                                <div
                                    className={'relative dark:pl-0 rounded-xl outline-[#161616] dark:outline-0 h-full border hover:border-[#54458A] border-transparent shadow-md'}>
                                    <div className={'flex flex-row h-full'}>
                                        <div
                                            className={'w-full relative inline-flex items-start flex-col text-base gap-x-[6px] bg-[#fff] dark:bg-[#1C2126] dark:border-0 px-[16px] py-[12px] rounded-xl'}>
                                            <div className={'flex items-center gap-x-3 w-full mb-3 min-h-[45px]'}>
                                                {renderIcon(url)}
                                                <div className={'w-[calc(100%-32px)]'}>
                                                    <div
                                                        className={'w-full truncate text-base cursor-pointer text-[#606060]'}>
                                                        <div
                                                            className={`text-base font-normal text-[#333] dark:text-[#8d96a0] cursor-pointer`}
                                                            onClick={() => {

                                                            }}>
                                                            <div className={'inline-flex items-center gap-1'}>
                                                                www.baidu.com
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                 style={{
                                                     color: platFormTheme.background === 'dark'
                                                     || (platFormTheme.background === 'system'
                                                         && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#fff' : token.colorPrimary
                                                 }}
                                                 className={'w-full cursor-pointer text-base pl-[2px] mb-3 text-[#000] dark:text-[#fff] leading-7 line-clamp-2 min-h-[56px]'}
                                                 onClick={() => {
                                                     window.open(url.url)
                                                 }}>
                                                这是一段描述
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
                {/*<Empty/>*/}
            </div>
        </div>
    </div>
}

export default ClientPage
