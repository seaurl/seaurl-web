import ClientPage from "./clientPage";
import {auth} from "@/lib/auth";
import {Result} from "antd";
import {redirect} from "next/navigation";

async function getFile(token, fileId) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/crud/file/queryFileById?fileId=${fileId}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
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
    console.log('searchParams?.fileId=', searchParams.fileId)
    const session = await auth()
    console.log('session=', session)
    if (session && session.user && session?.accessToken) {
        if (searchParams.fileId) {
            const res = await getFile(session?.accessToken, searchParams.fileId)
            console.log('get file res = ', res)
            if (res.status === 0 && res.data){
                return <ClientPage file={res.data} myselfInfo={session.user}/>
            }
        }
    }else{
        redirect(`/`)
    }
}
export default ServerPage;
