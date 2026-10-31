'use client'
import {Button, Table} from "antd";
import {CloudUploadOutlined, PlusOutlined} from "@ant-design/icons";
import Empty from "@/components/empty";
import {useState} from "react";
import KnowledgeCategoryDlg from "@/components/dialog/knowledgeCategoryDlg";
import knowledgeCategoryDlg from "@/components/dialog/knowledgeCategoryDlg";

const ClientPage = () => {

    const [knowledgeCategoryDlg, setKnowledgeCategoryDlg] = useState({
        title: '',
        show: false
    });
    const [list, setList] = useState([{
        name: '111',
        desc: '2222'
    }]);
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: text => <a>{text}</a>,
        },
        {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Tags',
            key: 'tags',
            dataIndex: 'tags'
        },
        {
            title: 'Action',
            key: 'action'
        },
    ];
    const data = [
        {
            key: '1',
            name: 'John Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
            tags: ['nice', 'developer'],
        },
        {
            key: '2',
            name: 'Jim Green',
            age: 42,
            address: 'London No. 1 Lake Park',
            tags: ['loser'],
        },
        {
            key: '3',
            name: 'Joe Black',
            age: 32,
            address: 'Sydney No. 1 Lake Park',
            tags: ['cool', 'teacher'],
        },
    ];
    return <div className={'flex flex-row w-full h-[100vh]'}>
        <div className={'w-[250px] h-full flex-shrink-0 border-r border-[#ddd]'}>
            <div className={'p-3 flex items-center justify-between border-b border-[#ddd]'}>
                <div className={'font-medium'}>知识库分类</div>
                <Button size={'small'} type="text" icon={<PlusOutlined/>} onClick={() => {
                    setKnowledgeCategoryDlg({
                        title: '添加',
                        show: true
                    })
                }}></Button>
            </div>
            <div>
                <Empty/>
            </div>
        </div>
        <div className={'w-full bg-[#f3f4f7]'}>
            <div className={'p-3 w-full flex items-center justify-between border-b border-[#ddd] bg-white'}>
                <div className={'flex items-center gap-2'}>
                    <span className={'font-medium'}>
                        知识库文档
                    </span>
                    {/*<Button size={'small'} type="text" icon={<CloudUploadOutlined/>}></Button>*/}
                </div>
                {/*<div></div>*/}
            </div>
            <div className={'w-full '}>
                <Empty />
                {/*<Table columns={columns} dataSource={data} />*/}
            </div>
        </div>
        <KnowledgeCategoryDlg dlg={knowledgeCategoryDlg} onClose={() => setKnowledgeCategoryDlg({
            show: false
        })}/>
    </div>
}

export default ClientPage
