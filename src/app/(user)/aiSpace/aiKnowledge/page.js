import ClientPage from "./index";
import {auth} from "@/lib/auth";

async function getData() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/info/getCommonUrls`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json" },
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

    return <ClientPage />

}
export default ServerPage;
