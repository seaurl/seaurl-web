'use client'
import {Table} from "antd";

function getWeekday(year, month, day) {
    return new Date(year, month - 1, day).getDay();
}

function formatMoney(v) {
    if (v === null || v === undefined) return '0';
    return Number(v).toLocaleString('zh-CN', {maximumFractionDigits: 2});
}

export default function OutputView({
    tasks,
    year,
    month,
    loading,
    compact
}) {
    const dayWidth = compact ? 50 : 70;
    const nameWidth = compact ? 160 : 240;
    const totalWidth = compact ? 70 : 90;
    const daysInMonth = new Date(year, month, 0).getDate();

    function calcHoursTotal(task) {
        if (!task.hours) return 0;
        return Object.values(task.hours).reduce((sum, h) => sum + (h || 0), 0);
    }

    function calcDayOutput(task, day) {
        if (!task.outputValue || task.outputValue <= 0) {
            return 0;
        }
        const dayHours = task.hours ? (task.hours[String(day)] || 0) : 0;
        if (dayHours <= 0) return 0;
        const filledHours = calcHoursTotal(task);
        if (filledHours <= 0) return 0;
        const rate = task.outputValue / filledHours;
        return dayHours * rate;
    }

    function calcRowTotal(task) {
        if (!task.outputValue || task.outputValue <= 0) {
            return 0;
        }
        const filledHours = calcHoursTotal(task);
        if (filledHours <= 0) return 0;
        return task.outputValue;
    }

    function calcColTotal(day) {
        return tasks.reduce((sum, t) => sum + calcDayOutput(t, day), 0);
    }

    function calcGrandTotal() {
        return tasks.reduce((sum, t) => {
            const st = t.status === undefined || t.status === null ? 0 : t.status;
            if (st === 3) return sum;
            return sum + calcRowTotal(t);
        }, 0);
    }

    const dayColumns = [];
    for (let d = 1; d <= daysInMonth; d++) {
        const weekday = getWeekday(year, month, d);
        const isWeekend = weekday === 0 || weekday === 6;
        const isSaturday = weekday === 6;
        const bg = isSaturday ? '#fffbe6' : (weekday === 0 ? '#fff1f0' : undefined);
        dayColumns.push({
            title: (
                <div style={{textAlign: 'center'}}>
                    <div>{d}</div>
                    <div style={{fontSize: 11, color: isWeekend ? (isSaturday ? '#faad14' : '#ff4d4f') : '#999'}}>
                        {['日', '一', '二', '三', '四', '五', '六'][weekday]}
                    </div>
                </div>
            ),
            dataIndex: String(d),
            width: dayWidth,
            align: 'center',
            onHeaderCell: () => ({
                style: {backgroundColor: bg}
            }),
            onCell: () => ({
                style: {backgroundColor: bg}
            }),
            render: (_, record) => {
                const val = calcDayOutput(record, d);
                return val > 0 ? (
                    <span style={{fontWeight: 500}}>{formatMoney(val)}</span>
                ) : (
                    <span style={{color: '#d9d9d9'}}>—</span>
                );
            }
        });
    }

    const columns = [
        {
            title: <span style={{fontWeight: 600}}>任务名称</span>,
            dataIndex: 'name',
            key: 'name',
            fixed: 'left',
            width: nameWidth,
            render: (text, record) => {
                const filledHours = calcHoursTotal(record);
                const hasTotal = record.totalHours && record.totalHours > 0;
                const remaining = hasTotal ? Math.max(0, record.totalHours - filledHours) : 0;
                return (
                    <div style={{flex: 1, minWidth: 0}}>
                        <div>{text}</div>
                        {hasTotal && (
                            <div style={{fontSize: 11, color: '#8c8c8c', marginTop: 2}}>
                                    <div style={{display: 'flex', gap: 8}}>
                                        <span>(<b style={{color: '#ff4d4f'}}>{remaining.toFixed(1)}</b>/{record.totalHours.toFixed(1)})h</span>
                                        {record.outputValue > 0 && (
                                            <span>(<b style={{color: '#ff4d4f'}}>{formatMoney(filledHours > 0 ? 0 : record.outputValue)}</b>/{formatMoney(record.outputValue)})¥</span>
                                        )}
                                    </div>
                            </div>
                        )}
                    </div>
                );
            }
        },
        ...dayColumns,
        {
            title: '合计',
            key: 'total',
            fixed: 'right',
            width: totalWidth,
            align: 'center',
            render: (_, record) => {
                const total = calcRowTotal(record);
                if (total === 0) return <span style={{color: '#d9d9d9'}}>-</span>;
                return <span style={{fontWeight: 600}}>¥{formatMoney(total)}</span>;
            }
        }
    ];

    return (
        <div className="output-table-wrap" style={{flex: 1, overflow: 'auto'}}>
            <style>{`
                .output-table-wrap .ant-table-container {
                    border-left: none !important;
                }
                .output-table-wrap .ant-table-cell-fix-left:first-child {
                    border-left: none !important;
                }
                .output-table-wrap .ant-table-thead > tr > th:first-child {
                    border-left: none !important;
                }
                .output-table-wrap .ant-table-tbody > tr:hover > td {
                    background-color: #fff7e6 !important;
                }
            `}</style>
            <Table
                columns={columns}
                dataSource={tasks}
                rowKey="id"
                pagination={false}
                loading={loading}
                sticky
                scroll={{x: nameWidth + daysInMonth * dayWidth + totalWidth}}
                size="small"
                bordered
                locale={{emptyText: '暂无任务，点击「添加任务」开始记录'}}
                summary={() => (
                    <Table.Summary fixed>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} fixed="left">
                                <span style={{fontWeight: 600}}>合计</span>
                            </Table.Summary.Cell>
                            {Array.from({length: daysInMonth}, (_, i) => i + 1).map(d => {
                                const colTotal = calcColTotal(d);
                                const weekday = getWeekday(year, month, d);
                                const isSaturday = weekday === 6;
                                const cellBg = isSaturday ? '#fffbe6' : (weekday === 0 ? '#fff1f0' : undefined);
                                return (
                                    <Table.Summary.Cell
                                        key={d}
                                        index={d}
                                        align="center"
                                        style={{backgroundColor: cellBg}}
                                    >
                                        {colTotal > 0 ? (
                                            <span style={{fontWeight: 600}}>{formatMoney(colTotal)}</span>
                                        ) : ''}
                                    </Table.Summary.Cell>
                                );
                            })}
                            <Table.Summary.Cell index={daysInMonth + 1} fixed="right" align="center">
                                <span style={{fontWeight: 700}}>
                                    ¥{formatMoney(calcGrandTotal())}
                                </span>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
                )}
            />
        </div>
    );
}
