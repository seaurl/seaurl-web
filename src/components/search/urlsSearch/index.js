'use client'
import React, {useEffect, useState} from "react";
import {Select, Input, Popover} from "antd";

import {CaretDownOutlined, SearchOutlined} from "@ant-design/icons";
import {useRouter, useParams, usePathname, useSearchParams} from "next/navigation";

const {Option} = Select;
const UrlsSearch = (props) => {
    console.log('props.defaultValue===', props.defaultValue)
    const router = useRouter();
    // const {query} = router;
    const query = useSearchParams()
    const [searchValue, setSearchValue] = useState(props.defaultValue || '');
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        if (!props.defaultValue) {
            setSearchValue('')
        } else {
            setSearchValue(props.defaultValue)
        }
    }, [props.defaultValue])

    useEffect(() => {
        renderFilter()
    }, [query.get('cid')])

    function onChangeFilter(d) {
        setFilter(d)
    }

    function getFilterDefaultValue() {
        if (query.get('filter')) {
            if (['current', 'all'].includes(query.get('filter'))) {
                return query.get('filter')
            }
        }

        return 'all'
    }

    function renderFilter() {
        if (query.get('cid')) {
            return <Select style={{width: '100px'}} defaultValue={getFilterDefaultValue()} onChange={onChangeFilter}>
                <Option value="current">当前分类</Option>
                <Option value="all">全部分类</Option>
            </Select>
        } else {
            return <Select style={{width: '100px'}} defaultValue={getFilterDefaultValue()}>
                <Option value="all">全部分类</Option>
            </Select>
        }
    }

    return (
        <div className={'w-full'}>
            <div className={'p-0 flex flex-row items-center w-full'}>
                {props.showTitle ? <span className={'text-2xl w-[140px]'}>Seaurl</span> : null}
                <Input
                    value={searchValue}
                    className={'min-w-[180px] w-full'}
                    placeholder="请输入搜索内容"
                    addonAfter={props.showAction ? renderFilter() : null}
                    onChange={(e) => {
                        setSearchValue(e.target.value)
                    }}
                    onPressEnter={(e) => {
                        props.onSearch(searchValue, filter)
                    }}
                    size={props.size || 'default'}

                    prefix={props.prefixIcon?<SearchOutlined onClick={() => props.onSearch(searchValue)}/>:null}
                    suffix={props.suffixIcon?<SearchOutlined onClick={() => props.onSearch(searchValue)}/>:null}
                    style={{borderRadius: 6}}
                    allowClear
                />
            </div>
        </div>
    );
};

export default UrlsSearch;
