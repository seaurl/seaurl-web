import ClientPage from "./clientPage";
import {auth} from "@/lib/auth";
import {Result} from "antd";
import dayjs from "dayjs";
import {redirect} from "next/navigation";

async function getMailboxes(token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/notify/crud/messages/getMailbox`, {
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

async function getUserInfoByUid(uid, token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/users/info/getUserInfoByUid/${uid}`, {
        // 默认：force-cache
        // 参考：https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating
        cache: 'no-store'
    })
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.
    console.log('getUserInfoByUid= res=', res)
    if (!res.ok) {
        console.log('Failed getUserInfoByUid= res=', res)
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
    }
    return res.json()
}

const ServerPage = async ({params, searchParams}) => {
    const session = await auth()
    // console.log('--- session --- ', session)
    if (session?.user && session?.accessToken) {
        try {
            const res1 = await getMailboxes(session?.accessToken)
            console.log('--- res1 ---', res1)
            // console.log('getMailboxes session =', session)
            if (res1.status === 0) {
                let guysInfo = null
                // 判断是否有fid，也就是正在聊天的朋友数据
                // 如果有fid但是没有聊天用户，说明查不到，那么就返回404
                // 如果有fid但是有聊天用户，但是聊天用户跟fid匹配不上，那么也返回404
                if (searchParams.fid) {
                    // if (res1?.data?.length > 0) {
                    //     const fs = res1.data.filter(f => f.uid === searchParams.fid)
                    //     if (fs.length === 0) {
                    //         return <Result
                    //             status="404"
                    //             title="404"
                    //             subTitle="对不起, 没有找到您想要访问的页面."
                    //         />
                    //     }
                    // } else {
                    //     return <Result
                    //         status="404"
                    //         title="404"
                    //         subTitle="对不起, 没有找到您想要访问的页面."
                    //     />
                    // }
                    guysInfo = await getUserInfoByUid(searchParams.fid)
                    // 有fid，但是以查询不到对应的用户信息，则直接返回404
                    if (searchParams.fid && (!guysInfo || !guysInfo.uid)) {
                        return <Result
                            status="404"
                            title="404"
                            subTitle="对不起, 没有找到您想要访问的页面."
                        />
                    }
                }
                return <ClientPage myselfInfo={session.user}
                                   guysInfo={guysInfo}
                                   mailboxes={res1?.data}/>
            }
        } catch (e) {
            console.log('ServerPage e=', e)
            return <Result
                status="500"
                title="500"
                subTitle="对不起, 让您看到这个页面，我们的工程师正在抓紧排查."
            />
        }
    }
    return redirect(`/`)

}
export default ServerPage;
