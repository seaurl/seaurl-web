'use client'
import {Dropdown, Spin} from "antd";
import {DownOutlined} from "@ant-design/icons";

const STATUS_LIST = [
    {value: 0, label: '未开始', color: '#8c8c8c', bgColor: '#fafafa', borderColor: '#e9e9eb', dotColor: '#bfbfbf'},
    {value: 1, label: '进行中', color: '#1677ff', bgColor: '#e6f4ff', borderColor: '#91caff', dotColor: '#1677ff'},
    {value: 2, label: '已完成', color: '#52c41a', bgColor: '#f6ffed', borderColor: '#b7eb8f', dotColor: '#52c41a'},
    {value: 3, label: '已取消', color: '#ff4d4f', bgColor: '#fff2f0', borderColor: '#ffccc7', dotColor: '#ff4d4f'}
];

function calcTaskTotalHours(task) {
    if (!task.hours) return 0;
    return Object.values(task.hours).reduce((sum, h) => sum + (h || 0), 0);
}

function formatMoney(v) {
    if (v === null || v === undefined) return '0';
    return Number(v).toLocaleString('zh-CN', {maximumFractionDigits: 2});
}

export default function TaskView({tasks, loading, compact, onUpdateStatus}) {
    const grouped = STATUS_LIST.map(s => ({
        ...s,
        tasks: tasks.filter(t => (t.status === undefined || t.status === null ? 0 : t.status) === s.value)
    }));

    function buildStatusMenu(task) {
        return {
            items: STATUS_LIST.map(s => ({
                key: String(s.value),
                label: (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '2px 0',
                        color: task.status === s.value ? '#1677ff' : 'inherit',
                        fontWeight: task.status === s.value ? 600 : 400
                    }}>
                        <span style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: s.dotColor
                        }}/>
                        {s.label}
                        {task.status === s.value ? ' (当前)' : ''}
                    </div>
                ),
                onClick: () => {
                    if (task.status !== s.value) {
                        onUpdateStatus(task.id, s.value);
                    }
                }
            }))
        };
    }

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            padding: 16
        }}>
            <style>{`
                @media (max-width: 767px) {
                    .task-view-grid { flex-wrap: wrap !important; height: auto !important; }
                    .task-view-grid > div { flex: 1 1 45% !important; min-width: 0 !important; }
                }
            `}</style>
            <Spin spinning={loading} className="task-view-spin">
                <div className="task-view-grid" style={{
                    display: 'flex',
                    gap: 16,
                    width: '100%',
                    height: 'calc(100vh - 160px)'
                }}>
                    {grouped.map(col => (
                        <div key={col.value} style={{
                            backgroundColor: col.bgColor,
                            border: `1px solid ${col.borderColor}`,
                            borderRadius: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1,
                            minWidth: 0,
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                borderBottom: `1px solid ${col.borderColor}`,
                                flexShrink: 0
                            }}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                    <span style={{
                                        display: 'inline-block',
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: col.dotColor
                                    }}/>
                                    <span style={{fontSize: 14, fontWeight: 600, color: '#262626'}}>{col.label}</span>
                                </div>
                                <span style={{
                                    fontSize: 12,
                                    color: '#8c8c8c',
                                    backgroundColor: '#fff',
                                    padding: '1px 8px',
                                    borderRadius: 10,
                                    border: '1px solid #f0f0f0'
                                }}>
                                    {col.tasks.length}
                                </span>
                            </div>
                            <div style={{
                                padding: 8,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 6,
                                flex: 1,
                                overflowY: 'auto',
                                minHeight: 0
                            }}>
                                {col.tasks.length === 0 ? (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#bfbfbf',
                                        fontSize: 12,
                                        padding: '24px 0'
                                    }}>
                                        暂无任务
                                    </div>
                                ) : col.tasks.map(task => (
                                    <Dropdown key={task.id} menu={buildStatusMenu(task)} trigger={['click']}
                                              placement="bottomLeft">
                                        <div style={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: 6,
                                            padding: '8px 10px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 8,
                                            transition: 'all 0.2s',
                                            flexShrink: 0
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = col.dotColor;
                                            e.currentTarget.style.boxShadow = `0 2px 6px rgba(0,0,0,0.06)`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#f0f0f0';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                        >
                                            <div style={{flex: 1, minWidth: 0}}>
                                                <div style={{
                                                    fontSize: 13,
                                                    fontWeight: 500,
                                                    color: '#262626',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {task.name}
                                                </div>
                                                <div style={{
                                                    fontSize: 11,
                                                    color: '#8c8c8c',
                                                    marginTop: 2
                                                }}>
                                                    {task.totalHours && task.totalHours > 0 ? (
                                                        <div style={{display: 'flex', gap: 10}}>
                                                            <span>(<b style={{color: '#ff4d4f'}}>{Math.max(0, task.totalHours - calcTaskTotalHours(task)).toFixed(1)}</b>/{task.totalHours.toFixed(1)})h</span>
                                                            {task.outputValue > 0 && (
                                                                <span>(<b style={{color: '#ff4d4f'}}>{formatMoney(calcTaskTotalHours(task) > 0 ? 0 : task.outputValue)}</b>/{formatMoney(task.outputValue)})¥</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div style={{display: 'flex', gap: 10}}>
                                                            <span>工时 {calcTaskTotalHours(task).toFixed(1)}h</span>
                                                            {task.outputValue > 0 && (
                                                                <span>产值 ¥{formatMoney(task.outputValue)}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <DownOutlined style={{fontSize: 10, color: '#bfbfbf', flexShrink: 0}}/>
                                        </div>
                                    </Dropdown>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Spin>
        </div>
    );
}

