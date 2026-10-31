import ClientPage from "./clientPage";
import {auth} from "@/lib/auth";
import {Result} from "antd";

const ServerPage = async () => {
    const session = await auth()
    if (session?.user && session?.accessToken) {
        return <ClientPage userInfo={session?.user} />
    }
    return <Result
        status="403"
        title="403"
        subTitle="请先登录后查看工作台。"
    />
}
export default ServerPage;
