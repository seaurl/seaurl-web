import ClientPage from "./clientPage";
import {auth} from "@/lib/auth";
import token from "markdown-it/lib/token.mjs";
import {Result} from "antd";
import {redirect} from "next/navigation";


// 获取用户信息
async function getUserData(userName) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/users/info/${userName}`, {
        // 默认：force-cache
        // 参考：https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating
        cache: 'no-store'
    })
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.

    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
    }

    return res.json()
}

// 获取文件分类列表
async function queryFileCategory(token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/crud/fileCategory`, {
        headers: {
            'token-id': `${token}`,
        },
        // 默认：force-cache
        // 参考：https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating
        cache: 'no-store'
    })
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.

    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
    }

    return res.json()
}

// 获取文件列表
async function getFileListBy(type = 'personal', fullPath = '/', token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/crud/file/getListBy?type=${type}&fullPath=${encodeURIComponent(fullPath)}`, {
        headers: {
            'token-id': `${token}`,
        },
        // 默认：force-cache
        // 参考：https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating
        cache: 'no-store'
    })
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.

    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
    }

    return res.json()
}


const ServerPage = async ({params, searchParams}) => {
    const session = await auth()
    // console.log('--- params ---',params)
    // console.log('--- searchParams ---',searchParams)
    // console.log('--- session ---',session)
    if (session && session.user && session?.accessToken) {
        const res1 = await getUserData(session.user.name)
        if (res1.status === 0) {
            // const res2 = await queryFileCategory(session?.accessToken)
            // console.log('res2=', res2)

            console.log('getFileListByType -====', searchParams?.type)
            let res3 = await getFileListBy(searchParams?.type, searchParams?.fullPath, session?.accessToken)
            // if (searchParams?.cid) {
                //todo:看看为啥不行
                // let flag = false
                // if (res2?.data?.length > 0) {
                //     const fs = res2?.data.filter(f => f.id === searchParams?.cid)
                //     if (fs.length > 0) {
                //         flag = true
                //     }
                // }
                // // 如果没有在文件分类中找到这个cid说明就没有这个分类，所以返回404
                // if (!flag) {
                //     return <Result
                //         status="404"
                //         title="404"
                //         subTitle="对不起, 没有找到您想要访问的页面."
                //     />
                // }

                // res3 = await getFileListByCid(params?.cid, session?.accessToken)
            // }
            return <ClientPage userInfo={res1.data} files={res3?.data}/>
        }
    }
    return redirect(`/`)

}
export default ServerPage;
