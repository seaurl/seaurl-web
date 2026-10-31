import ClientPage from "./clientPage";
import {auth} from "@/lib/auth";
import {Result} from "antd";
import {redirect} from "next/navigation";

async function queryAiTools(token) {
    console.log('queryAiTools token=', token)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/crud/aiTools/queryAll`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            'token-id': `${token}`
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
    if (session && session.user && session?.accessToken) {
        const res = await queryAiTools(session?.accessToken)
        if (res.status === 0) {
            return <ClientPage data={res.data}/>
        }else {
            return <div className={'flex w-full justify-center'}>
                <Result
                    status="500"
                    title="500"
                    subTitle="对不起, 让您看到这个页面，我们的工程师正在抓紧排查."
                />
            </div>
        }
    }
    return redirect(`/`)
}

// export const dynamic = 'force-dynamic';

export default ServerPage;
