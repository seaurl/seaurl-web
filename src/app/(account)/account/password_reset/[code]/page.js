import ClientPage from "./clientPage";
import { redirect } from 'next/navigation'
import {auth} from "@/lib/auth";

async function verifiedCode(code) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/users/web/reset/verified/resetPassword/${code}`, {
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
    // 判断是否登录
    if (!session){
        if (params.code){
            const res = await verifiedCode(params.code)
            console.log('verifiedCode res=', res)
            if (res.status === 0) {
                return <ClientPage user={res.data}/>
            }
            return <ClientPage user={null} res={res}/>
        }
        redirect(`/account/password_reset`) // Navigate to the new post page
    }
    redirect(`/`) // Navigate to the new post page
}
export default ServerPage;
