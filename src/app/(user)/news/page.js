import ClientPage from "@/app/(user)/news/clientPage";
import {auth} from "@/lib/auth";
import {redirect} from "next/navigation";
async function getMsnData(params, token) {
    let tab = params.tab || 'Y_77f04c37-b63e-46b4-a990-e926f7d129ff'
    let url = `${process.env.NEXT_PUBLIC_API_HOST}/space/crud/getMsnData/${tab}/0`
    const res = await fetch(url, {
        headers: {"Content-Type": "application/json", 'token-id': `${token}`},
        // 默认：force-cache
        // 参考：https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating
        cache: 'no-store'
    })

    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }

    return res.json()
}

const News = async (props) => {
    const session = await auth()
    if (!session || !session.accessToken) {
        redirect('/login')
    }
    const res = await getMsnData(props.searchParams, session?.accessToken)
    if (res?.sections) {
        return <ClientPage data={res.sections}/>
    }
    return <ClientPage />

}
export default News;
