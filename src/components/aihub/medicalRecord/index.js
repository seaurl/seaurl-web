'use client'
import {Button, Table} from "antd";

 const MedicalRecord = () => {
     const dataSource = [
         {
             key: '1',
             name: '胡彦斌',
             age: 32,
             address: '西湖区湖底公园1号',
         },
         {
             key: '2',
             name: '胡彦祖',
             age: 42,
             address: '西湖区湖底公园1号',
         },
     ];

     const columns = [
         {
             title: '姓名',
             dataIndex: 'name',
             key: 'name',
         },
         {
             title: '性别',
             dataIndex: 'name',
             key: 'name',
         },
         {
             title: '年龄',
             dataIndex: 'age',
             key: 'age',
         },
         {
             title: '住址',
             dataIndex: 'address',
             key: 'address',
         },
     ];


    return <div>
        <div className={'p-3'}>
            <Button type={'primary'}>上传病历</Button>
        </div>
        <div className={'px-3'}>
            <Table dataSource={dataSource} columns={columns} />
        </div>
    </div>
}

export default MedicalRecord