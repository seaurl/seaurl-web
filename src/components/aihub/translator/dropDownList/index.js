'use client'
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch, useSelector} from "react-redux";
import {Dropdown} from "antd";
import {CheckOutlined, DownOutlined} from "@ant-design/icons";
import classNames from "classnames/bind";
import IconFont from "@/utils/iconFont";

const DropdownList = (props) => {
    const {data: session} = useSession()
    const router = useRouter();
    const dispatch = useDispatch()
    const {platFormTheme} = useSelector(state => state.system)
    const [isOpen, setOpen] = useState(false)

    // const [chooseLng, setChooseLng] = useState('')
    const [lngName, setLngName] = useState('')

    useEffect(() => {
        if (props.detect) {
            setLngName(props.detect.label)
        }
    }, [props.detect])

    useEffect(() => {
        let _lngName = ''
        if (props.value) {
            const fs = props.menus.filter(f => f.value === props.value)
            if (fs.length > 0) {
                _lngName = fs[0].label
            }
        }
        setLngName(_lngName)
    }, [props.value])

    function renderMenus() {
        console.log('renderMenus=', props.menus)
        return props.menus?.map((item, key) => {
            return <div
                key={key}
                className={'w-[180px] px-2 py-2 cursor-pointer text-base hover:bg-[#eee] dark:hover:bg-[#2E333D] flex items-center rounded-md'}
                onClick={() => {
                    if (props.onChange) {
                        props.onChange(item.value)
                    }
                    setOpen(false)
                }}>
                {item.value === props.value ?
                    <div className={'w-[30px] flex items-center justify-center'}><CheckOutlined/></div>
                    : <span className={'w-[30px]'}></span>}
                {item.label}
            </div>
        })
    }

    return <div className={'flex flex-col gap-2'}>
        <Dropdown
            open={isOpen}
            trigger="click"
            onOpenChange={async visible => {
                setOpen(visible);
            }}
            dropdownRender={() => {
                return <div style={{gridTemplateRows: 'repeat(11, minmax(40px, max-content))'}}
                            className={'bg-white dark:bg-[#141414] overflow-y-auto max-h-[500px] flex flex-col lg:grid lg:grid-cols-3 relative h-full grid-flow-col justify-items-start gap-x-2 p-4 shadow border border-[#ddd] dark:border-[#474747] rounded-md'}>
                    {renderMenus()}
                </div>
            }}>
            <div className={classNames({
                'cursor-pointer hover:bg-[#eee] dark:hover:bg-[#2E333D] rounded-sm py-1 px-4 flex items-center justify-center gap-2': true,
                'bg-[#eee] dark:bg-[#2E333D]': isOpen
            })} onClick={() => setOpen(true)}>
                {lngName}<IconFont
                type="icon-jiantouxia"
                style={{filter: platFormTheme.background === 'light' ? '' : 'invert(100%)'}}
                className={'text-white'}
            />
            </div>
        </Dropdown>
    </div>
};

export default withRouter(DropdownList);