import ClientPage from "./clientPage";
import {auth} from "@/lib/auth";
import {Result} from "antd";

async function getGuysInfo(userName) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/users/info/${userName}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        },
        // 默认：force-cache
        // 参考：https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating
        cache: 'no-store'
    })
    if (!res.ok) {
        return null
    }
    return res.json()
}

async function getUrlCategories(userName) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/info/urlCategory/${userName}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        },
        // 默认：force-cache
        // 参考：https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating
        cache: 'no-store'
    })
    if (!res.ok) {
        return null
    }
    return res.json()
}

async function getUrlCount(token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/crud/url/getUrlCount`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            'token-id': `${token}`,
        },
        // 默认：force-cache
        // 参考：https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating
        cache: 'no-store'
    })
    if (!res.ok) {
        return null
    }
    return res.json()
}

const ServerPage = async ({searchParams}) => {
    const session = await auth()

    // Get username from session instead of URL params
    const userName = session?.user?.name

    const res1 = await getGuysInfo(userName)
    const res2 = await getUrlCategories(userName)
    console.log('session?.user?.name=',session?.user?.name)
    const res3 = await getUrlCount(session?.accessToken || '')
    console.log('res3===',res3)

    if (res1.status === 0 && res2.status === 0) {
        console.log('ddd=', res1)

        if (res2?.data?.length > 0) {
            let flag = true
            if (searchParams?.cid) {
                let fs = res2.data.filter(f => f.id === searchParams?.cid)
                if (fs.length === 0) {
                    flag = false
                }
            }
            if (searchParams?.type) {

            }
            if (!flag) {
                return <Result
                    status="404"
                    title="404"
                    subTitle="对不起, 没有找到您想要访问的页面."
                />
            }
        }
        return <ClientPage
            urlCount={res3.data}
            urlCategories={res2.data}
            userInfo={session?.user}
            guysInfo={res1?.data}/>
    }
    return <Result
        status="500"
        title="500"
        subTitle="对不起, 让您看到这个页面，我们的工程师正在抓紧排查."
    />

}
export default ServerPage;
