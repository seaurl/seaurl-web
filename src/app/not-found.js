import Link from 'next/link'
import {Result} from 'antd'

export default function NotFound() {
    return (
        <div>
            <Result
                status="404"
                title="404"
                subTitle="对不起, 没有找到您想要访问的页面."
            />
        </div>
    )
}