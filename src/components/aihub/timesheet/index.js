'use client'
import {useEffect, useMemo, useState} from "react";
import {useSession} from "next-auth/react";
import {useSearchParams} from "next/navigation";
import {useDispatch} from "react-redux";
import {queryUserAiTools, updateDt} from "@/lib/slices/aiSpaceSlice";
import {AutoComplete, Button, DatePicker, Input, InputNumber, message, Modal, Radio, Select, Tooltip} from "antd";
import {
    AlertOutlined,
    CopyOutlined,
    LeftOutlined,
    PlusOutlined,
    RightOutlined,
    SearchOutlined,
    SnippetsOutlined
} from "@ant-design/icons";
import WorkHoursView from "./workHoursView";
import TaskView from "./taskView";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST;

const STATUS_OPTIONS = [
    {label: '未开始', value: 0},
    {label: '进行中', value: 1},
    {label: '已完成', value: 2},
    {label: '已取消', value: 3}
];

const VIEW_OPTIONS = [
    {label: '产值工时', value: 'workHours'},
    {label: '任务视图', value: 'task'}
];

function calcTaskHours(task) {
    if (!task.hours) return 0;
    return Object.values(task.hours).reduce((sum, h) => sum + (h || 0), 0);
}

function formatMoney(v) {
    if (v === null || v === undefined) return '0';
    return Number(v).toLocaleString('zh-CN', {maximumFractionDigits: 2});
}

