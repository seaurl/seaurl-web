import ClientPage from "@/app/(user)/setting/[tab]/clientPage"
import {auth} from "@/lib/auth";
import {redirect} from "next/navigation";

async function getData(token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/users/crud/getAccountBaseInfo`, {
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

const Setting = async ({params, searchParams}) => {
    // console.log('Setting params=', params)
    // console.log('Setting searchParams=', searchParams)
    const session = await auth()
    // console.log('Setting session=', session)
    if (session?.accessToken){
        return <ClientPage tab={params.tab}></ClientPage>
    }
    return redirect(`/`)
}
export default Setting;
