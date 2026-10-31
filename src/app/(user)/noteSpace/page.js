import ClientPage from "./clientPage";
import {auth} from "@/lib/auth";
import {Result} from "antd";
import {redirect} from "next/navigation";

// 获取用户信息
async function getUserData(userName) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/users/info/${userName}`, {// 默认：force-cache
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

// 获取笔记分类列表
async function queryNoteCategory(token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/crud/noteCategory`, {
        headers: {
            'token-id': `${token}`,
        },
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

// 获取笔记列表
async function getNoteListByCategoryId(cid, token) {
    console.log('getNoteListByCategoryId cid=' ,cid)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/crud/note/queryListBy/${cid}`, {
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

async function getNotesListByType(token, type) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/crud/url/getNotesListByType?type=${type}`, {
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

async function getNoteCount(token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/crud/url/getNotesCountByType`, {
        headers: {
            'token-id': `${token}`,
        },
        // 默认：force-cache
        // 参考：https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating
        cache: 'no-store'
    })
    if (!res.ok) {
        return null
    }
    return res.json()
}



const ServerPage = async ({params, searchParams}) => {
    const session = await auth()
    console.log('params=', params)
    console.log('searchParams=', searchParams)
    if (session && session.user && session?.accessToken) {
        const res1 = await getUserData(session.user.name)
        if (res1.status === 0) {
            const res2 = await queryNoteCategory(session?.accessToken)
            const resCount = await getNoteCount(session?.accessToken)
            console.log('---- resCount -----', JSON.stringify(resCount))
            let res3 = null
            let res4 = null
            if (searchParams?.cid) {
                res3 = await getNoteListByCategoryId(searchParams?.cid, session?.accessToken)
                console.log('---- res3 -----', JSON.stringify(res3))
                // 有cid,没有查询到笔记列表
                if (res3?.data?.length === 0){
                    // return <Result
                    //     status="404"
                    //     title="404"
                    //     subTitle="对不起, 没有找到您想要访问的页面."
                    // />
                }
            }else if (searchParams?.type){
                res4 = await getNotesListByType(session?.accessToken, searchParams?.type)
            }
            console.log('res3=', res3)
            console.log('res4=', res4)
            if (searchParams?.nid){
                let flag = false
                if (res3?.data?.length>0){
                    const fs = res3?.data.filter(f => f.id === searchParams?.nid)
                    if (fs.length>0){
                        flag = true
                    }
                }
                if (res4?.data?.length>0){
                    const fs = res4?.data.filter(f => f.id === searchParams?.nid)
                    if (fs.length>0){
                        flag = true
                    }
                }
                // if(searchParams?.vid){
                //     let flag = false
                //     if (res2?.data?.length>0){
                //         const fs = res2?.data.filter(f => f.id === searchParams?.vid)
                //         if (fs.length>0){
                //             flag = true
                //         }
                //     }
                //     // 如果在笔记分类列表中没找到这个vid的分类，那么说明就不存在这个分类，所以返回404
                //     if (!flag){
                //         return <Result
                //             status="404"
                //             title="404"
                //             subTitle="对不起, 没有找到您想要访问的页面."
                //         />
                //     }
                // }
                // 如果在你的当前分类的笔记列表和你最近使用的笔记列表都没有找到，则返回404
                if (!flag){
                    return <Result
                        status="404"
                        title="404"
                        subTitle="对不起, 没有找到您想要访问的页面."
                    />
                }
            }
            return <ClientPage userInfo={res1.data}
                               noteCategories={res2.data}
                               noteCount = {resCount.data}
                               notes={res3?.data || res4?.data}/>
        }
        return  <Result
            status="500"
            title="500"
            subTitle="对不起, 让您看到这个页面，我们的工程师正在抓紧排查."
        />
    }
    return redirect(`/`)
}
export default ServerPage;
