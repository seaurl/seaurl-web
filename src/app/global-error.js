'use client' // Error components must be Client Components

import {useEffect} from 'react'
import Link from 'next/link'
import {Result} from 'antd'

export default function GlobalError({error, reset}) {

    return (
        <html>
        <head>
            <link href="https://cdn.awbeci.com/images/awbeci-new-logo/93577bcd7af2636a178d680f1128bace.png" rel="shortcut icon"/>
            <script type="text/javascript" src="https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js"/>
        </head>
        <body className="bg-white dark:bg-black dark:text-white">
            <Result
                status="500"
                title="500"
                subTitle="对不起, 让您看到这个页面，我们的工程师正在抓紧排查."
            />
        </body>
        </html>
    )
}