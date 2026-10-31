'use client'
import React, {useEffect, useMemo, useState, useRef, memo, useCallback, useLayoutEffect} from "react";
import {CaretRightOutlined, RocketOutlined, AuditOutlined, TruckOutlined, SafetyCertificateOutlined, BankOutlined} from "@ant-design/icons";
import styles from './index.module.scss'
import classNames from "classnames/bind";
let cx = classNames.bind(styles);

const ClientPage = (props) => {
    const dataList = [  {
        groupName: '银行',
        icon: <BankOutlined className={''}/>,
        data: [{
            title: '中国银行',
            hotline: '95566'
        },
            {
                title: '工商银行',
                hotline: '95588'
            },
            {
                title: '建设银行',
                hotline: '95533'
            },
            {
                title: '交通银行',
                hotline: '95559'
            },
            {
                title: '农业银行',
                hotline: '95599'
            },
            {
                title: '招商银行',
                hotline: '95555'
            },
            {
                title: '平安银行',
                hotline: '95511'
            },
            {
                title: '民生银行',
                hotline: '95568'
            },
            {
                title: '兴业银行',
                hotline: '95561'
            },
            {
                title: '中信银行',
                hotline: '95558'
            },
            {
                title: '光大银行',
                hotline: '95595'
            },
            {
                title: '广发银行',
                hotline: '95508'
            },
            {
                title: '华夏银行',
                hotline: '95577'
            },
            {
                title: '浦发银行',
                hotline: '95528'
            },
            {
                title: '广发银行',
                hotline: '95508'
            },
            {
                title: '上海银行',
                hotline: '95594'
            },
            {
                title: '北京银行',
                hotline: '95526'
            },
            {
                title: '南京银行',
                hotline: '95502'
            }]
    },{
        groupName: '保险',
        icon: <SafetyCertificateOutlined className={''}/>,

        data: [{
                title: '平安保险',
                hotline: '95511'
            },
            {
                title: '人寿保险',
                hotline: '95519'
            },
            {
                title: '太平洋保险',
                hotline: '95500'
            },
            {
                title: '泰康人寿',
                hotline: '95522'
            },
            {
                title: '新华人寿',
                hotline: '95567'
            },
            {
                title: '太平保险',
                hotline: '95589'
            },
            {
                title: '大地保险',
                hotline: '95590'
            },
            {
                title: '安邦保险',
                hotline: '95569'
            },
            {
                title: '阳光保险',
                hotline: '95510'
            },
            {
                title: '信达保险',
                hotline: '95565'
            },
            {
                title: '华泰保险',
                hotline: '95509'
            },
            {
                title: '平安人寿',
                hotline: '95511'
            },
            {
                title: '平安养老',
                hotline: '95511'
            },
            {
                title: '国寿养老',
                hotline: '95519'
            },
            {
                title: '太平人寿',
                hotline: '95589'
            },
            {
                title: '太平养老',
                hotline: '95589'
            },
            {
                title: '阳光人寿',
                hotline: '95510'
            },
            {
                title: '友邦保险',
                hotline: '95522'
            }]
    },{
        groupName: '政府服务',
        icon: <AuditOutlined className={''}/>,
        data: [{
                title: '市民服务',
                hotline: '12345'
            },
            {
                title: '铁路中心',
                hotline: '12306'
            },
            {
                title: '消费者服务',
                hotline: '12315'
            },
            {
                title: '税务服务',
                hotline: '12366'
            },
            {
                title: '交通运输',
                hotline: '12328'
            },

            {
                title: '公共卫生',
                hotline: '12320'
            },
            {
                title: '城建服务',
                hotline: '12319'
            },
            {
                title: '环保投诉',
                hotline: '12369'
            },
            {
                title: '价格监管',
                hotline: '12358'
            },
            {
                title: '纪检监察',
                hotline: '12388'
            },
            {
                title: '住房公积金',
                hotline: '12329'
            },
            {
                title: '网络不良信息举报',
                hotline: '12321'
            },
            {
                title: '国家电网',
                hotline: '95598'
            },
            {
                title: '食品药品投诉举报',
                hotline: '12331'
            },
            {
                title: '法律援助服务',
                hotline: '12348'
            },
            {
                title: '人力资源和社会保障',
                hotline: '12333'
            },
            {
                title: '职工维权公益服务热线',
                hotline: '12351'
            },
            {
                title: '青少年维权与心理咨询',
                hotline: '12355'
            }]
    },  {
        groupName: '航空',
        icon: <RocketOutlined className={''}/>,
        data: [{
            title: '吉祥航空',
            hotline: '95520'
        },
            {
                title: '南方航空',
                hotline: '95539'
            },
            {
                title: '春秋航空',
                hotline: '95524'
            },
            {
                title: '海南航空',
                hotline: '95339'
            },
            {
                title: '四川航空',
                hotline: '95378'
            },
            {
                title: '奥凯航空',
                hotline: '95307'
            },
            {
                title: '北京航空',
                hotline: '95583'
            },
            {
                title: '成都航空',
                hotline: '956028'
            },
            {
                title: '长龙航空',
                hotline: '956199'
            },
            {
                title: '重庆航空',
                hotline: '95539'
            },
            {
                title: '深圳航空',
                hotline: '95361'
            },
            {
                title: '上海航空',
                hotline: '95530'
            },
            {
                title: '华夏航空',
                hotline: '95332'
            },
            {
                title: '天津航空',
                hotline: '95350'
            },
            {
                title: '青岛航空',
                hotline: '0532-96630'
            },
            {
                title: '龙江航空',
                hotline: '956199'
            },
            {
                title: '福州航空',
                hotline: '95071666'
            },
            {
                title: '桂林航空',
                hotline: '95071999'
            }]
    },{
        groupName: '电信和物流',
        icon: <TruckOutlined className={''}/>,

        data: [{
                title: '中国电信',
                hotline: '10000'
            },
            {
                title: '中国移动',
                hotline: '10086'
            },
            {
                title: '中国联通',
                hotline: '10010'
            },
            {
                title: '顺丰速运',
                hotline: '95338'
            },
            {
                title: '圆通速递',
                hotline: '95554'
            },
            {
                title: '申通快递',
                hotline: '95543'
            },
            {
                title: '中通快递',
                hotline: '95311'
            },
            {
                title: '韵达速递',
                hotline: '95546'
            },
            {
                title: '百世快递',
                hotline: '95320'
            },
            {
                title: '京东物流',
                hotline: '950616'
            },
            {
                title: '德邦物流',
                hotline: '95353'
            },
            {
                title: '跨越速运',
                hotline: '95324'
            },
            {
                title: '邮政速递',
                hotline: '11183'
            },
            {
                title: '宅急送',
                hotline: '9501111'
            },
            {
                title: '安能物流',
                hotline: '95355'
            },
            {
                title: '中邮物流',
                hotline: '95541'
            },
            {
                title: '中铁快运',
                hotline: '95306'
            },
            {
                title: '优速快递',
                hotline: '95513'
            }]
    }];

    const tabList = [
        {
            key: 'yh',
            title: '银行',
            href: '#dx'
        },
        {
            key: 'bx',
            title: '保险',
            href: '#yh'
        },
        {
            key: 'dx',
            title: '电信',
            href: '#gw'
        },
        // {
        //     key: 'bmfw',
        //     title: '便民服务',
        //     href: '#kd'
        // },
        {
            key: 'hkfw',
            title: '航空服务',
            href: '#kj'// 联想/苹果/安客/雷蛇
        },
        {
            key: 'zffw',
            title: '政府服务',
            href: '#zscy'// 服务业
        },
        // {
        //     key: 'xfbh',
        //     title: '消费保护',
        //     href: '#qc'
        // },
        // {
        //     key: 'jjfw',
        //     title: '紧急服务',
        //     href: '#jy'
        // }
    ];

    function onTabClick() {
        console.log('sdfsdfsdf')
    }


    return <div className={'w-full h-full overflow-y-auto px-[16px] py-[12px]'}>
        <div className={'max-w-[900px]'}>
            {
                dataList.map((data) => {
                    return <div className={'flex py-2 px-4 flex-1 min-w-full'}>
                        <div className={cx({
                            'w-full dark:bg-[#1C2127] dark:text-white bg-[#fff] text-black rounded-2xl hover:shadow-xl dark:shrink-0 dark:border-solid dark:border-[1px] dark:border-[#474747]': true,
                            'hover': true
                        })}>
                            <div className={'flex items-center gap-1 p-3 border-solid border-b-[1px] border-[#ddd] dark:border-[#474747]'}>
                                <span className={'text-md'}>{data.icon}</span>
                                <span className={'text-md font-medium'}>{data.groupName}</span>
                            </div>
                            <div className={'grid grid-cols-auto-250 auto-rows-max gap-y-[24px] gap-x-[24px] items-center p-6'}>
                                {
                                    data.data.map((item, index) => {
                                        return <div className={'flex items-center'}>
                                            <div className={'flex items-center gap-2'} title={item.title}>
                                                {/*<CaretRightOutlined className={''}/>*/}
                                                <span>{item.title}：</span>
                                            </div>
                                            <a href={`tel:${item.hotline}`}
                                               className={'hover:underline text-red-600'}>{item.hotline}</a>
                                        </div>
                                    })
                                }
                            </div>
                        </div>
                    </div>
                })
            }
        </div>
    </div>
}

export default ClientPage