export default function Timesheet() {
    const {data: session} = useSession();
    const dispatch = useDispatch();
    const query = useSearchParams();
    const [isUpdate, setUpdate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [year, setYear] = useState(() => new Date().getFullYear());
    const [month, setMonth] = useState(() => new Date().getMonth() + 1);
    const [activeTab, setActiveTab] = useState('workHours');
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [copying, setCopying] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskDate, setNewTaskDate] = useState(null);
    const [newTaskHours, setNewTaskHours] = useState(null);
    const [newTaskStatus, setNewTaskStatus] = useState(0);
    const [newTaskOutput, setNewTaskOutput] = useState(null);
    const [newTaskCategory, setNewTaskCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [filterCategory, setFilterCategory] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchGlobal, setSearchGlobal] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const [compact, setCompact] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [editName, setEditName] = useState('');
    const [editStatus, setEditStatus] = useState(0);
    const [editOutput, setEditOutput] = useState(null);
    const [editCategory, setEditCategory] = useState('');
    const [editTotalHours, setEditTotalHours] = useState(null);

    useEffect(() => {
        function check() { setCompact(window.innerWidth < 768); }
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const token = session?.accessToken || '';
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;

    useEffect(() => {
        if (token) {
            fetchData();
            fetchCategories();
        }
    }, [token, year, month]);

    useEffect(() => {
        if (searchKeyword.trim() === '') {
            setSearchResults(null);
            return;
        }
        const timer = setTimeout(() => doSearch(), 300);
        return () => clearTimeout(timer);
    }, [searchKeyword, searchGlobal]);

    function fetchCategories() {
        fetch(`${API_HOST}/space/crud/timesheet/categories`, {
            headers: {'token-id': token}
        }).then(r => r.json()).then(json => {
            if (json.status === 0) setCategories(json.data || []);
        }).catch(() => {});
    }

    async function doSearch() {
        setSearching(true);
        try {
            const params = new URLSearchParams({
                keyword: searchKeyword.trim(),
                global: String(searchGlobal)
            });
            if (!searchGlobal) {
                params.set('year', year);
                params.set('month', month);
            }
            const res = await fetch(`${API_HOST}/space/crud/timesheet/search?${params}`, {
                headers: {'token-id': token}
            });
            const json = await res.json();
            if (json.status === 0) {
                setSearchResults(json.data || []);
            }
        } catch (e) {
        } finally {
            setSearching(false);
        }
    }

    const displayTasks = useMemo(() => {
        if (!filterCategory) return tasks;
        return tasks.filter(t => (t.category || '') === filterCategory);
    }, [tasks, filterCategory]);

    const effectiveTasks = searchResults !== null ? searchResults : displayTasks;

    const stats = useMemo(() => {
        const valid = tasks.filter(t => (t.status === undefined || t.status === null ? 0 : t.status) !== 3);
        const done = valid.filter(t => (t.status === undefined || t.status === null ? 0 : t.status) === 2);
        const totalHours = valid.reduce((s, t) => s + calcTaskHours(t), 0);
        const totalOutput = valid.reduce((s, t) => s + (t.outputValue || 0), 0);
        const completionRate = valid.length === 0 ? 0 : (done.length / valid.length) * 100;
        const avgRate = totalHours === 0 ? 0 : totalOutput / totalHours;
        return {
            totalTasks: valid.length,
            doneTasks: done.length,
            totalHours,
            totalOutput,
            completionRate,
            avgRate
        };
    }, [tasks]);

    const unfilledDays = useMemo(() => {
        if (!isCurrentMonth) return 0;
        const todayDate = today.getDate();
        const filled = new Set();
        tasks.forEach(t => {
            if (!t.hours) return;
            const st = t.status === undefined || t.status === null ? 0 : t.status;
            if (st === 3) return;
            Object.keys(t.hours).forEach(d => {
                if (t.hours[d]) filled.add(Number(d));
            });
        });
        let missing = 0;
        for (let d = 1; d <= todayDate; d++) {
            if (!filled.has(d)) missing++;
        }
        return missing;
    }, [tasks, isCurrentMonth, today]);

    function globalUpdate() {
        if (!isUpdate) {
            const usedId = query.get('usedId');
            if (usedId) {
                dispatch(updateDt({usedId}));
                dispatch(queryUserAiTools());
            }
            setUpdate(true);
        }
    }

    async function fetchData() {
        setLoading(true);
        try {
            const res = await fetch(`${API_HOST}/space/crud/timesheet/query?year=${year}&month=${month}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'token-id': token
                }
            });
            const json = await res.json();
            if (json.status === 0) {
                setTasks(json.data || []);
            } else {
                message.error('加载失败');
            }
        } catch (e) {
            message.error('加载失败');
        } finally {
            setLoading(false);
        }
    }

    async function handleAddTask() {
        if (!newTaskName.trim()) {
            message.warning('请输入任务名称');
            return;
        }
        const trimmedName = newTaskName.trim();
        let taskYear = year;
        let taskMonth = month;
        const hasDate = newTaskDate && newTaskDate.isValid();
        if (hasDate) {
            taskYear = newTaskDate.year();
            taskMonth = newTaskDate.month() + 1;
        }
        const hasHours = newTaskHours !== null && newTaskHours !== undefined && newTaskHours !== '';
        const hasOutput = newTaskOutput !== null && newTaskOutput !== undefined && newTaskOutput !== '';
        const outputValue = hasOutput ? Number(newTaskOutput) : 0;
        const requestBody = {
            name: trimmedName,
            year: taskYear,
            month: taskMonth,
            status: newTaskStatus,
            outputValue,
            category: newTaskCategory || ''
        };
        if (hasHours) {
            requestBody.totalHours = Number(newTaskHours);
        }
        try {
            const res = await fetch(`${API_HOST}/space/crud/timesheet/addTask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token-id': token
                },
                body: JSON.stringify(requestBody)
            });
            const json = await res.json();
            if (json.status === 0) {
                const taskId = json.data.id;
                const day = hasDate ? newTaskDate.date() : null;
                if (hasDate && hasHours) {
                    await fetch(`${API_HOST}/space/crud/timesheet/updateHour`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'token-id': token
                        },
                        body: JSON.stringify({taskId, day, hours: Number(newTaskHours)})
                    });
                }
                if (hasDate && hasOutput) {
                    await fetch(`${API_HOST}/space/crud/timesheet/updateOutput`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'token-id': token
                        },
                        body: JSON.stringify({taskId, day, outputValue: Number(newTaskOutput)})
                    });
                }
                resetAddForm();
                setAddModalOpen(false);
                setYear(taskYear);
                setMonth(taskMonth);
                fetchData();
                fetchCategories();
            } else {
                message.error('添加失败');
            }
        } catch (e) {
            message.error('添加失败');
        }
    }

    function resetAddForm() {
        setNewTaskName('');
        setNewTaskDate(null);
        setNewTaskHours(null);
        setNewTaskStatus(0);
        setNewTaskOutput(null);
        setNewTaskCategory('');
    }

    async function handleDeleteTask(taskId) {
        try {
            const res = await fetch(`${API_HOST}/space/crud/timesheet/deleteTask?taskId=${taskId}`, {
                headers: {'token-id': token}
            });
            const json = await res.json();
            if (json.status === 0) {
                fetchData();
            } else {
                message.error('删除失败');
            }
        } catch (e) {
            message.error('删除失败');
        }
    }

    async function handleRenameTask(taskId, name) {
        if (!name || !name.trim()) return;
        try {
            const res = await fetch(`${API_HOST}/space/crud/timesheet/renameTask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token-id': token
                },
                body: JSON.stringify({taskId, name: name.trim()})
            });
            const json = await res.json();
            if (json.status === 0) {
                fetchData();
            } else {
                message.error('重命名失败');
            }
        } catch (e) {
            message.error('重命名失败');
        }
    }

    function openEditModal(task) {
        setEditTask(task);
        setEditName(task.name || '');
        setEditStatus(task.status === undefined || task.status === null ? 0 : task.status);
        setEditOutput(task.outputValue != null && task.outputValue !== 0 ? task.outputValue : null);
        setEditCategory(task.category || '');
        setEditTotalHours(task.totalHours != null ? task.totalHours : null);
        setEditModalOpen(true);
    }

    async function handleUpdateTask() {
        if (!editTask) return;
        if (!editName.trim()) {
            message.warning('请输入任务名称');
            return;
        }
        const hasOutput = editOutput !== null && editOutput !== undefined && editOutput !== '';
        const hasTotalHours = editTotalHours !== null && editTotalHours !== undefined && editTotalHours !== '';
        try {
            const res = await fetch(`${API_HOST}/space/crud/timesheet/updateTask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token-id': token
                },
                body: JSON.stringify({
                    taskId: editTask.id,
                    name: editName.trim(),
                    status: editStatus,
                    outputValue: hasOutput ? Number(editOutput) : 0,
                    category: editCategory || '',
                    totalHours: hasTotalHours ? Number(editTotalHours) : null
                })
            });
            const json = await res.json();
            if (json.status === 0) {
                setEditModalOpen(false);
                setEditTask(null);
                fetchData();
            } else {
                message.error('更新失败');
            }
        } catch (e) {
            message.error('更新失败');
        }
    }

    async function handleUpdateHour(taskId, day, hours) {
        const finalHours = hours === '' || hours === null || hours === undefined ? null : Number(hours);
        if (finalHours !== null && (finalHours < 0 || finalHours > 24)) {
            message.warning('工时应在 0-24 之间');
            return;
        }
        try {
            const res = await fetch(`${API_HOST}/space/crud/timesheet/updateHour`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token-id': token
                },
                body: JSON.stringify({taskId, day, hours: finalHours})
            });
            const json = await res.json();
            if (json.status === 0) {
                fetchData();
            } else {
                message.error('保存失败');
            }
        } catch (e) {
            message.error('保存失败');
        }
    }

    async function handleUpdateOutput(taskId, day, value) {
        const finalValue = value === '' || value === null || value === undefined ? null : Number(value);
        if (finalValue !== null && finalValue < 0) {
            message.warning('产值不能为负数');
            return;
        }
        try {
            const res = await fetch(`${API_HOST}/space/crud/timesheet/updateOutput`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token-id': token
                },
                body: JSON.stringify({taskId, day, outputValue: finalValue})
            });
            const json = await res.json();
            if (json.status === 0) {
                fetchData();
            } else {
                message.error('保存失败');
            }
        } catch (e) {
            message.error('保存失败');
        }
    }

    async function handleUpdateStatus(taskId, status) {
        try {
            const res = await fetch(`${API_HOST}/space/crud/timesheet/updateStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token-id': token
                },
                body: JSON.stringify({taskId, status})
            });
            const json = await res.json();
            if (json.status === 0) {
                message.success('状态已更新');
                fetchData();
            } else {
                message.error('状态更新失败');
            }
        } catch (e) {
            message.error('状态更新失败');
        }
    }

    async function handleCopySummary() {
        if (tasks.length === 0) return;
        const lines = tasks.map((t, i) => {
            const hours = calcTaskHours(t);
            const output = Number(t.outputValue) || 0;
            const parts = [`${i + 1}、${t.name}`];
            if (hours > 0) parts.push(`${hours.toFixed(1)}小时`);
            if (output > 0) parts.push(`${formatMoney(output)}产值`);
            return parts.join('　');
        });
        const text = `任务：\n${lines.join('\n')}`;
        try {
            await navigator.clipboard.writeText(text);
            message.success(`已复制 ${tasks.length} 个任务`);
        } catch (e) {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                message.success(`已复制 ${tasks.length} 个任务`);
            } catch (e2) {
                message.error('复制失败,请手动选择');
            }
            document.body.removeChild(ta);
        }
    }

    async function handleCopyLastMonth() {
        if (copying) return;
        if (tasks.length > 0) {
            message.warning('当前月已有任务，无法复制');
            return;
        }
        setCopying(true);
        try {
            const res = await fetch(`${API_HOST}/space/crud/timesheet/copyLastMonth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token-id': token
                },
                body: JSON.stringify({year, month})
            });
            const json = await res.json();
            if (json.status === 0) {
                const n = json.data;
                if (n === 0) {
                    message.info('上月无任务可复制');
                } else {
                    message.success(`已复制 ${n} 个任务`);
                    fetchData();
                }
            } else {
                message.error('复制失败');
            }
        } catch (e) {
            message.error('复制失败');
        } finally {
            setCopying(false);
        }
    }

    function changeMonth(delta) {
        let m = month + delta;
        let y = year;
        if (m < 1) {
            m = 12;
            y--;
        }
        if (m > 12) {
            m = 1;
            y++;
        }
        setMonth(m);
        setYear(y);
    }

    function openAddModal() {
        setAddModalOpen(true);
    }

    const statCards = [
        {label: '总工时', value: `${stats.totalHours.toFixed(1)}h`, color: '#1677ff', bg: '#e6f4ff'},
        {label: '任务数', value: `${stats.doneTasks}/${stats.totalTasks}`, color: '#722ed1', bg: '#f9f0ff'},
        {label: '完成率', value: `${stats.completionRate.toFixed(0)}%`, color: '#52c41a', bg: '#f6ffed'},
        {label: '总产值', value: `¥${formatMoney(stats.totalOutput)}`, color: '#fa8c16', bg: '#fff7e6'},
        {label: '平均时薪', value: stats.avgRate > 0 ? `¥${formatMoney(stats.avgRate)}/h` : '-', color: '#13c2c2', bg: '#e6fffb'}
    ];

    return (
        <>
            <style>{`
                @media (max-width: 767px) {
                    .timesheet-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .timesheet-view-toolbar { flex-wrap: wrap !important; gap: 8px !important; }
                    .timesheet-search-row { flex-wrap: wrap !important; }
                    .timesheet-search-row .ant-input { width: 100% !important; }
                    .timesheet-month-bar { flex-wrap: wrap !important; }
                    .timesheet-top-bar { height: auto !important; flex-wrap: wrap !important; gap: 6px !important; padding: 8px 12px !important; }
                    .timesheet-date-info { font-size: 11px !important; padding: 2px 8px !important; height: 26px !important; }
                }
            `}</style>
            <div style={{height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}
                 onClick={globalUpdate}>
            <div className="timesheet-top-bar" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 12px',
                height: 48,
                flexShrink: 0,
                borderBottom: '1px solid #f0f0f0'
            }}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <Button icon={<LeftOutlined/>} size="small" onClick={() => changeMonth(-1)}/>
                    <span style={{fontSize: 16, fontWeight: 600}}>{year}年{month}月</span>
                    <Button icon={<RightOutlined/>} size="small" onClick={() => changeMonth(1)}/>
                </div>
                <div className="timesheet-date-info" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 6,
                    padding: '2px 14px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#8c8c8c',
                    height: 32
                }}>
                    <span style={{fontSize: 15, fontWeight: 600, color: '#262626', marginRight: 8}}>
                        {`${month}月`}
                    </span>
                    <span style={{color: '#d9d9d9', marginRight: 8}}>|</span>
                    <span>{`${year}/${String(month).padStart(2, '0')}/01`}</span>
                    <span style={{margin: '0 6px', color: '#d9d9d9'}}>~</span>
                    <span>{`${year}/${String(month).padStart(2, '0')}/${daysInMonth}`}</span>
                    <span style={{
                        marginLeft: 10,
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#1677ff',
                        backgroundColor: '#e6f4ff'
                    }}>
                        {daysInMonth}天
                    </span>
                </div>
            </div>

            {unfilledDays > 0 && isCurrentMonth && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 12px',
                    backgroundColor: '#fffbe6',
                    borderBottom: '1px solid #ffe58f',
                    fontSize: 13,
                    color: '#ad6800',
                    flexShrink: 0
                }}>
                    <AlertOutlined style={{color: '#faad14'}}/>
                    <span>本月有 <b style={{color: '#d48806'}}>{unfilledDays}</b> 天未填工时，请及时补填</span>
                </div>
            )}

            <div className="timesheet-stat-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 8,
                padding: '8px 12px',
                flexShrink: 0,
                borderBottom: '1px solid #f0f0f0'
            }}>
                {statCards.map((c, i) => (
                    <div key={i} style={{
                        backgroundColor: c.bg,
                        borderRadius: 6,
                        padding: '6px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}>
                        <span style={{fontSize: 11, color: '#8c8c8c'}}>{c.label}</span>
                        <span style={{fontSize: 16, fontWeight: 700, color: c.color}}>{c.value}</span>
                    </div>
                ))}
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                flexShrink: 0,
                borderBottom: '1px solid #f0f0f0'
            }}>
                <Input
                    allowClear
                    size="middle"
                    placeholder="搜索任务名称..."
                    prefix={<SearchOutlined style={{color: '#bfbfbf'}}/>}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    style={{width: 220}}
                />
                <Select
                    size="middle"
                    placeholder="分类筛选"
                    allowClear
                    value={filterCategory || undefined}
                    onChange={(v) => setFilterCategory(v || '')}
                    style={{width: 140}}
                    options={categories.map(c => ({label: c, value: c}))}
                />
                {searchKeyword.trim() !== '' && (
                    <>
                        <span style={{fontSize: 12, color: searchGlobal ? '#1677ff' : '#8c8c8c'}}>
                            {searchGlobal ? '全局' : '当前月'}
                        </span>
                        <Radio.Group
                            size="small"
                            value={searchGlobal ? 'global' : 'month'}
                            onChange={(e) => setSearchGlobal(e.target.value === 'global')}
                            optionType="button"
                            buttonStyle="solid"
                        >
                            <Radio.Button value="month">本月</Radio.Button>
                            <Radio.Button value="global">全局</Radio.Button>
                        </Radio.Group>
                        {searchResults !== null && (
                            <span style={{fontSize: 12, color: '#8c8c8c'}}>
                                {searching ? '搜索中...' : `找到 ${searchResults.length} 条`}
                            </span>
                        )}
                    </>
                )}
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                flexShrink: 0,
                borderBottom: '1px solid #f0f0f0'
            }} className="timesheet-view-toolbar">
                <Radio.Group
                    options={VIEW_OPTIONS}
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                    size="large"
                />
                <div style={{display: 'flex', gap: 8}}>
                    {tasks.length === 0 && (
                        <Tooltip title="继承上月任务列表（状态重置为未开始）">
                            <Button
                                size="large"
                                icon={<CopyOutlined/>}
                                onClick={handleCopyLastMonth}
                                loading={copying}
                            >
                                复制上月
                            </Button>
                        </Tooltip>
                    )}
                    {tasks.length > 0 && (
                        <Tooltip title="复制当前月任务摘要到剪贴板">
                            <Button
                                size="large"
                                icon={<SnippetsOutlined/>}
                                onClick={handleCopySummary}
                            >
                                复制任务
                            </Button>
                        </Tooltip>
                    )}
                    <Button size="large" type="primary" icon={<PlusOutlined/>} onClick={openAddModal}>
                        添加任务
                    </Button>
                </div>
            </div>

            <div style={{flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
                {activeTab === 'workHours' && (
                    <WorkHoursView
                        tasks={effectiveTasks}
                        year={year}
                        month={month}
                        loading={loading}
                        compact={compact}
                        onUpdateHour={handleUpdateHour}
                        onAddTask={openAddModal}
                        onDeleteTask={handleDeleteTask}
                        onEditTask={openEditModal}
                    />
                )}
                {activeTab === 'task' && (
                    <TaskView
                        tasks={effectiveTasks}
                        loading={loading}
                        compact={compact}
                        onUpdateStatus={handleUpdateStatus}
                    />
                )}
            </div>

            <Modal
                title="添加任务"
                open={addModalOpen}
                onOk={handleAddTask}
                onCancel={() => {
                    setAddModalOpen(false);
                    resetAddForm();
                }}
                okText="添加"
                cancelText="取消"
            >
                <div style={{display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8}}>
                    <div>
                        <div style={{marginBottom: 6, color: '#666'}}>任务名称 <span style={{color: '#ff4d4f'}}>*</span></div>
                        <input
                            autoFocus
                            placeholder="请输入任务名称"
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d9d9d9',
                                borderRadius: 6,
                                fontSize: 14
                            }}
                        />
                    </div>
                    <div>
                        <div style={{marginBottom: 6, color: '#666'}}>任务状态</div>
                        <Radio.Group
                            options={STATUS_OPTIONS}
                            value={newTaskStatus}
                            onChange={(e) => setNewTaskStatus(e.target.value)}
                            optionType="button"
                            buttonStyle="solid"
                            size="large"
                        />
                    </div>
                    <div>
                        <div style={{marginBottom: 6, color: '#666'}}>产值（元）</div>
                        <InputNumber
                            style={{width: '100%'}}
                            min={0}
                            step={100}
                            value={newTaskOutput}
                            formatter={(v) => v === '' || v === null || v === undefined ? '' : String(v).replace(/[^\d.]/g, '')}
                            parser={(v) => v.replace(/[^\d.]/g, '')}
                            onChange={(v) => setNewTaskOutput(v)}
                            placeholder="如 5000"
                        />
                    </div>
                    <div>
                        <div style={{marginBottom: 6, color: '#666'}}>分类</div>
                        <AutoComplete
                            style={{width: '100%'}}
                            value={newTaskCategory}
                            onChange={(v) => setNewTaskCategory(v || '')}
                            placeholder="如：项目A / 日常 / 紧急"
                            options={categories.map(c => ({value: c}))}
                            filterOption={(input, option) =>
                                (option?.value || '').toLowerCase().includes(input.toLowerCase())
                            }
                            allowClear
                        />
                    </div>
                    <div>
                        <div style={{marginBottom: 6, color: '#666'}}>任务日期</div>
                        <DatePicker
                            style={{width: '100%'}}
                            value={newTaskDate}
                            onChange={(d) => setNewTaskDate(d)}
                            placeholder="选择日期"
                        />
                    </div>
                    <div>
                        <div style={{marginBottom: 6, color: '#666'}}>总工时（小时）</div>
                        <InputNumber
                            style={{width: '100%'}}
                            min={0}
                            max={24}
                            step={0.5}
                            value={newTaskHours}
                            formatter={(v) => v === '' || v === null || v === undefined ? '' : String(v).replace(/[^\d.]/g, '')}
                            parser={(v) => v.replace(/[^\d.]/g, '')}
                            onChange={(v) => setNewTaskHours(v)}
                            placeholder="如 8"
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                title="编辑任务"
                open={editModalOpen}
                onOk={handleUpdateTask}
                onCancel={() => {
                    setEditModalOpen(false);
                    setEditTask(null);
                }}
                okText="保存"
                cancelText="取消"
            >
                <div style={{display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8}}>
                    <div>
                        <div style={{marginBottom: 6, color: '#666'}}>任务名称 <span style={{color: '#ff4d4f'}}>*</span></div>
                        <input
                            autoFocus
                            placeholder="请输入任务名称"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d9d9d9',
                                borderRadius: 6,
                                fontSize: 14
                            }}
                        />
                    </div>
                    <div>
                        <div style={{marginBottom: 6, color: '#666'}}>任务状态</div>
                        <Radio.Group
                            options={STATUS_OPTIONS}
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            optionType="button"
                            buttonStyle="solid"
                            size="large"
                        />
                    </div>
                    <div>
                        <div style={{marginBottom: 6, color: '#666'}}>产值（元）</div>
                        <InputNumber
                            style={{width: '100%'}}
                            min={0}
                            step={100}
                            value={editOutput}
                            formatter={(v) => v === '' || v === null || v === undefined ? '' : String(v).replace(/[^\d.]/g, '')}
                            parser={(v) => v.replace(/[^\d.]/g, '')}
                            onChange={(v) => setEditOutput(v)}
                            placeholder="如 5000"
                        />
                    </div>
                    <div>
                        <div style={{marginBottom: 6, color: '#666'}}>分类</div>
                        <AutoComplete
                            style={{width: '100%'}}
                            value={editCategory}
                            onChange={(v) => setEditCategory(v || '')}
                            placeholder="如：项目A / 日常 / 紧急"
                            options={categories.map(c => ({value: c}))}
                            filterOption={(input, option) =>
                                (option?.value || '').toLowerCase().includes(input.toLowerCase())
                            }
                            allowClear
                        />
                    </div>
                    <div>
                        <div style={{marginBottom: 6, color: '#666'}}>总工时（小时）</div>
                        <InputNumber
                            style={{width: '100%'}}
                            min={0}
                            max={999}
                            step={0.5}
                            value={editTotalHours}
                            formatter={(v) => v === '' || v === null || v === undefined ? '' : String(v).replace(/[^\d.]/g, '')}
                            parser={(v) => v.replace(/[^\d.]/g, '')}
                            onChange={(v) => setEditTotalHours(v)}
                            placeholder="如 8"
                        />
                    </div>
                </div>
            </Modal>
        </div>
        </>
    );
}
