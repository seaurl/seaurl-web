'use client'
import {Splitter, Input, Tree, Descriptions, Badge, Button} from "antd";
import {useState, useMemo} from "react";

const {Search} = Input;
const x = 3;
const y = 2;
const z = 1;
const defaultData = [];
const generateData = (_level, _preKey, _tns) => {
    const preKey = _preKey || '0';
    const tns = _tns || defaultData;
    const children = [];
    for (let i = 0; i < x; i++) {
        const key = `${preKey}-${i}`;
        tns.push({title: key, key});
        if (i < y) {
            children.push(key);
        }
    }
    if (_level < 0) {
        return tns;
    }
    const level = _level - 1;
    children.forEach((key, index) => {
        tns[index].children = [];
        return generateData(level, key, tns[index].children);
    });
};
generateData(z);
const dataList = [];
const generateList = data => {
    for (let i = 0; i < data.length; i++) {
        const node = data[i];
        const {key} = node;
        dataList.push({key, title: key});
        if (node.children) {
            generateList(node.children);
        }
    }
};
generateList(defaultData);
const getParentKey = (key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children) {
            if (node.children.some(item => item.key === key)) {
                parentKey = node.key;
            } else if (getParentKey(key, node.children)) {
                parentKey = getParentKey(key, node.children);
            }
        }
    }
    return parentKey;
};
const KeyManage = () => {
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [isEdit, setEdit] = useState(false);
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    const onExpand = newExpandedKeys => {
        setExpandedKeys(newExpandedKeys);
        setAutoExpandParent(false);
    };
    const onChange = e => {
        const {value} = e.target;
        const newExpandedKeys = dataList
            .map(item => {
                if (item.title.indexOf(value) > -1) {
                    return getParentKey(item.key, defaultData);
                }
                return null;
            })
            .filter((item, i, self) => !!(item && self.indexOf(item) === i));
        setExpandedKeys(newExpandedKeys);
        setSearchValue(value);
        setAutoExpandParent(true);
    };
    const treeData = useMemo(() => {
        const loop = data =>
            data.map(item => {
                const strTitle = item.title;
                const index = strTitle.indexOf(searchValue);
                const beforeStr = strTitle.substring(0, index);
                const afterStr = strTitle.slice(index + searchValue.length);
                const title =
                    index > -1 ? (
                        <span key={item.key}>
              {beforeStr}
                            <span className="site-tree-search-value">{searchValue}</span>
                            {afterStr}
            </span>
                    ) : (
                        <span key={item.key}>{strTitle}</span>
                    );
                if (item.children) {
                    return {title, key: item.key, children: loop(item.children)};
                }
                return {
                    title,
                    key: item.key,
                };
            });
        return loop(defaultData);
    }, [searchValue]);

    const items = [
        {
            key: '1',
            label: isEdit ? <Input placeholder="请输入"/> : '111',
            children: isEdit ? <Input placeholder="请输入"/> : '222',
            labelStyle: {
                width: '200px'
            }
        },
        {
            key: '2',
            label: 'Billing Mode',
            children: 'Prepaid',
        },
        {
            key: '3',
            label: 'Automatic Renewal',
            children: 'YES',
        },
        {
            key: '4',
            label: 'Order time',
            children: '2018-04-24 18:00:00',
        },
        {
            key: '7',
            label: 'Negotiated Amount',
            children: '$80.00',
        },
        {
            key: '8',
            label: 'Discount',
            children: '$20.00',
        },
        {
            key: '9',
            label: 'Official Receipts',
            children: '$60.00',
        }
    ];

    return <div>
        <Splitter style={{height: 'calc(100vh - 64px)', overflow: 'hidden'}}>
            <Splitter.Panel defaultSize="20%" min="0%" max="20%" collapsible>
                <div className={'p-2'}>
                    <Search style={{marginBottom: 8}} placeholder="Search" onChange={onChange}/>
                    <Tree
                        onExpand={onExpand}
                        expandedKeys={expandedKeys}
                        autoExpandParent={autoExpandParent}
                        treeData={treeData}
                    />
                </div>
            </Splitter.Panel>
            <Splitter.Panel>
                <div className={'p-2'}>
                    <div className={'p-3'}><Button onClick={() => {
                        setEdit(!isEdit);
                    }}>是否可编辑</Button></div>
                    <Descriptions bordered items={items} column={1}/>
                </div>
            </Splitter.Panel>
        </Splitter>
    </div>
}

export default KeyManage
