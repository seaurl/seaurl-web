import ClientPage from "./clientPage";

async function verifiedCode(params) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/users/info/update/email/verified`, {
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

const UpdateEmail = async ({params, searchParams}) => {
    if (params.username && params.code){
        const res = await verifiedCode({
            userName: params.username,
            code: params.code
        })
        console.log('UpdateEmail res=', res)
        if (res.status === 0) {
            return <ClientPage show="success"/>
        } else {
            return <ClientPage show="invalid"/>
        }
    }
    return <ClientPage show="404"/>

}
export default UpdateEmail;
