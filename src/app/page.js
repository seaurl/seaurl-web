import LogoutPage from "@/app/(home)/logoutPage";
import DashboardPage from "@/app/(user)/dashboard/page";
import {auth} from "@/lib/auth";

const Main = async ({params, searchParams, routerPush}) => {
    const session = await auth()
    console.log('home page session =', session)
    if (session?.user && session?.accessToken){
        return <DashboardPage />
    }
    return <LogoutPage />

}
export default Main;
