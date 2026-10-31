'use client'

import React, {useEffect, useState} from "react";
import {useRouter, usePathname, useSearchParams, useParams} from "next/navigation";
import {useDispatch, useSelector} from "react-redux";
import {Button} from 'antd'

const Index = ({isLogin, clickLogo}) => {
    const pathname = usePathname()
    const router = useRouter()
    const params = useParams()
    const searchParam = useSearchParams()
    // const {query} = router;
    // const dispatch = useDispatch();

    const [where, setWhere] = useState('')

    useEffect(() => {
        // console.log('---------------------router', router)
        // console.log('---------------------query', query)
        // console.log('---------------------pathname', pathname)
        // console.log('---------------------searchParam', searchParam)
        // console.log('---------------------params', params)

        if (isLogin) {
            if (pathname === '/') {
                setWhere('首页')
            }

            if (params.username) {
                setWhere(params?.username)
            }
            if (pathname.startsWith("/fileSpace")) {
                setWhere(`我的文件`)
            }
            if (pathname.startsWith("/noteSpace")) {
                setWhere(`我的笔记`)
            }
            if (params.username && pathname.includes("/urlSpace")) {
                setWhere(`${params?.username} / 网址空间`)
            }
            // if (pathname === "/[username]/urlSpace") {
            //   setWhere(`${router.query.username} / 网址空间`)
            // }
            if (pathname.startsWith('/aiSpace')) {
              setWhere(`首页`)
            }
            if (pathname.startsWith('/mailSpace')) {
              setWhere(`我的邮箱`)
            }
            // if (pathname === "/[username]/noteSpace") {
            //   setWhere(`${router.query.username} / 笔记空间`)
            // }
            if (pathname.startsWith('/setting')) {
                setWhere(`设置`)
            }
            if (pathname === "/chatroom") {
                setWhere(`私信`)
            }
            if (pathname === "/recommendUrls") {
                setWhere(`网址推荐`)
            }
            if (pathname === "/software") {
                setWhere(`软件下载`)
            }
            if (pathname === "/square") {
                setWhere(`技术热榜`)
            }
            if (pathname === "/news") {
                setWhere(`新闻广场`)
            }
            // if (pathname === "/blogs") {
            //   setWhere(`博客广场`)
            // }
            if (pathname === "/hotline") {
                setWhere(`客服电话`)
            }
            if (pathname === "/about") {
                setWhere(`关于`)
            }
            if (pathname === "/rank") {
                setWhere(`积分排行`)
            }
            if (pathname === "/rank") {
                setWhere(`积分排行`)
            }
            if (pathname === "/privacy") {
                setWhere(`隐私政策`)
            }
            if (pathname === "/license") {
                setWhere(`服务条款`)
            }
        }
    }, [pathname, isLogin])

    return <div className={'flex gap-2 items-center'}>
        <img src="https://cdn.awbeci.com/seaurl/logo/seaurl_logo.png" alt=""
             className={'w-[32px] h-[32px] rounded-full'}/>
        {isLogin ? <span
            className={'text-white dark:bg-[#000] dark:text-white text-sm cursor-pointer hover:bg-[#eeeeee70] dark:hover:bg-[#2A3037] px-2 py-1.5 rounded-md box-border'}>{where}</span> : null}
    </div>
};

export default Index;
