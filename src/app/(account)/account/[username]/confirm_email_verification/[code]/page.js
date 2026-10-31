import ClientPage from "./clientPage";
import {auth} from "@/lib/auth";

async function verifyAccountEmail(params) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/users/web/users/confirm/email/verified`, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: { "Content-Type": "application/json" },
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

const ServerPage = async ({params, searchParams}) => {
    const session = await auth()
    if (session){
        if (params?.username === session?.user.name){
            return <ClientPage query={params} show="verified"/>
        }else{
            return <ClientPage query={params} show="404"/>
        }
    }else{
        if (params.username && params.code){
            const res = await verifyAccountEmail({
                userName: params.username,
                code: params.code
            })
            console.log('verifyAccountEmail res=', res)
            if (res.status === 0) {
                return <ClientPage query={params} show="success"/>
            } else {
                return <ClientPage query={params} show="invalid"/>
            }
        }
    }
    return <ClientPage query={params} show="404"/>

}
export default ServerPage;
