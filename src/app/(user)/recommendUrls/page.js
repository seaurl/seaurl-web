import SubPage from "@/app/(user)/recommendUrls/subPage";

async function getData() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/info/getCommonUrls`, {
        headers: {"Content-Type": "application/json"},
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

const RecommendUrls = async () => {

    const data = await getData()
    if (data.status === 0) {
        console.log('ddd=', data)
        return <div>
            <SubPage urls={data.data}/>
        </div>
    }
    return <div>error</div>

}
export default RecommendUrls;
