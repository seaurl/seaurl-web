import ClientPage from "./clientPage";
import {auth} from "@/lib/auth";
import {Result} from "antd";
import {redirect} from "next/navigation";

/**
 * 查询用户的AI工具
 * @param token
 * @returns {Promise<any>}
 */
async function queryUserAiTools(token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/crud/userAiTools/query`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            'token-id': `${token}`
        },
        // 默认：force-cache
        // 参考：https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating
        cache: 'no-store'
    })
    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
    }

    return res.json()
}

// async function updateDt(token, usedId) {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/crud/userAiTools/updateDt?usedId=${usedId}`, {
//         method: 'GET',
//         headers: {
//             "Content-Type": "application/json",
//             'token-id': `${token}`
//         },
//         // 默认：force-cache
//         // 参考：https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating
//         cache: 'no-store'
//     })
//     if (!res.ok) {
//         // This will activate the closest `error.js` Error Boundary
//         throw new Error('Failed to fetch data')
//     }
//
//     return res.json()
// }

const ServerPage = async ({params, searchParams}) => {
    const session = await auth()
    console.log('==========================todo:没有触发server重新渲染====================================')
    if (session?.user && session?.accessToken){
        const res = await queryUserAiTools(session?.accessToken)
        if (res.status === 0) {
            console.log('queryUserAiTools res=', res)
            console.log('searchParams.usedId=', searchParams?.usedId)
            if (searchParams?.usedId){
                const fs = res.data.filter(f => f.usedId === searchParams.usedId)
                if (fs.length === 0) {
                    return <div className={'flex w-full justify-center'}>
                        <Result
                            status="404"
                            title="404"
                            subTitle="对不起, 没有找到您想要访问的页面."
                        />
                    </div>
                }
            }
            return <ClientPage data={res.data}/>
        } else {
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
