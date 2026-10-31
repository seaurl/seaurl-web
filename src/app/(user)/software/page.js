import ClientPage from "@/app/(user)/software/clientPage";
async function getGroupData() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/info/softwareGroup`,{// 默认：force-cache
        // 参考：https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating
        cache: 'no-store'
    })

    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }

    return res.json()
}

async function getListData() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/info/software/queryBy`, {
        method: 'POST',
        body: JSON.stringify({ param: '', groupId: '' }),
        headers: { "Content-Type": "application/json" },
        // 默认：force-cache
        // 参考：https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating
        cache: 'no-store'
    })

    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }

    return res.json()
}

const Software = async () => {

    const res1 = await getGroupData()
    const res2 = await getListData()
    if (res1.status === 0 && res1.status === 0) {
        console.log('data1=', res1)
        console.log('data2=', res2)
        return <div>
            <ClientPage data={{
                group: res1.data,
                list: res2.data
            }}/>
        </div>
    }
    return <div>error</div>

}
export default Software;
