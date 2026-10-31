// import {Inter} from "next/font/google";
import "./(global)/globals.css";
import AntdProvider from "@/context/antdProvider";
import AuthProvider from "@/context/authProvider";
import StoreProvider from "@/context/storeProvider";
import ChildrenLayout from "@/components/layout/childrenLayout";
import "cropperjs/dist/cropper.css";
import './(global)/rch.css'
import {auth} from "@/lib/auth";

// const inter = Inter({subsets: ["latin"]});


export const metadata = {
    title: "Seaurl-AI管家",
    description: "在数字化时代，我们每天都会接触大量信息和各式各样的工具，无论是AI搜索提供的内容，还是工作中使用的关键工具。对于许多人来说，有效管理这些信息和工具是一个挑战，这正是 Seaurl 的使命所在。",
    keywords: 'AI,AI管家,AI工具库,通义千问,文心一言,智能AI工具,软件下载,推荐网址,新闻广场,热门技术,客户电话,网址收藏,笔记,文件'
};

export default async function RootLayout({children}) {

    const session = await auth()
    console.log('NODE_ENV =', process.env.NODE_ENV)
    return (
        <html>
        <head>
            <link href="https://cdn.awbeci.com/images/awbeci-new-logo/93577bcd7af2636a178d680f1128bace.png"
                  rel="shortcut icon"/>
            <script type="text/javascript" src="https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js"/>
            {/*<link rel="preconnect" href="https://drawio.seaurl.com"/>*/}
            {/*<link rel="dns-prefetch" href="https://drawio.seaurl.com"/>*/}

            {/*<link rel="preload" as="style" href="https://drawio.seaurl.com/styles/grapheditor.css"/>*/}
            {/*<link rel="preload" as="style" href="https://drawio.seaurl.com/styles/high-contrast.css"/>*/}
            {/*<link rel="preload" as="style" href="https://drawio.seaurl.com/mxgraph/css/common.css"/>*/}

            {/*<link rel="preload" as="script" href="https://drawio.seaurl.com/js/stencils.min.js"/>*/}
            {/*<link rel="preload" as="script" href="https://drawio.seaurl.com/js/extensions.min.js"/>*/}
            {/*<link rel="preload" as="script" href="https://drawio.seaurl.com/js/stencils.min.js" />*/}
            {/*<link rel="preload" as="script" href="https://drawio.seaurl.com/math/es5/core.js"/>*/}
            {/*<link rel="preload" as="script" href="https://drawio.seaurl.com/js/app.min.js"/>*/}
            {/*<link rel="preload" as="script" href="https://drawio.seaurl.com/js/shapes-14-6-5.min.js"/>*/}
            {/*<link rel="preload" as="script" href="https://drawio.seaurl.com/math/es5/output/svg/fonts/tex.js"/>*/}
            {/*<link rel="preload" as="script" href="https://drawio.seaurl.com/math/es5/ui/safe.js"/>*/}
            {/*<link rel="preload" as="script" href="https://drawio.seaurl.com/math/es5/input/tex.js"/>*/}
            {/*<link rel="preload" as="script" href="https://drawio.seaurl.com/math/es5/output/svg.js"/>*/}
            {/*<link rel="preload" as="script" href="https://drawio.seaurl.com/js/PreConfig.js"/>*/}
            {/*<link rel="preload" as="script" href="https://drawio.seaurl.com/math/es5/startup.js"/>*/}
            {/*<link rel="preload" as="script" href="https://drawio.seaurl.com/js/click.js"/>*/}
            {/*<link rel="preload" as="script" href="https://drawio.seaurl.com/js/PostConfig.js"/>*/}
            {/*代码编辑器依赖的js，默认从外网cdn加载，导致一直loading,现在改成从ali加载，*/}
            {/*<script type="text/javascript" src="https://cdn.seaurl.com/space/ai/monacoLoader.js"/>*/}
            <link rel="stylesheet" href="https://cdn.seaurl.com/js/bpmn-io/properties-panel.css" />
        </head>
        <body className="h-full w-full bg-white dark:bg-[#141414] dark:text-white">
        <StoreProvider>
                <AuthProvider>
                    <AntdProvider serverSession={session}>
                        <ChildrenLayout serverSession={session}>
                            {children}
                        </ChildrenLayout>
                    </AntdProvider>
                </AuthProvider>
            </StoreProvider>
        </body>
        </html>
    );
}
