'use client'
import {Select, ColorPicker, Radio, Space} from 'antd'
import {SunOutlined, MoonOutlined, DesktopOutlined, SearchOutlined} from '@ant-design/icons';
import {useEffect, useState} from "react";
import {updateAccountAppearance} from '@/lib/slices/settingSlice'
import {useAppDispatch, useAppSelector} from "@/lib/hooks";
import {useSession} from "next-auth/react"
import styles from './index.module.scss'
import {setPlatFormTheme} from "@/lib/slices/systemSlice";

const AccountAppearance = () => {
    const dispatch = useAppDispatch()
    const {accountInfo} = useAppSelector(state => state.auth)
    const {data: session, status, update} = useSession()

    // 触发：修改背景
    const onChangeBackground = async (e) => {
        console.log(`onChangeBackground selected`, e.target.value);
        if (e.target.value === 'light') {
            localStorage.setItem('theme.background', 'light')
            document.documentElement.classList.remove('dark')
        }
        if (e.target.value === 'dark') {
            localStorage.setItem('theme.background', 'dark')
            document.documentElement.classList.add('dark')
        }
        if (e.target.value === 'system') {
            localStorage.setItem('theme.background', 'system')
            // 如果选择了选择了system，则手动匹配系统并变化一次
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        }
        // 当背景变化时调用
        // setTheme()
        dispatch(setPlatFormTheme({
            background: e.target.value
        }))
        await dispatch(updateAccountAppearance({
            background: e.target.value
        }))
    };

    // 触发：修改主题色
    async function onChangeColor(e) {
        console.log(`onChangeColor color`, e);
        if (e.target.value) {
            localStorage.setItem('theme.color', e.target.value)
            dispatch(setPlatFormTheme({
                color: e.target.value
            }))
            // 当主题色变化时调用
            // setTheme()
            await dispatch(updateAccountAppearance({
                color: e.target.value
            }))
        }
    }

    return <div className={'flex flex-col gap-3'}>
        <div className={'flex items-center'}>
            <span className={'w-[100px]'}>背景：</span>
            {
                accountInfo ?
                    <Radio.Group onChange={onChangeBackground}
                                 defaultValue={accountInfo?.background ? accountInfo?.background : platFormTheme.background === 'dark'
                                 || (platFormTheme.background === 'system'
                                     && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'}
                                 buttonStyle="solid">
                        <div className={'hidden lg:block'}>
                            <Space direction="horizontal">
                                <Radio.Button value="light">
                                    <div className={'flex gap-1'}><MoonOutlined/>浅色</div>
                                </Radio.Button>
                                <Radio.Button value="dark">
                                    <div className={'flex gap-1'}><SunOutlined/>深色</div>
                                </Radio.Button>
                                <Radio.Button value="system">
                                    <div className={'flex gap-1'}><DesktopOutlined/>跟随系统</div>
                                </Radio.Button>
                            </Space>
                        </div>
                        <div className={'block lg:hidden'}>
                            <Space direction="vertical">
                                <Radio.Button value="light">
                                    <div className={'flex gap-1'}><MoonOutlined/>浅色</div>
                                </Radio.Button>
                                <Radio.Button value="dark">
                                    <div className={'flex gap-1'}><SunOutlined/>深色</div>
                                </Radio.Button>
                                <Radio.Button value="system">
                                    <div className={'flex gap-1'}><DesktopOutlined/>跟随系统</div>
                                </Radio.Button>
                            </Space>
                        </div>

                    </Radio.Group> : null
            }

        </div>
        <div className={'flex items-center'}>
            <span className={'w-[100px]'}>强调色:</span>
            <div>
                {
                    accountInfo ? <Radio.Group onChange={onChangeColor}
                                               defaultValue={accountInfo?.color ? accountInfo?.color : '#54458A'}>
                        <Radio value={'#54458A'} className={styles.primary}></Radio>
                        <Radio value={'#007AFF'} className={styles.blue}></Radio>
                        <Radio value={'#A550A7'} className={styles.purple}></Radio>
                        <Radio value={'#F74F9E'} className={styles.pink}></Radio>
                        <Radio value={'#FF5257'} className={styles.red}></Radio>
                        <Radio value={'#F7821B'} className={styles.orange}></Radio>
                        <Radio value={'#FFC600'} className={styles.yellow}></Radio>
                        <Radio value={'#62BA46'} className={styles.green}></Radio>
                        <Radio value={'#8C8C8C'} className={styles.gray}></Radio>
                        <Radio value={'#000'} className={styles.black}></Radio>
                    </Radio.Group> : null
                }
            </div>
        </div>
    </div>
}

export default AccountAppearance