"use client";

import {AntdRegistry} from '@ant-design/nextjs-registry';
import {ConfigProvider, theme} from 'antd'
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
// import 'dayjs/locale/zh-cn';
import {useAppSelector} from "@/lib/hooks";
import {useEffect, useState} from "react";
import {updateAccountAppearance} from "@/lib/slices/settingSlice";
import {useDispatch, useSelector} from "react-redux";
import {useSession} from "next-auth/react"
import {setPlatFormTheme} from "@/lib/slices/systemSlice";
// dayjs.locale('zh-cn');

const relativeTime = require('dayjs/plugin/relativeTime')
const customParseFormat = require('dayjs/plugin/customParseFormat')
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter')
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore')

import 'dayjs/locale/zh-cn';
import updateLocale from 'dayjs/plugin/updateLocale'; // 引入插件

const utc = require('dayjs/plugin/utc')


dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(customParseFormat)
dayjs.locale('zh-cn') // 全局使用
dayjs.extend(updateLocale); // 使用插件
dayjs.extend(isSameOrAfter); // 使用插件
dayjs.extend(isSameOrBefore); // 使用插件

// 更新 locale 设置，将星期日设置为一周的第一天
dayjs.updateLocale('zh-cn', {
    weekStart: 0
});

export default function AntdProvider({children, serverSession}) {
    // const {data: session} = useSession()
    const {platFormTheme} = useSelector(state => state.system)

    // 修改 locale 设置，使星期日作为一周的第一天
    // 参考：https://day.js.org/docs/en/customization/customization
    const customLocale = {
        ...zhCN,
        locale: 'zh-cn'
    };

    const [globalTheme, setGlobalTheme] = useState({
        algorithm: theme.defaultAlgorithm,
        colorPrimary: '#54458a',
        itemBg: 'fff'
    })

    const dispatch = useDispatch()

    useEffect(() => {
        // 打开网站或者刷新时立即执行
        handleMediaQueryChange(null)
        // 监听系统颜色变化
        const mql = window.matchMedia('(prefers-color-scheme: dark)')
        if (mql.addListener) {
            mql.addListener(handleMediaQueryChange);
        } else {
            console.error('浏览器不支持addListener方法');
        }
        return () => {
            if (mql.removeListener) {
                mql.removeListener(handleMediaQueryChange);
            }
        }
    }, []);

    // 监听系统颜色变化
    const handleMediaQueryChange = event => {
        console.log(event?.matches ? '系统切换到深色模式' : '系统切换到浅色模式');
        const backgroundStorage = localStorage.getItem('theme.background')
        const colorStorage = localStorage.getItem('theme.color')
        // 判断是否是深色
        if (('theme.background' in localStorage)
            && (backgroundStorage === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches
                || backgroundStorage === 'dark')) {
            document.documentElement.classList.add('dark')
            dispatch(setPlatFormTheme({
                background: backgroundStorage
            }))
        } else {
            document.documentElement.classList.remove('dark')
            dispatch(setPlatFormTheme({
                color: colorStorage || '#54458A',
                background: 'light'
            }))
        }
    }

    useEffect(() => {
        // 监听主题是否变化，如果变化，就跟着变
        if (platFormTheme) {
            let obj = {
                colorPrimary: platFormTheme.color || '#54458a',
            }
            // 决断是否是深色
            if (platFormTheme.background === 'dark' || (platFormTheme.background === 'system'
                && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                obj.algorithm = theme.darkAlgorithm
                obj.itemBg = '#1f1f1f'
            } else {
                obj.algorithm = theme.defaultAlgorithm
                obj.itemBg = '#fff'
            }
            setGlobalTheme(obj)
        }
    }, [platFormTheme])

    return <AntdRegistry>
        <ConfigProvider locale={customLocale} theme={{
            //全局算法暗色主题色
            algorithm: !serverSession?.user ? theme.defaultAlgorithm : globalTheme?.algorithm || theme.defaultAlgorithm,
            // 全局主题色
            token: {
                colorPrimary: !serverSession?.user ? '#54458a' : globalTheme?.colorPrimary || '#54458a'
            },
            // 组件主题色
            components: {
                // List: {
                //     itemPadding: 0
                // },
                Tabs: {
                    horizontalMargin: '0',
                    itemSelectedColor: platFormTheme.background === 'dark' || (platFormTheme.background === 'system'
                        && window.matchMedia('(prefers-color-scheme: dark)').matches) ?'#fff':globalTheme?.colorPrimary
                },
                Collapse: {
                    headerPadding: '13px 16px',
                    contentPadding: 0
                },
                Table: {
                    headerBorderRadius: 0,
                    rowHoverBg: platFormTheme.background === 'dark' || (platFormTheme.background === 'system'
                        && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#2E333C' : '#f5f5f5',
                    rowSelectedBg: 'transparent',
                    rowSelectedHoverBg: platFormTheme.background === 'dark' || (platFormTheme.background === 'system'
                        && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#2E333C' : '#f5f5f5',
                    footerBg: '#fff',
                    headerBg: platFormTheme.background === 'dark' || (platFormTheme.background === 'system'
                        && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#141414' : '#fff',
                    // selectionColumnWidth: 60,
                    // cellPaddingInline: '0',
                    // borderColor: 'transparent',
                    headerSplitColor: 'transparent'
                },
                Menu: {
                    // 特殊情况特殊处理
                    itemBg: !serverSession?.user ? '#fff' : globalTheme?.itemBg || '#fff',
                    // subMenuItemBg: 'transparent',
                    // itemPaddingInline: 0,
                    // itemHeight: 36,
                    // itemMarginBlock: 2,
                    // itemSelectedBg: '#d4cef1',
                    // itemActiveBg: 'transparent',
                    // itemHoverBg: 'transparent',
                    // darkItemColor: myTheme === 'dark' ? darkTheme.primary : defaultTheme.primary
                },
                Anchor: {
                    colorPrimary: platFormTheme.background === 'dark' || (platFormTheme.background === 'system'
                        && window.matchMedia('(prefers-color-scheme: dark)').matches) ?'#fff':globalTheme?.colorPrimary
                }
            }
        }}>
            {children}
        </ConfigProvider>
    </AntdRegistry>
}