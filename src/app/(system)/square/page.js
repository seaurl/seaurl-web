import ClientPage from "@/app/(system)/square/clientPage";
import {auth} from "@/lib/auth";
import {redirect} from "next/navigation";

async function getGithubData(params, token) {
    console.log('token =', token)
    let lang = ''
    let search = ''
    if (params.category) {
        lang = params.category
    }
    if (params.search) {
        search = params.search
    }
    console.log('params =', params)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/crud/getGithubData`, {
        method: 'POST',
        body: JSON.stringify({
            lang: lang,
            pageNo: 1,
            param: search
        }),
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

const Square = async (props) => {
    const session = await auth()
    if (!session || !session.accessToken) {
        redirect('/login')
    }
    const res = await getGithubData(props.searchParams, session?.accessToken)
    // console.log('ssquare res=', res)
    if (res.status === 0) {
        console.log('ddd=', res)
        return <ClientPage data={res.data}/>
    }
    return <ClientPage/>
}
export default Square;
