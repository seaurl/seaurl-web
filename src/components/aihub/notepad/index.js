'use client'
import React, {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch} from "react-redux";
import {Calendar, theme, Input, Spin, Button, Drawer, Tooltip, Select} from 'antd';
import dayjs from 'dayjs';
import {LeftOutlined, LoadingOutlined, RightOutlined,PicLeftOutlined,UploadOutlined,FolderOutlined,FolderAddOutlined,FolderOpenOutlined,FolderViewOutlined} from "@ant-design/icons";
// import 'dayjs/locale/zh-cn';
// dayjs.locale('zh-cn');
import styles from './index.module.scss'
import classNames from "classnames/bind";

let cx = classNames.bind(styles);

const {TextArea} = Input;

const NotePad = (props) => {
    const {data: session} = useSession()
    const router = useRouter();
    const dispatch = useDispatch()
    const [selectedDate, setSelectedDate] = useState(dayjs());

    const [openDrawer, setOpenDrawer] = useState(false)

    useEffect(() => {

    }, [])

    const onPanelChange = (value, mode) => {
        console.log(value.format('YYYY-MM-DD'), mode);
    };
    const {token} = theme.useToken();
    const wrapperStyle = {
        width: 300,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
    };

    const onDateChange = (value, selectInfo) => {
        if (selectInfo.source === 'date') {
            setSelectedDate(value);
        }
    };

    const headerRender = ({ value, onChange }) => {
        const currentMonth = value.month();
        const currentYear = value.year();

        const prevMonth = () => {
            const newValue = value.clone().subtract(1, 'month');
            onChange(newValue);
        };

        const nextMonth = () => {
            const newValue = value.clone().add(1, 'month');
            onChange(newValue);
        };

        const handleYearChange = (year) => {
            const newValue = value.clone().year(year);
            onChange(newValue);
        };

        const handleMonthChange = (month) => {
            const newValue = value.clone().month(month);
            onChange(newValue);
        };

        // Generate years list for the dropdown
        const years = [];
        for (let i = currentYear - 10; i <= currentYear + 10; i++) {
            years.push(i);
        }

        // Generate months list for the dropdown
        const months = [];
        for (let i = 0; i < 12; i++) {
            months.push({ value: i, label: value.clone().month(i).format('MMMM') });
        }

        return (
            <div className={'flex items-center justify-between gap-2 py-2'}>
                <Button onClick={prevMonth} icon={<LeftOutlined />} />

                <div className={'flex items-center gap-2'}>
                    <Select
                        value={currentYear}
                        onChange={handleYearChange}
                        options={years.map(year => ({ value: year, label: year }))}
                        style={{ width: 80 }}
                    />
                    <Select
                        value={currentMonth}
                        onChange={handleMonthChange}
                        options={months}
                        style={{ width: 90 }}
                    />
                </div>

                <Button onClick={nextMonth} icon={<RightOutlined />} />
            </div>
        );
    };
    const data = {
        '2024-08-15': true, // 在这个日期下显示红点
        '2024-08-18': true, // 在这个日期下显示红点
    };

    const fullCellRender = (date, value) => {
        const formattedDate = date.format('YYYY-MM-DD');
        const hasData = data[formattedDate];
        const isSelected = date.isSame(selectedDate, 'day');
        const isToday = date.isSame(dayjs(), 'date')

        return (
            <div className={cx({
                'flex items-center justify-center flex-col w-[36px] h-[36px] relative mx-[7px]': true,
                'bg-[#1677ff] text-white rounded-md': isSelected,
                'border border-[#1677ff] rounded-md': isToday
            })}>
                <div className={'relative z-1'}>{date.date()}</div>
                {hasData && <div className={'flex items-center justify-center w-[6px] h-[6px] rounded-full bg-red-600'}>
                </div>}
            </div>
        );
    };

    function renderLeft() {
        return <div className={'flex flex-col w-[370px] relative shrink-0 h-full'}>
            {/*<div className={'font-medium text-base p-3 border-b border-[#ddd] dark:border-[#474747]'}>日历</div>*/}
            <div className={'px-2 bg-[#fff]'}>
                <Spin spinning={false} indicator={<LoadingOutlined
                    style={{
                        fontSize: 36,
                    }}
                    spin
                />}>
                    <Calendar headerRender={headerRender}
                              fullCellRender={fullCellRender}
                              fullscreen={false}
                              onPanelChange={onPanelChange}
                              onSelect={onDateChange}
                              disabled/>
                </Spin>
            </div>
            <div className={'px-4 py-3 border-t border-[#ddd] dark:border-[#474747] flex items-center gap-5 text-xl'}>
                <Tooltip title="上传文件">
                    <FolderAddOutlined className={'cursor-pointer'}/>
                </Tooltip>
                <Tooltip title="从我的文件选择">
                    <FolderOutlined className={'cursor-pointer'}/>
                    {/*<FolderOpenOutlined className={'cursor-pointer'}/>*/}
                    {/*<FolderViewOutlined className={'cursor-pointer'}/>*/}
                </Tooltip>
                {/*<Tooltip title="上传并保存到我的文件">*/}
                {/*    <UploadOutlined className={'cursor-pointer'}/>*/}
                {/*</Tooltip>*/}

            </div>
            <div className={'h-full'}>
                <TextArea
                    variant={'borderless'}
                    placeholder="请输入文本内容或者粘贴文件"
                    style={{
                        height: '100%',
                        resize: 'none'
                    }}
                />
            </div>
        </div>
    }

    return <div className={cx({
        'flex flex-row': true,
        'container': true
    })}>
        <div className={'hidden lg:block'}>
            {renderLeft()}
        </div>
        <div
            className={'flex flex-col w-full h-screen overflow-y-auto lg:border-l border-[#ddd] dark:border-[#474747] '}>
            <div className={'font-medium text-base p-3 border-b border-[#ddd] dark:border-[#474747] sticky top-0 bg-white flex items-center gap-2'}>
                <div className={'lg:hidden cursor-pointer'} onClick={()=>setOpenDrawer(true)}>
                    <PicLeftOutlined />
                </div>
                <div>记事本</div>
            </div>
            <div className={'px-[16px] py-[16px] flex items-start flex-row gap-[22px] overflow-y-auto'}>
                {/*<div className={'hidden items-center flex-col lg:flex'}>*/}
                {/*    <span className={'text-xl font-medium'}>*/}
                {/*        09*/}
                {/*    </span>*/}
                {/*    <span className={'text-sm'}>*/}
                {/*        11*/}
                {/*    </span>*/}
                {/*</div>*/}
                <div className={'flex flex-col gap-4 w-full xl:max-w-[70%]'}>
                    <span className={'bg-[#eee] rounded-md py-2 px-3 w-auto max-w-max text-sm'}>
                        k logs testapi-seaurl-space-service-68bcbcdc56-gwmz7 -nseaurl --tail 100k logs testapi-seaurl-space-service-68bcbcdc56-gwmz7 -nseaurl --tail 100k logs testapi-seaurl-space-service-68bcbcdc56-gwmz7 -nseaurl --tail 100k logs testapi-seaurl-space-service-68bcbcdc56-gwmz7 -nseaurl --tail 100k logs testapi-seaurl-space-service-68bcbcdc56-gwmz7 -nseaurl --tail 100k logs testapi-seaurl-space-service-68bcbcdc56-gwmz7 -nseaurl --tail 100
                    </span>
                </div>
            </div>
        </div>

        <Drawer className={styles.container} width={375} placement={'left'} onClose={()=>setOpenDrawer(false)} closable={false} open={openDrawer} styles={{
            body: {
                padding: '0',
            },
        }}>
            {renderLeft()}
        </Drawer>
    </div>
};

export default withRouter(NotePad);