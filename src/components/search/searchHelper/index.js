'use client'

const SearchEmpty = (props) => {

    return <div className={'py-[32px] overflow-y-hidden h-full'}>
        <div className={'pb-[12px]'}>
            <div className={'flex items-center gap-y-[82px] flex-wrap w-full'}>
                <div className={'inline-flex items-center justify-center flex-col cursor-pointer w-1/4'} onClick={() => {
                    window.open('https://www.google.com.hk/webhp')
                }}>
                    <div className={'w-[32px] h-[32px]'}>
                        <img className={'w-full'} src={"https://cdn.seaurl.com/search/app/logo/google.jpg?x-oss-process=style/100X100"}/>
                    </div>
                    <div className={'text-base pt-[6px] font-medium hover:underline'}>谷歌</div>
                </div>
                <div className={'inline-flex items-center justify-center flex-col cursor-pointer w-1/4'} onClick={() => {
                    window.open('https://www.baidu.com/')
                }}>
                    <div className={'w-[32px] h-[32px]'}>
                        <img className={'w-full'} src={"https://cdn.seaurl.com/search/app/logo/baidu.jpg?x-oss-process=style/100X100"}/>
                    </div>
                    <div className={'text-base pt-[6px] font-medium hover:underline'}>百度</div>
                </div>
                <div className={'inline-flex items-center justify-center flex-col cursor-pointer w-1/4'} onClick={() => {
                    window.open('https://cn.bing.com/')
                }}>
                    <div className={'w-[32px] h-[32px]'}>
                        <img className={'w-full'} src={"https://cdn.seaurl.com/search/app/logo/bing.png?x-oss-process=style/100X100"}/>
                    </div>
                    <div className={'text-base pt-[6px] font-medium hover:underline'}>bing</div>
                </div>
                <div className={'inline-flex items-center justify-center flex-col cursor-pointer w-1/4'} onClick={() => {
                    window.open('https://www.maigoo.com/')
                }}>
                    <div className={'w-[32px] h-[32px]'}>
                        <img className={'w-full'} src={"https://cdn.seaurl.com/search/app/logo/maigoo.jpg?x-oss-process=style/100X100"}/>
                    </div>
                    <div className={'text-base pt-[6px] font-medium hover:underline'}>品牌搜索</div>
                </div>
                <div className={'inline-flex items-center justify-center flex-col cursor-pointer w-1/4'} onClick={() => {
                    window.open('https://zh.wikipedia.org/')
                }}>
                    <div className={'w-[32px] h-[32px]'}>
                        <img className={'w-full'} src={"https://cdn.seaurl.com/search/app/logo/wiki.png?x-oss-process=style/100X100"}/>
                    </div>
                    <div className={'text-base pt-[6px] font-medium hover:underline'}>维基</div>
                </div>
                <div className={'inline-flex items-center justify-center flex-col cursor-pointer w-1/4'} onClick={() => {
                    window.open('https://www.sogou.com/')
                }}>
                    <div className={'w-[32px] h-[32px]'}>
                        <img className={'w-full'} src={"https://cdn.seaurl.com/search/app/logo/sogou.jpg?x-oss-process=style/100X100"}/>
                    </div>
                    <div className={'text-base pt-[6px] font-medium hover:underline'}>搜狗</div>
                </div>
                <div className={'inline-flex items-center justify-center flex-col cursor-pointer w-1/4'} onClick={() => {
                    window.open('https://www.chinaso.com/')
                }}>
                    <div className={'w-[32px] h-[32px]'}>
                        <img className={'w-full'} src={"https://cdn.seaurl.com/search/app/logo/chinaso.png?x-oss-process=style/100X100"}/>
                    </div>
                    <div className={'text-base pt-[6px] font-medium hover:underline'}>中国搜索</div>
                </div>
                <div className={'inline-flex items-center justify-center flex-col cursor-pointer w-1/4'} onClick={() => {
                    window.open('https://www.youdao.com/')
                }}>
                    <div className={'w-[32px] h-[32px]'}>
                        <img className={'w-full'} src={"https://cdn.seaurl.com/search/app/logo/youdao.png?x-oss-process=style/100X100"}/>
                    </div>
                    <div className={'text-base pt-[6px] font-medium hover:underline'}>有道</div>
                </div>
                <div className={'inline-flex items-center justify-center flex-col cursor-pointer w-1/4'} onClick={() => {
                    window.open('https://www.toutiao.com/')
                }}>
                    <div className={'w-[32px] h-[32px]'}>
                        <img className={'w-full'} src={"https://cdn.seaurl.com/search/app/logo/toutiao.png?x-oss-process=style/100X100"}/>
                    </div>
                    <div className={'text-base pt-[6px] font-medium hover:underline'}>今日头条</div>
                </div>
                <div className={'inline-flex items-center justify-center flex-col cursor-pointer w-1/4'} onClick={() => {
                    window.open('https://www.so.com/')
                }}>
                    <div className={'w-[32px] h-[32px]'}>
                        <img className={'w-full'} src={"https://cdn.seaurl.com/search/app/logo/360soso.png?x-oss-process=style/100X100"}/>
                    </div>
                    <div className={'text-base pt-[6px] font-medium hover:underline'}>360搜索</div>
                </div>
                <div className={'inline-flex items-center justify-center flex-col cursor-pointer w-1/4'} onClick={() => {
                    window.open('https://www.tianyancha.com/')
                }}>
                    <div className={'w-[32px] h-[32px]'}>
                        <img className={'w-full'} src={"https://cdn.seaurl.com/search/app/logo/tyc.jpg?x-oss-process=style/100X100"}/>
                    </div>
                    <div className={'text-base pt-[6px] font-medium hover:underline'}>天眼查</div>
                </div>
                <div className={'inline-flex items-center justify-center flex-col cursor-pointer w-1/4'} onClick={() => {
                    window.open('https://www.zhihu.com/')
                }}>
                    <div className={'w-[32px] h-[32px]'}>
                        <img className={'w-full'} src={"https://cdn.seaurl.com/search/app/logo/zhihu.jpg?x-oss-process=style/100X100"}/>
                    </div>
                    <div className={'text-base pt-[6px] font-medium hover:underline'}>知乎</div>
                </div>
            </div>
        </div>
    </div>
}

export default SearchEmpty
