'use client'
import {Row, Col, Button} from 'antd'
import {
    RightOutlined
} from "@ant-design/icons";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {useDispatch, useSelector} from "react-redux";
import {
    userClickUrl
} from '@/lib/slices/urlSpaceSlice';
import {withRouter} from "@/hoc/withRouter";
import {buildFaviconUrl, DEFAULT_FAVICON} from "@/utils/favicon";

import {shallowUpdateRouterParams} from "@/utils/routerHelp";

const HistoryUrl = (props) => {
    const router = useRouter();
    // const {query} = router;
    const dispatch = useDispatch();
    const searchParams = useSearchParams()
    const params = useParams()
    const {platFormTheme} = useSelector(state => state.system)

    // const {
    //   me, isLogin, userInfo
    // } = useSelector((state) => state.auth)

    function renderUrls() {
        return props.urls.slice(0, 9).map((url, index) => {
            return <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12} key={index}>
                <div className={'flex flex-row flex-wrap max-w-sm w-[90%] text-sm pb-3 px-1'} key={index}>
                    <a href={url.url} target="_blank"
                       className={'inline-flex items-center cursor-pointer truncate text-[#505050] dark:text-[#fff] hover:text-black dark:hover:text-white dark:hover:underline'} onClick={() => {
                        if (isLogin) {
                            dispatch(userClickUrl(url.id))
                        }
                    }}>
                        <span className={'bg-[#f1f3f4] border border-[#ecedef] rounded-full flex items-center justify-center h-[26px] w-[26px] mr-[6px] shrink-0'}>
                          <img className={'w-[16px] h-[16px]'} src={buildFaviconUrl(url)} onError={(e) => {
                              e.target.onerror = null; // 防止无限循环
                              e.target.src = DEFAULT_FAVICON; // 默认图片地址
                          }}/>
                        </span>
                        <span className={'text-md truncate'}>{url.title}</span>
                    </a>
                </div>
            </Col>
        })
    }

    function renderMore() {
        if (props.urls.length === 10) {
            return <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                <div style={{color: platFormTheme?.color}} className={'py-1 cursor-pointer hover:underline'} onClick={() => {
                    props.routerPush(`/urlSpace?search=${props.date}&sortType=comprehensive&filter=all`)
                }}>查看更多<RightOutlined/></div>
            </Col>
        }
        return null;
    }

    return <div className={'pt-2'}>
        <Row gutter={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6, xxl: 6}}>
            {renderUrls()}
            {renderMore()}
        </Row>
    </div>
}

export default withRouter(HistoryUrl)
