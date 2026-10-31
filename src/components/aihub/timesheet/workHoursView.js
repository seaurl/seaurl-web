'use client'
import {useState} from "react";
import {InputNumber, Popconfirm, Table, Tooltip} from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";

function getWeekday(year, month, day) {
    return new Date(year, month - 1, day).getDay();
}

function formatMoney(v) {
    if (v === null || v === undefined) return '0';
    return Number(v).toLocaleString('zh-CN', {maximumFractionDigits: 2});
}

export default function WorkHoursView({
    tasks,
    year,
    month,
    loading,
    compact,
    onUpdateHour,
    onAddTask,
    onDeleteTask,
    onEditTask
}) {
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState(null);

    const dayWidth = compact ? 42 : 62;
    const nameWidth = compact ? 160 : 240;
    const totalWidth = compact ? 58 : 75;
    const daysInMonth = new Date(year, month, 0).getDate();

    function calcRowTotal(task) {
        if (!task.hours) return 0;
        return Object.values(task.hours).reduce((sum, h) => sum + (h || 0), 0);
    }

    function calcColTotal(day) {
        return tasks.reduce((sum, t) => {
            const h = t.hours ? t.hours[String(day)] : null;
            return sum + (h || 0);
        }, 0);
    }

    function calcGrandTotal() {
        return tasks.reduce((sum, t) => sum + calcRowTotal(t), 0);
    }

    function calcDayOutput(task, day) {
        if (!task.outputValue || task.outputValue <= 0) {
            return 0;
        }
        const dayHours = task.hours ? (task.hours[String(day)] || 0) : 0;
        if (dayHours <= 0) return 0;
        const filledHours = calcRowTotal(task);
        if (filledHours <= 0) return 0;
        return dayHours * (task.outputValue / filledHours);
    }

    function calcRowOutput(task) {
        if (!task.outputValue || task.outputValue <= 0) {
            return 0;
        }
        const filledHours = calcRowTotal(task);
        if (filledHours <= 0) return 0;
        return task.outputValue;
    }

    function calcColOutput(day) {
        return tasks.reduce((sum, t) => sum + calcDayOutput(t, day), 0);
    }

    function calcGrandOutput() {
        return tasks.reduce((sum, t) => {
            const st = t.status === undefined || t.status === null ? 0 : t.status;
            if (st === 3) return sum;
            return sum + calcRowOutput(t);
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
            onCell: (record) => ({
                onDoubleClick: () => {
                    if (editingCell !== `${record.id}-${d}`) {
                        setEditingCell(`${record.id}-${d}`);
                        const existing = record.hours ? record.hours[String(d)] : null;
                        setEditValue(existing !== undefined && existing !== null ? existing : '');
                    }
                },
                style: {
                    cursor: 'pointer',
                    backgroundColor: bg
                }
            }),
            render: (_, record) => {
                const cellKey = `${record.id}-${d}`;
                const val = record.hours ? record.hours[String(d)] : null;
                const output = calcDayOutput(record, d);
                if (editingCell === cellKey) {
                    return (
                        <InputNumber
                            autoFocus
                            size="small"
                            min={0}
                            max={24}
                            step={0.5}
                            value={editValue}
                            style={{width: 48}}
                            onClick={(e) => e.stopPropagation()}
                            formatter={(v) => v === '' || v === null || v === undefined ? '' : String(v).replace(/[^\d.]/g, '')}
                            parser={(v) => v.replace(/[^\d.]/g, '')}
                            onChange={(v) => setEditValue(v)}
                            onPressEnter={() => {
                                onUpdateHour(record.id, d, editValue);
                                setEditingCell(null);
                            }}
                            onBlur={() => {
                                onUpdateHour(record.id, d, editValue);
                                setEditingCell(null);
                            }}
                        />
                    );
                }
                return (
                    <div style={{lineHeight: 1.3}}>
                        <div>
                            {val !== null && val !== undefined ? (
                                <span style={{fontWeight: 500}}>{val}</span>
                            ) : (
                                <span style={{color: '#d9d9d9'}}>—</span>
                            )}
                        </div>
                        {output > 0 && (
                            <div style={{fontSize: 10, color: '#999'}}>
                                ¥{formatMoney(output)}
                            </div>
                        )}
                    </div>
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
            headerAlign: 'center',
            align: 'left',
            render: (text, record) => {
                const filled = calcRowTotal(record);
                const hasTotal = record.totalHours && record.totalHours > 0;
                const remaining = hasTotal ? Math.max(0, record.totalHours - filled) : 0;
                return (
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <div style={{flex: 1, minWidth: 0}}>
                            <div
                                style={{cursor: 'pointer'}}
                                onClick={() => onEditTask(record)}
                            >
                                {text}
                            </div>
                            {hasTotal && (
                                <div style={{fontSize: 11, color: '#8c8c8c', marginTop: 2}}>
                                    <div style={{display: 'flex', gap: 8}}>
                                        <span>(<b style={{color: '#ff4d4f'}}>{remaining.toFixed(1)}</b>/{record.totalHours.toFixed(1)})h</span>
                                        {record.outputValue > 0 && (
                                            <span>(<b style={{color: '#ff4d4f'}}>{formatMoney(filled > 0 ? 0 : record.outputValue)}</b>/{formatMoney(record.outputValue)})¥</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0}}>
                            <Tooltip title="编辑">
                                <EditOutlined
                                    style={{color: '#999', fontSize: 12, cursor: 'pointer'}}
                                    onClick={() => onEditTask(record)}
                                />
                            </Tooltip>
                            <Popconfirm
                                title="确定删除该任务？"
                                onConfirm={() => onDeleteTask(record.id)}
                            >
                                <DeleteOutlined style={{color: '#999', marginLeft: 4, fontSize: 12}}/>
                            </Popconfirm>
                        </div>
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
                const totalHours = calcRowTotal(record);
                const totalOutput = calcRowOutput(record);
                return (
                    <div style={{lineHeight: 1.3}}>
                        <div style={{fontWeight: 600, color: '#1677ff'}}>{totalHours.toFixed(1)}</div>
                        {totalOutput > 0 && (
                            <div style={{fontSize: 10, color: '#999'}}>¥{formatMoney(totalOutput)}</div>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <div style={{flex: 1, overflow: 'auto'}}>
            <style>{`
                .timesheet-table .ant-table-container {
                    border-left: none !important;
                }
                .timesheet-table .ant-table-cell-fix-left:first-child {
                    border-left: none !important;
                }
                .timesheet-table .ant-table-thead > tr > th:first-child {
                    border-left: none !important;
                }
                .timesheet-table .ant-table-tbody > tr:hover > td {
                    background-color: #f5f5f5 !important;
                }
            `}</style>
            <div className="timesheet-table">
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
                    locale={{emptyText: '暂无任务，点击「添加任务」开始记录工时'}}
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} fixed="left">
                                    <span style={{fontWeight: 600}}>合计</span>
                                </Table.Summary.Cell>
                                {Array.from({length: daysInMonth}, (_, i) => i + 1).map(d => {
                                    const colHours = calcColTotal(d);
                                    const colOutput = calcColOutput(d);
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
                                            <div style={{lineHeight: 1.3}}>
                                                <div>
                                                    {colHours > 0 ? (
                                                        <span style={{fontWeight: 600}}>{colHours.toFixed(1)}</span>
                                                    ) : ''}
                                                </div>
                                                {colOutput > 0 && (
                                                    <div style={{fontSize: 10, color: '#999'}}>
                                                        ¥{formatMoney(colOutput)}
                                                    </div>
                                                )}
                                            </div>
                                        </Table.Summary.Cell>
                                    );
                                })}
                                <Table.Summary.Cell index={daysInMonth + 1} fixed="right" align="center">
                                    <div style={{lineHeight: 1.3}}>
                                        <div>
                                            <span style={{fontWeight: 700, color: '#1677ff'}}>
                                                {calcGrandTotal().toFixed(1)}
                                            </span>
                                        </div>
                                        {calcGrandOutput() > 0 && (
                                            <div style={{fontSize: 10, color: '#999'}}>
                                                ¥{formatMoney(calcGrandOutput())}
                                            </div>
                                        )}
                                    </div>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        </Table.Summary>
                    )}
                />
            </div>
        </div>
    );
}
