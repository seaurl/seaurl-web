'use client'
import {useEffect, useState} from 'react'
import {Tabs, Input, Row, Col, Menu, Button, Anchor} from 'antd';
import {
    WeiboOutlined, MailOutlined, ShoppingCartOutlined, LineChartOutlined,
    DesktopOutlined, CarOutlined, CustomerServiceOutlined, CommentOutlined, VideoCameraOutlined,
    SolutionOutlined, HomeOutlined, SendOutlined, ManOutlined, TranslationOutlined, CloudServerOutlined
} from '@ant-design/icons';
import styles from './index.module.scss'
import classNames from "classnames/bind";
let cx = classNames.bind(styles);

const SubPage = ({urls}) => {

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, [])

    function renderTabs() {
        const anchorList = urls.map(item => {
            if (item.group === "shopping") {
                return {
                    key: item.id,
                    href: `#${item.group}`,
                    title: <div className={'pt-[12px] pb-[12px] flex items-center justify-center gap-2'}>
                        <ShoppingCartOutlined className={'text-[18px]'}/>
                        <span>
                            {item.groupName}
                        </span>
                    </div>,
                }
            }
            if (item.group === "news") {
                return {
                    key: item.id,
                    href: `#${item.group}`,
                    title: <div className={'pt-[12px] pb-[12px] flex items-center justify-center gap-2'}>
                        <WeiboOutlined className={'text-[18px]'}/>
                        {item.groupName}
                    </div>,
                }
            }
            if (item.group === "finance") {
                return {
                    key: item.id,
                    href: `#${item.group}`,
                    title: <div className={'pt-[12px] pb-[12px] flex items-center justify-center gap-2'}>
                        <LineChartOutlined className={'text-[18px]'}/>
                        {item.groupName}
                    </div>,
                }
            }
            if (item.group === "technology") {
                return {
                    key: item.id,
                    href: `#${item.group}`,
                    title: <div className={'pt-[12px] pb-[12px] flex items-center justify-center gap-2'}>
                        <DesktopOutlined className={'text-[18px]'}/>
                        {item.groupName}
                    </div>,
                }
            }
            if (item.group === "car") {
                return {
                    key: item.id,
                    href: `#${item.group}`,
                    title: <div className={'pt-[12px] pb-[12px] flex items-center justify-center gap-2'}>
                        <CarOutlined className={'text-[18px]'}/>
                        {item.groupName}
                    </div>,
                }
            }
            if (item.group === "email") {
                return {
                    key: item.id,
                    href: `#${item.group}`,
                    title: <div className={'pt-[12px] pb-[12px] flex items-center justify-center gap-2'}>
                        <MailOutlined className={'text-[18px]'}/>
                        {item.groupName}
                    </div>,
                }
            }
            if (item.group === "music") {
                return {
                    key: item.id,
                    href: `#${item.group}`,
                    title: <div className={'pt-[12px] pb-[12px] flex items-center justify-center gap-2'}>
                        <CustomerServiceOutlined className={'text-[18px]'}/>
                        {item.groupName}
                    </div>,
                }
            }
            if (item.group === "sociality") {
                return {
                    key: item.id,
                    href: `#${item.group}`,
                    title: <div className={'pt-[12px] pb-[12px] flex items-center justify-center gap-2'}>
                        <CommentOutlined className={'text-[18px]'}/>
                        {item.groupName}
                    </div>,
                }
            }
            if (item.group === "videolive") {
                return {
                    key: item.id,
                    href: `#${item.group}`,
                    title: <div className={'pt-[12px] pb-[12px] flex items-center justify-center gap-2'}>
                        <VideoCameraOutlined className={'text-[18px]'}/>
                        {item.groupName}
                    </div>,
                }
            }
            if (item.group === "recruitment") {
                return {
                    key: item.id,
                    href: `#${item.group}`,
                    title: <div className={'pt-[12px] pb-[12px] flex items-center justify-center gap-2'}>
                        <SolutionOutlined className={'text-[18px]'}/>
                        {item.groupName}
                    </div>,
                }
            }
            if (item.group === "house") {
                return {
                    key: item.id,
                    href: `#${item.group}`,
                    title: <div className={'pt-[12px] pb-[12px] flex items-center justify-center gap-2'}>
                        <HomeOutlined className={'text-[18px]'}/>
                        {item.groupName}
                    </div>,
                }
            }
            if (item.group === "travel") {
                return {
                    key: item.id,
                    href: `#${item.group}`,
                    title: <div className={'pt-[12px] pb-[12px] flex items-center justify-center gap-2'}>
                        <SendOutlined className={'text-[18px]'}/>
                        {item.groupName}
                    </div>,
                }
            }
            if (item.group === "it") {
                return {
                    key: item.id,
                    href: `#${item.group}`,
                    title: <div className={'pt-[12px] pb-[12px] flex items-center justify-center gap-2'}>
                        <ManOutlined className={'text-[18px]'}/>
                        {item.groupName}
                    </div>,
                }
            }
            if (item.group === "dictional") {
                return {
                    key: item.id,
                    href: `#${item.group}`,
                    title: <div className={'pt-[12px] pb-[12px] flex items-center justify-center gap-2'}>
                        <TranslationOutlined className={'text-[18px]'}/>
                        {item.groupName}
                    </div>,
                }
            }
            if (item.group === "cloud") {
                return {
                    key: item.id,
                    href: `#${item.group}`,
                    title: <div className={'pt-[12px] pb-[12px] flex items-center justify-center gap-2'}>
                        <CloudServerOutlined className={'text-[18px]'}/>
                        {item.groupName}
                    </div>,
                }
            } else {
                return {
                    key: item.id,
                    href: `#${item.group}`,
                    title: <div className={'pt-[12px] pb-[12px] flex items-center justify-center gap-2'}>
                        {item.groupName}
                    </div>,
                }
            }

        })
        return <Anchor
            offsetTop={0}
            targetOffset={66}
            direction="horizontal"
            // getCurrentAnchor={(activeLink)=>{
            //   return
            // }}
            className={'dark:bg-[#1C2127] dark:text-white w-full'}
            items={anchorList}
        />
    }

    function renderUrls() {
        const result = urls.map((item, index) => {
            return <div className='dark:bg-[#1C2127] dark:text-white bg-white mb-[20px] rounded-xl dark:border-[1px] dark:border-[#474747] dark:border-solid' key={index}>
                <div id={item.group} className={'px-6 py-3 border-solid border-[#ddd] border-b-[1px] font-medium dark:border-[#474747]'}>{item.groupName}</div>
                <div className={'grid grid-cols-auto-250 auto-rows-max gap-y-[42px] gap-x-[24px] items-center p-6'}>
                    {
                        item.commonUrlsList.map((url, index2) => {
                            return <div key={index2} className={'flex items-center gap-4'} onClick={() => {
                                window.open(url.url)
                            }}>
                                <div className={'cursor-pointer'}>
                                    <img src={url.icon} className={'w-[32px] h-[32px] rounded-md'}/>
                                </div>
                                <div className={'cursor-pointer hover:underline'}>
                                    <span className={'font-medium'}>{url.name}</span>
                                    {/*<span className={styles.desc} title={url.description}>{url.description}</span>*/}
                                </div>
                            </div>
                        })
                    }
                </div>
            </div>
        })

        return <div className={'w-full'}>
            {result}
        </div>
    }

    return <div className={'w-full h-full overflow-y-auto px-[16px] py-[12px]'}>
        <div className={'max-w-[900px] mx-auto'}>
        <div className={'sticky top-0 z-10 bg-white dark:bg-[#141414] pb-2'}>
            {renderTabs()}
        </div>
        {renderUrls()}
        </div>
    </div>
}
export default SubPage;
