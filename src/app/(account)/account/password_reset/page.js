import ClientPage from "./clientPage";
import {auth} from "@/lib/auth";
import {redirect} from "next/navigation";

// async function getData() {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/info/getCommonUrls`)
//     // The return value is *not* serialized
//     // You can return Date, Map, Set, etc.
//
//     if (!res.ok) {
//         // This will activate the closest `error.js` Error Boundary
//         throw new Error('Failed to fetch data')
//     }
//
//     return res.json()
// }

const ServerPage = async () => {
    const session = await auth()

    if (!session) {
        return <ClientPage/>
    }
    redirect(`/`) // Navigate to the new post page


}
export default ServerPage;
