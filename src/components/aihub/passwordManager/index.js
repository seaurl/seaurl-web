'use client'
import {useEffect, useRef, useState} from "react";
import {useSession} from "next-auth/react";
import {useDispatch} from "react-redux";
import {useSearchParams} from "next/navigation";
import {message, Popconfirm, Table, Button, Input, Select, TreeSelect, Modal, Tooltip, AutoComplete, Segmented, Dropdown, Drawer} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    FolderOutlined,
    DragOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    CopyOutlined,
    ReloadOutlined,
    LinkOutlined,
    AppstoreOutlined,
    UnorderedListOutlined,
    TagOutlined,
    MoreOutlined,
    CaretRightOutlined,
    CaretDownOutlined
} from "@ant-design/icons";
import {queryUserAiTools, updateDt} from "@/lib/slices/aiSpaceSlice";
import {Tree} from "react-arborist";
import {tile2nest} from "@/utils/help";


const API_HOST = process.env.NEXT_PUBLIC_API_HOST;
// 移动分类时表示「作为顶级分类」的虚拟根 value
const ROOT_SENTINEL = '__root__';

export default function PasswordManager() {
    const {data: session} = useSession();
    const token = session?.accessToken;
    const dispatch = useDispatch();
    const query = useSearchParams();

    const [passwords, setPasswords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filterCategoryId, setFilterCategoryId] = useState('');
    const [categories, setCategories] = useState([]);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [compact, setCompact] = useState(false);
    const [screenWidth, setScreenWidth] = useState(0);

    const [formTitle, setFormTitle] = useState('');
    const [formUsername, setFormUsername] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formUrl, setFormUrl] = useState('');
    const [formRepoUrl, setFormRepoUrl] = useState('');
    const [formRepoBranch, setFormRepoBranch] = useState('');
    const [formNotes, setFormNotes] = useState('');
    const [formCategoryId, setFormCategoryId] = useState('');
    const [formParentId, setFormParentId] = useState('');
    const [formColor, setFormColor] = useState('#1677ff');

    const [genLength, setGenLength] = useState(16);
    const [genUpper, setGenUpper] = useState(true);
    const [genLower, setGenLower] = useState(true);
    const [genNumbers, setGenNumbers] = useState(true);
    const [genSymbols, setGenSymbols] = useState(true);
    const [showGenerator, setShowGenerator] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
    const [editCategoryName, setEditCategoryName] = useState('');
    const [viewMode, setViewMode] = useState('card');
    const [childDrawerParent, setChildDrawerParent] = useState(null);
    const [addChildTo, setAddChildTo] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [treeHeight, setTreeHeight] = useState(0);
    const sidebarBodyRef = useRef(null);
    const [moveCategory, setMoveCategory] = useState(null);
    const [moveTarget, setMoveTarget] = useState('');
    const [showMoveCategoryModal, setShowMoveCategoryModal] = useState(false);

    useEffect(() => {
        const onResize = () => {
            const w = window.innerWidth;
            setScreenWidth(w);
            setCompact(w < 768);
        };
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // 侧栏树视口高度（react-arborist 需要数值高度）
    useEffect(() => {
        if (compact || !sidebarBodyRef.current) return;
        const el = sidebarBodyRef.current;
        const update = () => setTreeHeight(el.clientHeight);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [compact]);

    const sidebarWidth = compact ? 0 : (screenWidth < 1100 ? 180 : 220);
    const cardMinWidth = screenWidth < 1100 ? 260 : 320;

    const isUpdate = useState(false);

    function globalUpdate() {
        if (!isUpdate[0]) {
            const usedId = query.get('usedId')
            if (usedId) {
                dispatch(updateDt({usedId}))
                dispatch(queryUserAiTools())
            }
            isUpdate[1](true)
        }
    }

    useEffect(() => {
        if (token) {
            fetchCategories().then(() => fetchPasswords());
        }
    }, [token]);

    const fetchPasswords = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_HOST}/space/crud/password/query`, {
                headers: {'Content-Type': 'application/json', 'token-id': token}
            });
            const json = await res.json();
            if (json.status === 0) {
                setPasswords(json.data || []);
            } else {
                message.error('加载密码列表失败');
            }
        } catch (e) {
            message.error('加载密码列表失败');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_HOST}/space/crud/password/categories`, {
                headers: {'Content-Type': 'application/json', 'token-id': token}
            });
            const json = await res.json();
            if (json.status === 0) {
                const data = json.data || [];
                setCategories(data);
                if (data.length > 0 && !filterCategoryId) {
                    setFilterCategoryId(data[0].id);
                }
            }
        } catch (e) {
        }
    };

    const fetchSearch = async (keyword) => {
        if (!keyword?.trim()) {
            fetchPasswords();
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_HOST}/space/crud/password/search?keyword=${encodeURIComponent(keyword)}`, {
                headers: {'Content-Type': 'application/json', 'token-id': token}
            });
            const json = await res.json();
            if (json.status === 0) {
                setPasswords(json.data || []);
            } else {
                message.error('搜索失败');
            }
        } catch (e) {
            message.error('搜索失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSearch(searchKeyword);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchKeyword]);

    const resetForm = () => {
        setFormTitle('');
        setFormUsername('');
        setFormPassword('');
        setFormUrl('');
        setFormRepoUrl('');
        setFormRepoBranch('');
        setFormNotes('');
        setFormCategoryId('');
        setFormParentId('');
        setFormColor('#1677ff');
        setEditingEntry(null);
        setShowGenerator(false);
    };

    const openAddModal = (parentEntry) => {
        resetForm();
        setFormCategoryId(parentEntry?.categoryId || filterCategoryId || '');
        setFormParentId(parentEntry?.id || '');
        setAddModalOpen(true);
    };

    const openEditModal = (entry) => {
        setEditingEntry(entry);
        setFormTitle(entry.title);
        setFormUsername(entry.username);
        setFormPassword('');
        setFormUrl(entry.url || '');
        setFormRepoUrl(entry.repoUrl || '');
        setFormRepoBranch(entry.repoBranch || '');
        setFormNotes(entry.notes || '');
        setFormCategoryId(entry.categoryId || '');
        setFormParentId(entry.parentId || '');
        setFormColor(entry.color || '#52c41a');
        setEditModalOpen(true);
    };

    const handleAdd = async () => {
        if (!formCategoryId) {
            message.warning('请选择分类');
            return;
        }
        if (!formTitle.trim() || !formUsername.trim() || !formPassword.trim()) {
            message.warning('请填写标题、用户名和密码');
            return;
        }
        try {
            const res = await fetch(`${API_HOST}/space/crud/password/add`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'token-id': token},
                body: JSON.stringify({
                    title: formTitle.trim(),
                    username: formUsername.trim(),
                    password: formPassword,
                    url: formUrl.trim(),
                    repoUrl: formRepoUrl.trim(),
                    repoBranch: formRepoBranch.trim(),
                    notes: formNotes.trim(),
                    categoryId: formCategoryId,
                    parentId: formParentId || '',
                    color: formColor
                })
            });
            const json = await res.json();
            if (json.status === 0) {
                message.success('添加成功');
                setAddModalOpen(false);
                resetForm();
                fetchPasswords();
                fetchCategories();
            } else {
                message.error('添加失败');
            }
        } catch (e) {
            message.error('添加失败');
        }
    };

    const handleUpdate = async () => {
        if (!formTitle.trim() || !formUsername.trim()) {
            message.warning('请填写标题和用户名');
            return;
        }
        try {
            const res = await fetch(`${API_HOST}/space/crud/password/update`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'token-id': token},
                body: JSON.stringify({
                    id: editingEntry.id,
                    title: formTitle.trim(),
                    username: formUsername.trim(),
                    password: formPassword,
                    url: formUrl.trim(),
                    repoUrl: formRepoUrl.trim(),
                    repoBranch: formRepoBranch.trim(),
                    notes: formNotes.trim(),
                    categoryId: formCategoryId,
                    parentId: formParentId || '',
                    color: formColor
                })
            });
            const json = await res.json();
            if (json.status === 0) {
                message.success('更新成功');
                setEditModalOpen(false);
                resetForm();
                fetchPasswords();
                fetchCategories();
            } else {
                message.error('更新失败');
            }
        } catch (e) {
            message.error('更新失败');
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API_HOST}/space/crud/password/delete?id=${id}`, {
                headers: {'Content-Type': 'application/json', 'token-id': token}
            });
            const json = await res.json();
            if (json.status === 0) {
                message.success('删除成功');
                fetchPasswords();
            } else {
                message.error('删除失败');
            }
        } catch (e) {
            message.error('删除失败');
        }
    };

    const handleAddCategory = async () => {
        const name = newCategoryName.trim();
        if (!name) {
            message.warning('请输入分类名称');
            return false;
        }
        try {
            const res = await fetch(`${API_HOST}/space/crud/password/category/add`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'token-id': token},
                body: JSON.stringify({category: name, parentId: addChildTo || ''})
            });
            const json = await res.json();
            if (json.status === 0) {
                message.success('分类已添加');
                setNewCategoryName('');
                setShowCategoryModal(false);
                setAddChildTo(null);
                fetchCategories();
                return true;
            } else {
                message.error(json?.message || '添加分类失败');
                return false;
            }
        } catch (e) {
            message.error('添加分类失败');
            return false;
        }
    };

    const handleEditCategory = async () => {
        const newName = editCategoryName.trim();
        if (!newName) {
            message.warning('请输入分类名称');
            return false;
        }
        if (!editingCategory) return false;
        try {
            const res = await fetch(`${API_HOST}/space/crud/password/category/rename`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'token-id': token},
                body: JSON.stringify({id: editingCategory.id, newCategory: newName})
            });
            const json = await res.json();
            if (json.status === 0) {
                message.success('分类已更新');
                setShowEditCategoryModal(false);
                setEditingCategory(null);
                fetchCategories();
                return true;
            } else {
                message.error(json?.message || '更新分类失败');
                return false;
            }
        } catch (e) {
            message.error('更新分类失败');
            return false;
        }
    };

    const handleDeleteCategory = async (target) => {
        if (!target) return;
        const targetId = target.id;
        try {
            const res = await fetch(`${API_HOST}/space/crud/password/category/delete`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'token-id': token},
                body: JSON.stringify({id: targetId})
            });
            const json = await res.json();
            if (json.status === 0) {
                message.success('分类已删除');
                if (filterCategoryId === targetId) {
                    setFilterCategoryId('');
                }
                fetchCategories();
            } else {
                message.error(json?.message || '删除分类失败');
            }
        } catch (e) {
            message.error('删除分类失败');
        }
    };

    const handleMoveCategory = async () => {
        if (!moveCategory) return false;
        const parentId = (moveTarget === ROOT_SENTINEL || !moveTarget) ? '' : moveTarget;
        const currentParent = moveCategory.parentId || '';
        if (parentId === currentParent) {
            message.info('分类位置未变化');
            setShowMoveCategoryModal(false);
            setMoveCategory(null);
            setMoveTarget('');
            return true;
        }
        try {
            const res = await fetch(`${API_HOST}/space/crud/password/category/move`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'token-id': token},
                body: JSON.stringify({id: moveCategory.id, parentId})
            });
            const json = await res.json();
            if (json.status === 0) {
                message.success('分类已移动');
                setShowMoveCategoryModal(false);
                setMoveCategory(null);
                setMoveTarget('');
                fetchCategories();
                return true;
            } else {
                message.error(json?.message || '移动失败');
                return false;
            }
        } catch (e) {
            message.error('移动失败');
            return false;
        }
    };

    const togglePasswordVisible = (id) => {
        setVisiblePasswords(prev => ({...prev, [id]: !prev[id]}));
    };

    const copyPassword = (entry) => {
        const text = entry.passwordEncrypted || '';
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                message.success('密码已复制到剪贴板');
            });
        } else {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            message.success('密码已复制到剪贴板');
        }
    };

    const copyUsername = (entry) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(entry.username).then(() => {
                message.success('用户名已复制');
            });
        }
    };

    const generatePassword = () => {
        let chars = '';
        if (genUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (genLower) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (genNumbers) chars += '0123456789';
        if (genSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        if (!chars) {
            message.warning('请至少选择一种字符类型');
            return;
        }
        const array = new Uint32Array(genLength);
        crypto.getRandomValues(array);
        let result = '';
        for (let i = 0; i < genLength; i++) {
            result += chars[array[i] % chars.length];
        }
        setFormPassword(result);
        setShowGenerator(false);
    };

    const collectDescendantIds = (nodes, id) => {
        const result = new Set(id ? [id] : []);
        const stack = id ? [id] : [];
        while (stack.length) {
            const cur = stack.pop();
            nodes.forEach(n => {
                if (n.parentId === cur && !result.has(n.id)) {
                    result.add(n.id);
                    stack.push(n.id);
                }
            });
        }
        return result;
    };

    const nameToCategoryId = {};
    categories.forEach(c => {
        nameToCategoryId[c.name] = c.id;
    });

    const filteredPasswords = (() => {
        if (!filterCategoryId) return passwords;
        const ids = collectDescendantIds(categories, filterCategoryId);
        return passwords.filter(p => {
            const cid = p.categoryId || nameToCategoryId[p.category]; // 老 entry 无 categoryId 时按名 fallback
            return ids.has(cid);
        });
    })();

    const parentOptions = filteredPasswords.filter(p => !p.parentId);

    const treePasswords = (() => {
        const map = {};
        filteredPasswords.forEach(p => {
            map[p.id] = {...p, children: []};
        });
        const roots = [];
        filteredPasswords.forEach(p => {
            if (p.parentId && map[p.parentId]) {
                map[p.parentId].children.push(map[p.id]);
            } else {
                roots.push(map[p.id]);
            }
        });
        const cleanup = (nodes) => {
            nodes.forEach(n => {
                if (n.children.length === 0) {
                    delete n.children;
                } else {
                    cleanup(n.children);
                }
            });
        };
        cleanup(roots);
        return roots;
    })();

    const columns = [
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            width: compact ? 100 : 150,
            render: (text, record) => (
                <span style={{
                    fontWeight: record.children ? 600 : 400,
                    color: record.children ? '#1677ff' : '#262626'
                }}>
                    {text}
                </span>
            )
        },
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            width: compact ? 100 : 150,
            render: (text, record) => (
                <span>
                    {text}
                    <CopyOutlined
                        style={{marginLeft: 6, color: '#bfbfbf', cursor: 'pointer'}}
                        onClick={() => copyUsername(record)}
                    />
                </span>
            )
        },
        {
            title: '密码',
            dataIndex: 'passwordEncrypted',
            key: 'password',
            width: compact ? 100 : 180,
            render: (text, record) => (
                <span style={{fontFamily: 'monospace'}}>
                    {visiblePasswords[record.id] ? text : '••••••••'}
                    <span style={{marginLeft: 6}}>
                        <span
                            style={{cursor: 'pointer', color: '#bfbfbf'}}
                            onClick={() => togglePasswordVisible(record.id)}
                        >
                            {visiblePasswords[record.id] ?
                                <EyeInvisibleOutlined/> : <EyeOutlined/>}
                        </span>
                        <CopyOutlined
                            style={{marginLeft: 6, cursor: 'pointer', color: '#bfbfbf'}}
                            onClick={() => copyPassword(record)}
                        />
                    </span>
                </span>
            )
        },
        ...(!compact ? [{
            title: '网址',
            dataIndex: 'url',
            key: 'url',
            width: 180,
            render: (text) => text ? (
                <a href={text.startsWith('http') ? text : `https://${text}`}
                   target="_blank" rel="noreferrer"
                   style={{fontSize: 12}}>
                    <LinkOutlined style={{marginRight: 4}}/>
                    {text.length > 25 ? text.substring(0, 25) + '...' : text}
                </a>
            ) : '-'
        }] : []),
        ...(!compact ? [{
            title: '代码',
            dataIndex: 'repoUrl',
            key: 'repoUrl',
            width: 180,
            render: (text, record) => text ? (
                <span style={{fontSize: 12}}>
                    <a href={text.startsWith('http') ? text : `https://${text}`}
                       target="_blank" rel="noreferrer" style={{fontSize: 12}}>
                        <LinkOutlined style={{marginRight: 4}}/>
                        {text.length > 25 ? text.substring(0, 25) + '...' : text}
                    </a>
                    {record.repoBranch && (
                        <span style={{marginLeft: 4, color: '#8c8c8c'}}>
                            (<span style={{fontFamily: 'monospace'}}>{record.repoBranch}</span>)
                        </span>
                    )}
                </span>
            ) : '-'
        }] : []),
        {
            title: '操作',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <span>
                    <Tooltip title="编辑">
                        <EditOutlined
                            style={{cursor: 'pointer', color: '#1677ff', marginRight: 12}}
                            onClick={() => openEditModal(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="确定删除此密码？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="删除"
                        cancelText="取消"
                    >
                        <Tooltip title="删除">
                            <DeleteOutlined style={{cursor: 'pointer', color: '#ff4d4f'}}/>
                        </Tooltip>
                    </Popconfirm>
                </span>
            )
        }
    ];

    // 当前选中的分类节点（供头部编辑/删除复用）
    const selectedCategory = categories.find(c => c.id === filterCategoryId) || null;

    // 移动分类：当前节点及其所有子孙不可作为目标（防环）
    const moveDescendantIds = (() => {
        const ids = new Set();
        if (!moveCategory) return ids;
        const stack = [moveCategory.id];
        while (stack.length) {
            const cur = stack.pop();
            if (ids.has(cur)) continue;
            ids.add(cur);
            categories.forEach(c => {
                if (c.parentId === cur) stack.push(c.id);
            });
        }
        return ids;
    })();
    const moveTreeData = [
        {id: ROOT_SENTINEL, pId: '0', value: ROOT_SENTINEL, title: '作为顶级分类'},
        ...categories.map(c => ({
            id: c.id,
            pId: c.parentId || ROOT_SENTINEL,
            value: c.id,
            title: c.name,
            disabled: moveDescendantIds.has(c.id)
        }))
    ];

    // react-arborist 树节点渲染
    const renderCategoryNode = ({node, style, dragHandle}) => {
        const selected = filterCategoryId === node.data.id;
        const isBranch = !node.isLeaf;
        return (
            <div ref={dragHandle} style={style}>
                <div
                    onClick={() => setFilterCategoryId(node.data.id)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        margin: '1px 8px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        backgroundColor: selected ? '#e6f4ff' : 'transparent',
                        color: selected ? '#1677ff' : '#262626',
                        fontSize: 14
                    }}
                >
                    <div style={{display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1}}>
                        {isBranch ? (
                            <span style={{display: 'inline-flex', width: 14, justifyContent: 'center', flexShrink: 0, color: selected ? '#1677ff' : '#8c8c8c'}}>
                                {node.isOpen
                                    ? <CaretDownOutlined onClick={e => {e.stopPropagation(); node.toggle();}} style={{fontSize: 12}}/>
                                    : <CaretRightOutlined onClick={e => {e.stopPropagation(); node.toggle();}} style={{fontSize: 12}}/>}
                            </span>
                        ) : (
                            <span style={{display: 'inline-flex', width: 14, flexShrink: 0}}/>
                        )}
                        {isBranch
                            ? <FolderOutlined style={{fontSize: 14, flexShrink: 0, color: selected ? '#1677ff' : '#faad14'}}/>
                            : <TagOutlined style={{fontSize: 13, flexShrink: 0, color: selected ? '#1677ff' : '#8c8c8c'}}/>}
                        <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{node.data.name}</span>
                    </div>
                    <Dropdown
                        trigger={['click']}
                        placement="bottomRight"
                        menu={{
                            items: [
                                {
                                    key: 'add',
                                    icon: <PlusOutlined/>,
                                    label: '添加子分类',
                                    onClick: () => {
                                        setAddChildTo(node.data.id);
                                        setNewCategoryName('');
                                        setShowCategoryModal(true);
                                    }
                                },
                                {
                                    key: 'rename',
                                    icon: <EditOutlined/>,
                                    label: '重命名',
                                    onClick: () => {
                                        setEditingCategory(node.data);
                                        setEditCategoryName(node.data.name);
                                        setShowEditCategoryModal(true);
                                    }
                                },
                                {
                                    key: 'move',
                                    icon: <DragOutlined/>,
                                    label: '移动到...',
                                    onClick: () => {
                                        setMoveCategory(node.data);
                                        setMoveTarget(node.data.parentId || ROOT_SENTINEL);
                                        setShowMoveCategoryModal(true);
                                    }
                                },
                                {
                                    key: 'delete',
                                    icon: <DeleteOutlined/>,
                                    label: '删除',
                                    danger: true,
                                    onClick: () => {
                                        const target = node.data;
                                        Modal.confirm({
                                            title: '删除分类',
                                            content: `确定删除分类「${target.name}」吗？`,
                                            okText: '删除',
                                            okType: 'danger',
                                            cancelText: '取消',
                                            onOk: () => handleDeleteCategory(target)
                                        });
                                    }
                                }
                            ]
                        }}
                    >
                        <div onClick={e => e.stopPropagation()} style={{display: 'flex', alignItems: 'center'}}>
                            <Button type="text" size="small" icon={<MoreOutlined/>}/>
                        </div>
                    </Dropdown>
                </div>
            </div>
        );
    };

    const renderForm = () => (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8}}>
            <div>
                <div style={{marginBottom: 6, color: '#666'}}>分类 <span style={{color: '#ff4d4f'}}>*</span></div>
                <TreeSelect
                    showSearch
                    allowClear
                    placeholder="请选择分类"
                    value={formCategoryId || undefined}
                    onChange={v => setFormCategoryId(v || '')}
                    style={{width: '100%'}}
                    treeDefaultExpandAll
                    treeNodeFilterProp="title"
                    treeDataSimpleMode
                    treeData={categories.map(c => ({id: c.id, pId: c.parentId || '0', value: c.id, title: c.name}))}
                />
            </div>
            <div>
                <div style={{marginBottom: 6, color: '#666'}}>所属账号（可选，选择后作为子账号）</div>
                <Select
                    allowClear
                    showSearch
                    placeholder="不选则为独立主账号"
                    value={formParentId || undefined}
                    onChange={v => setFormParentId(v || '')}
                    style={{width: '100%'}}
                    filterOption={(input, option) =>
                        (option?.children || '').toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {parentOptions
                        .filter(p => !editingEntry || p.id !== editingEntry.id)
                        .map(p => (
                            <Select.Option key={p.id} value={p.id}>
                                {p.title}{p.username ? ` (${p.username})` : ''}
                            </Select.Option>
                        ))}
                </Select>
            </div>
            <div>
                <div style={{marginBottom: 6, color: '#666'}}>标题 <span style={{color: '#ff4d4f'}}>*</span></div>
                <Input
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="如 GitHub、支付宝"
                />
            </div>
            <div>
                <div style={{marginBottom: 6, color: '#666'}}>用户名 <span style={{color: '#ff4d4f'}}>*</span></div>
                <Input
                    value={formUsername}
                    onChange={e => setFormUsername(e.target.value)}
                    placeholder="邮箱或用户名"
                />
            </div>
            <div>
                <div style={{marginBottom: 6, color: '#666'}}>密码 <span style={{color: '#ff4d4f'}}>*</span></div>
                <div style={{display: 'flex', gap: 8}}>
                    <Input.Password
                        value={formPassword}
                        onChange={e => setFormPassword(e.target.value)}
                        placeholder="输入密码"
                        style={{flex: 1}}
                    />
                    <Tooltip title="生成随机密码">
                        <Button icon={<ReloadOutlined/>} onClick={() => setShowGenerator(!showGenerator)}/>
                    </Tooltip>
                </div>
                {showGenerator && (
                    <div style={{
                        marginTop: 8,
                        padding: 12,
                        backgroundColor: '#fafafa',
                        borderRadius: 8,
                        border: '1px solid #f0f0f0'
                    }}>
                        <div style={{marginBottom: 8, fontSize: 13, color: '#666'}}>
                            密码长度: {genLength}
                        </div>
                        <input
                            type="range"
                            min={8}
                            max={64}
                            value={genLength}
                            onChange={e => setGenLength(Number(e.target.value))}
                            style={{width: '100%', marginBottom: 12}}
                        />
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12}}>
                            <label style={{fontSize: 13, display: 'flex', alignItems: 'center', gap: 4}}>
                                <input type="checkbox" checked={genUpper}
                                       onChange={e => setGenUpper(e.target.checked)}/>
                                大写字母
                            </label>
                            <label style={{fontSize: 13, display: 'flex', alignItems: 'center', gap: 4}}>
                                <input type="checkbox" checked={genLower}
                                       onChange={e => setGenLower(e.target.checked)}/>
                                小写字母
                            </label>
                            <label style={{fontSize: 13, display: 'flex', alignItems: 'center', gap: 4}}>
                                <input type="checkbox" checked={genNumbers}
                                       onChange={e => setGenNumbers(e.target.checked)}/>
                                数字
                            </label>
                            <label style={{fontSize: 13, display: 'flex', alignItems: 'center', gap: 4}}>
                                <input type="checkbox" checked={genSymbols}
                                       onChange={e => setGenSymbols(e.target.checked)}/>
                                特殊字符
                            </label>
                        </div>
                        <Button type="primary" size="small" onClick={generatePassword}>
                            生成密码
                        </Button>
                    </div>
                )}
            </div>
            <div>
                <div style={{marginBottom: 6, color: '#666'}}>网址</div>
                <Input
                    value={formUrl}
                    onChange={e => setFormUrl(e.target.value)}
                    placeholder="https://example.com"
                />
            </div>
            <div style={{display: 'flex', gap: 8}}>
                <div style={{flex: 1}}>
                    <div style={{marginBottom: 6, color: '#666'}}>代码地址</div>
                    <Input
                        value={formRepoUrl}
                        onChange={e => setFormRepoUrl(e.target.value)}
                        placeholder="https://github.com/user/repo"
                    />
                </div>
                <div style={{width: 120}}>
                    <div style={{marginBottom: 6, color: '#666'}}>分支</div>
                    <Input
                        value={formRepoBranch}
                        onChange={e => setFormRepoBranch(e.target.value)}
                        placeholder="main"
                    />
                </div>
            </div>
            <div>
                <div style={{marginBottom: 6, color: '#666'}}>颜色</div>
                <div style={{display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'}}>
                    {['#52c41a', '#1677ff', '#fa8c16', '#eb2f96', '#722ed1', '#13c2c2', '#2f54eb', '#fa541c', '#f5222d', '#8c8c8c'].map(c => (
                        <div
                            key={c}
                            onClick={() => setFormColor(c)}
                            style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: c,
                                cursor: 'pointer',
                                border: formColor === c ? '2px solid #262626' : '2px solid transparent',
                                boxShadow: formColor === c ? `0 0 0 2px ${c}40` : 'none',
                                transition: 'all 0.2s'
                            }}
                        />
                    ))}
                    <input
                        type="color"
                        value={formColor}
                        onChange={e => setFormColor(e.target.value)}
                        style={{
                            width: 28,
                            height: 28,
                            border: '1px solid #d9d9d9',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            padding: 0,
                            background: 'transparent'
                        }}
                    />
                </div>
            </div>
            <div>
                <div style={{marginBottom: 6, color: '#666'}}>备注</div>
                <Input.TextArea
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    rows={3}
                    placeholder="可选备注"
                />
            </div>
        </div>
    );

    return (
        <div style={{height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden'}} onClick={globalUpdate}>
            <style>{`
                @media (max-width: 767px) {
                    .password-manager .ant-table-thead>tr>th,
                    .password-manager .ant-table-tbody>tr>td {
                        padding: 8px 4px !important;
                        font-size: 12px !important;
                    }
                }
                @media (max-width: 480px) {
                    .password-manager .ant-segmented {
                        font-size: 12px !important;
                    }
                    .password-manager .ant-btn-sm > .anticon {
                        font-size: 14px !important;
                    }
                }
                .pm-card {
                    position: relative;
                }
                .pm-card-actions {
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .pm-card:hover .pm-card-actions {
                    opacity: 1;
                }
                @media (max-width: 768px) {
                    .pm-card-actions {
                        opacity: 1;
                    }
                }
                .pm-child-actions {
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .pm-child-item:hover .pm-child-actions {
                    opacity: 1;
                }
                @media (max-width: 768px) {
                    .pm-child-actions {
                        opacity: 1;
                    }
                }
            `}</style>
            <div className="password-manager" style={{
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'row'
            }}>
                {!compact && (
                    <div style={{
                        width: sidebarWidth,
                        borderRight: '1px solid #f0f0f0',
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0
                    }}>
                        <div style={{
                            height: 49,
                            padding: '0 12px',
                            borderBottom: '1px solid #f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <span style={{fontSize: 15, fontWeight: 600, color: '#8c8c8c'}}>
                                分类
                            </span>
                            <Dropdown
                                trigger={['click']}
                                menu={{
                                    items: [
                                        {
                                            key: 'add',
                                            icon: <PlusOutlined/>,
                                            label: '添加分类',
                                            onClick: () => {
                                                setAddChildTo(null);
                                                setNewCategoryName('');
                                                setShowCategoryModal(true);
                                            }
                                        },
                                        {
                                            key: 'edit',
                                            icon: <EditOutlined/>,
                                            label: '编辑分类',
                                            disabled: !selectedCategory,
                                            onClick: () => {
                                                if (!selectedCategory) {
                                                    message.warning('请先选择分类');
                                                    return;
                                                }
                                                setEditingCategory(selectedCategory);
                                                setEditCategoryName(selectedCategory.name);
                                                setShowEditCategoryModal(true);
                                            }
                                        },
                                        {
                                            key: 'delete',
                                            icon: <DeleteOutlined/>,
                                            label: '删除分类',
                                            danger: true,
                                            disabled: !selectedCategory,
                                            onClick: () => {
                                                if (!selectedCategory) {
                                                    message.warning('请先选择分类');
                                                    return;
                                                }
                                                const target = selectedCategory;
                                                Modal.confirm({
                                                    title: '删除分类',
                                                    content: `确定删除分类「${target.name}」吗？`,
                                                    okText: '删除',
                                                    okType: 'danger',
                                                    cancelText: '取消',
                                                    onOk: () => handleDeleteCategory(target)
                                                });
                                            }
                                        }
                                    ]
                                }}
                            >
                                <Button type="text" size="small" icon={<MoreOutlined/>}/>
                            </Dropdown>
                        </div>
                        <div ref={sidebarBodyRef} style={{flex: 1, overflow: 'hidden'}}>
                            {categories.length === 0 ? (
                                <div style={{padding: '24px 12px', color: '#bfbfbf', fontSize: 14, textAlign: 'center'}}>
                                    暂无分类
                                </div>
                            ) : (
                                <Tree
                                    data={tile2nest(categories.map(c => ({...c})), 'id', 'parentId')}
                                    width="100%"
                                    height={treeHeight || 400}
                                    selection={filterCategoryId}
                                    rowHeight={36}
                                    indent={18}
                                    openByDefault={false}
                                    disableDrop={true}
                                    disableMultiSelection={true}
                                >
                                    {renderCategoryNode}
                                </Tree>
                            )}
                        </div>
                    </div>
                )}

                <div style={{
                    flex: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderBottom: '1px solid #f0f0f0',
                        flexWrap: 'wrap'
                    }}>
                        <Input
                            allowClear
                            placeholder="搜索标题、用户名、网址..."
                            prefix={<SearchOutlined style={{color: '#bfbfbf'}}/>}
                            value={searchKeyword}
                            onChange={e => setSearchKeyword(e.target.value)}
                            style={{width: compact ? '100%' : 240, minWidth: compact ? 0 : 200}}
                        />
                        <Segmented
                            value={viewMode}
                            onChange={v => setViewMode(v)}
                            options={[
                                {value: 'card', icon: <AppstoreOutlined/>, label: '卡片'},
                                {value: 'table', icon: <UnorderedListOutlined/>, label: '列表'}
                            ]}
                        />
                        {compact && (
                            <TreeSelect
                                placeholder="分类筛选（全部）"
                                allowClear
                                value={filterCategoryId || undefined}
                                onChange={v => setFilterCategoryId(v || '')}
                                style={{width: 160}}
                                treeDefaultExpandAll
                                treeNodeFilterProp="title"
                                treeDataSimpleMode
                                treeData={categories.map(c => ({id: c.id, pId: c.parentId || '0', value: c.id, title: c.name}))}
                            />
                        )}
                        <div style={{flex: 1}}/>
                        <Button type="primary" icon={<PlusOutlined/>} onClick={openAddModal}>
                            添加账号
                        </Button>
                        </div>

                    <div style={{
                        flex: 1,
                        overflow: 'auto',
                        padding: viewMode === 'card' ? 12 : 0,
                        backgroundColor: viewMode === 'card' ? '#f5f5f9' : '#fff'
                    }}>
                        {viewMode === 'table' ? (
                            <Table
                                dataSource={treePasswords}
                                columns={columns}
                                rowKey="id"
                                loading={loading}
                                size={compact ? 'small' : 'middle'}
                                childrenColumnName="children"
                                pagination={treePasswords.length > 20 ? {pageSize: 20} : false}
                                locale={{emptyText: '暂无账号，点击上方按钮添加'}}
                            />
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(auto-fill, minmax(${cardMinWidth}px, 1fr))`,
                                gap: 12
                            }}>
                                {treePasswords.length === 0 && (
                                    <div style={{
                                        gridColumn: '1 / -1',
                                        textAlign: 'center',
                                        padding: '40px 0',
                                        color: '#999'
                                    }}>
                                        暂无账号，点击上方按钮添加
                                    </div>
                                )}
                                {treePasswords.map(entry => {
                                    const cardColor = entry.color || '#1677ff';
                                    return (
                                    <div key={entry.id} className="pm-card" style={{
                                        borderRadius: 12,
                                        backgroundColor: '#fff',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        overflow: 'hidden',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                    }}>
                                        <div style={{
                                            height: 3,
                                            background: cardColor
                                        }}/>
                                        <div style={{
                                            padding: '14px 16px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 12
                                        }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}>
                                            <span style={{
                                                fontSize: 17,
                                                fontWeight: 600,
                                                color: '#1a1a1a'
                                            }}>
                                                {entry.title}
                                            </span>
                                            <span className="pm-card-actions">
                                                <Tooltip title="编辑">
                                                    <EditOutlined
                                                        style={{cursor: 'pointer', color: '#8c8c8c', marginRight: 14}}
                                                        onClick={() => openEditModal(entry)}
                                                    />
                                                </Tooltip>
                                                <Popconfirm
                                                    title="删除该账号？"
                                                    description={entry.children ? '子账号也会一并删除' : undefined}
                                                    onConfirm={() => handleDelete(entry.id)}
                                                    okText="删除"
                                                    cancelText="取消"
                                                >
                                                    <DeleteOutlined style={{cursor: 'pointer', color: '#ff4d4f'}}/>
                                                </Popconfirm>
                                            </span>
                                        </div>
                                        <div>
                                            <div style={{color: '#8c8c8c', fontSize: 13, marginBottom: 2}}>用户名</div>
                                            <div style={{fontSize: 14, color: '#595959', display: 'flex', alignItems: 'center', gap: 6}}>
                                                <span style={{fontFamily: 'monospace'}}>{entry.username}</span>
                                                <CopyOutlined
                                                    style={{cursor: 'pointer', color: '#bfbfbf', fontSize: 12}}
                                                    onClick={() => copyUsername(entry)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{color: '#8c8c8c', fontSize: 13, marginBottom: 2}}>密码</div>
                                            <div style={{fontSize: 14, color: '#595959', display: 'flex', alignItems: 'center'}}>
                                                <span style={{fontFamily: 'monospace'}}>
                                                    {visiblePasswords[entry.id] ? (entry.passwordEncrypted || '') : '••••••••'}
                                                </span>
                                                <span style={{display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8}}>
                                                    <span
                                                        style={{cursor: 'pointer', color: '#bfbfbf'}}
                                                        onClick={() => togglePasswordVisible(entry.id)}
                                                    >
                                                        {visiblePasswords[entry.id] ?
                                                            <EyeInvisibleOutlined style={{fontSize: 12}}/> : <EyeOutlined style={{fontSize: 12}}/>}
                                                    </span>
                                                    <CopyOutlined
                                                        style={{cursor: 'pointer', color: '#bfbfbf', fontSize: 12}}
                                                        onClick={() => copyPassword(entry)}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                        {entry.url && (
                                            <div>
                                                <div style={{color: '#8c8c8c', fontSize: 13, marginBottom: 2}}>网址</div>
                                                <div style={{fontSize: 14, color: '#595959', display: 'flex', alignItems: 'center', gap: 6}}>
                                                    <a href={entry.url.startsWith('http') ? entry.url : `https://${entry.url}`}
                                                       target="_blank" rel="noreferrer" style={{fontSize: 14, color: '#595959'}}>
                                                        <LinkOutlined style={{marginRight: 4, fontSize: 12}}/>
                                                        {entry.url.length > 30 ? entry.url.substring(0, 30) + '...' : entry.url}
                                                    </a>
                                                    <CopyOutlined
                                                        style={{cursor: 'pointer', color: '#bfbfbf', fontSize: 12}}
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(entry.url).then(() => message.success('已复制'));
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {entry.repoUrl && (
                                            <div>
                                                <div style={{color: '#8c8c8c', fontSize: 13, marginBottom: 2}}>代码</div>
                                                <div style={{fontSize: 14, color: '#595959', display: 'flex', alignItems: 'center', gap: 6}}>
                                                    <a href={entry.repoUrl.startsWith('http') ? entry.repoUrl : `https://${entry.repoUrl}`}
                                                       target="_blank" rel="noreferrer" style={{fontSize: 14, color: '#595959'}}>
                                                        <LinkOutlined style={{marginRight: 4, fontSize: 12}}/>
                                                        {entry.repoUrl.length > 30 ? entry.repoUrl.substring(0, 30) + '...' : entry.repoUrl}
                                                    </a>
                                                    <CopyOutlined
                                                        style={{cursor: 'pointer', color: '#bfbfbf', fontSize: 12}}
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(entry.repoUrl).then(() => message.success('已复制'));
                                                        }}
                                                    />
                                                    {entry.repoBranch && (
                                                        <span style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 3,
                                                            fontSize: 11,
                                                            color: '#8c8c8c',
                                                            backgroundColor: '#f5f5f5',
                                                            padding: '1px 6px',
                                                            borderRadius: 4,
                                                            fontFamily: 'monospace'
                                                        }}>
                                                            {entry.repoBranch}
                                                            <CopyOutlined
                                                                style={{cursor: 'pointer', color: '#bfbfbf', fontSize: 11}}
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(entry.repoBranch).then(() => message.success('已复制'));
                                                                }}
                                                            />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {entry.notes && (
                                            <div>
                                                <div style={{color: '#8c8c8c', fontSize: 13, marginBottom: 2}}>备注</div>
                                                <div style={{fontSize: 14, color: '#595959'}}>{entry.notes}</div>
                                            </div>
                                        )}
                                        {entry.children && entry.children.length > 0 && (
                                            <div style={{
                                                marginTop: 4,
                                                paddingTop: 8,
                                                borderTop: '1px dashed #f0f0f0'
                                            }}>
                                                <div style={{
                                                    fontSize: 14,
                                                    color: '#8c8c8c',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    cursor: 'pointer',
                                                    userSelect: 'none',
                                                    padding: '2px 0'
                                                }}
                                                     onClick={() => setChildDrawerParent(entry)}
                                                >
                                                    <span style={{display: 'flex', alignItems: 'center', gap: 4}}>
                                                        <CaretRightOutlined style={{fontSize: 12}}/>
                                                        子账号（{entry.children.length}）
                                                    </span>
                                                    <PlusOutlined
                                                        style={{cursor: 'pointer', color: '#1677ff', fontSize: 13}}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openAddModal(entry);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                title="添加账号"
                open={addModalOpen}
                onOk={handleAdd}
                onCancel={() => {
                    setAddModalOpen(false);
                    resetForm();
                }}
                okText="添加"
                cancelText="取消"
                width={520}
            >
                {renderForm()}
            </Modal>

            <Modal
                title="编辑账号"
                open={editModalOpen}
                onOk={handleUpdate}
                onCancel={() => {
                    setEditModalOpen(false);
                    resetForm();
                }}
                okText="保存"
                cancelText="取消"
                width={520}
            >
                {renderForm()}
            </Modal>
            <Modal
                title={addChildTo ? '添加子分类' : '添加分类'}
                open={showCategoryModal}
                onOk={async () => {
                    const ok = await handleAddCategory();
                    if (!ok) return Promise.reject();
                }}
                onCancel={() => {
                    setShowCategoryModal(false);
                    setNewCategoryName('');
                    setAddChildTo(null);
                }}
                okText="添加"
                cancelText="取消"
                width={400}
            >
                {addChildTo && (
                    <div style={{marginBottom: 8, color: '#1677ff', fontSize: 13}}>
                        添加到「{categories.find(c => c.id === addChildTo)?.name || ''}」
                    </div>
                )}
                <div style={{marginBottom: 6, color: '#666'}}>分类名称</div>
                <Input
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder={addChildTo ? '如 前端、后端' : '如 工作、社交、金融'}
                    onPressEnter={async () => {
                        const ok = await handleAddCategory();
                        if (!ok) return;
                    }}
                />
            </Modal>
            <Modal
                title="编辑分类"
                open={showEditCategoryModal}
                onOk={async () => {
                    const ok = await handleEditCategory();
                    if (!ok) return Promise.reject();
                }}
                onCancel={() => {
                    setShowEditCategoryModal(false);
                    setEditCategoryName('');
                    setEditingCategory(null);
                }}
                okText="保存"
                cancelText="取消"
                width={400}
            >
                <div style={{marginBottom: 6, color: '#666'}}>分类名称</div>
                <Input
                    value={editCategoryName}
                    onChange={e => setEditCategoryName(e.target.value)}
                    placeholder="请输入新的分类名称"
                    onPressEnter={async () => {
                        const ok = await handleEditCategory();
                        if (!ok) return;
                    }}
                />
            </Modal>
            <Modal
                title="移动分类"
                open={showMoveCategoryModal}
                onOk={async () => {
                    const ok = await handleMoveCategory();
                    if (!ok) return Promise.reject();
                }}
                onCancel={() => {
                    setShowMoveCategoryModal(false);
                    setMoveCategory(null);
                    setMoveTarget('');
                }}
                okText="移动"
                cancelText="取消"
                width={400}
            >
                <div style={{marginBottom: 8, color: '#666'}}>
                    将「{moveCategory?.name}」移动到：
                </div>
                <TreeSelect
                    style={{width: '100%'}}
                    value={moveTarget || undefined}
                    onChange={v => setMoveTarget(v || '')}
                    placeholder="选择目标分类"
                    treeDefaultExpandAll
                    treeNodeFilterProp="title"
                    treeDataSimpleMode
                    treeData={moveTreeData}
                />
            </Modal>

            <Drawer
                title={
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <span>{childDrawerParent?.title} 的子账号（{childDrawerParent?.children?.length || 0}）</span>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined/>}
                            onClick={() => {
                                const parent = childDrawerParent;
                                setChildDrawerParent(null);
                                openAddModal(parent);
                            }}
                        >
                            添加
                        </Button>
                    </div>
                }
                open={!!childDrawerParent}
                onClose={() => setChildDrawerParent(null)}
                width={compact ? '100%' : 420}
                styles={{header: {padding: '12px 16px'}, body: {padding: '12px 16px'}}}
            >
                {childDrawerParent?.children?.map(child => (
                    <div key={child.id} className="pm-child-item" style={{
                        padding: '12px',
                        backgroundColor: '#fafafa',
                        borderRadius: 8,
                        fontSize: 14,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        marginBottom: 8
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <span style={{fontWeight: 600, fontSize: 15, color: '#262626'}}>
                                {child.title}
                            </span>
                            <span className="pm-child-actions" style={{flexShrink: 0}}>
                                <Tooltip title="编辑">
                                    <EditOutlined
                                        style={{cursor: 'pointer', color: '#1677ff', marginRight: 12}}
                                        onClick={() => {
                                            setChildDrawerParent(null);
                                            openEditModal(child);
                                        }}
                                    />
                                </Tooltip>
                                <Popconfirm
                                    title="删除该子账号？"
                                    onConfirm={() => handleDelete(child.id)}
                                    okText="删除"
                                    cancelText="取消"
                                >
                                    <DeleteOutlined style={{cursor: 'pointer', color: '#ff4d4f'}}/>
                                </Popconfirm>
                            </span>
                        </div>
                        <div style={{
                            color: '#595959',
                            fontSize: 14,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <span style={{color: '#8c8c8c', marginRight: 4, flexShrink: 0}}>用户名：</span>
                            <span style={{
                                fontFamily: 'monospace',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {child.username}
                            </span>
                            <CopyOutlined
                                style={{
                                    marginLeft: 6,
                                    cursor: 'pointer',
                                    color: '#bfbfbf',
                                    flexShrink: 0
                                }}
                                onClick={() => copyUsername(child)}
                            />
                        </div>
                        <div style={{
                            color: '#595959',
                            fontSize: 14,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <span style={{color: '#8c8c8c', marginRight: 4, flexShrink: 0}}>密码：</span>
                            <span style={{fontFamily: 'monospace'}}>
                                {visiblePasswords[child.id] ? (child.passwordEncrypted || '') : '••••••••'}
                            </span>
                            <span style={{marginLeft: 6, flexShrink: 0}}>
                                <span
                                    style={{cursor: 'pointer', color: '#bfbfbf'}}
                                    onClick={() => togglePasswordVisible(child.id)}
                                >
                                    {visiblePasswords[child.id] ?
                                        <EyeInvisibleOutlined/> : <EyeOutlined/>}
                                </span>
                                <CopyOutlined
                                    style={{marginLeft: 6, cursor: 'pointer', color: '#bfbfbf'}}
                                    onClick={() => copyPassword(child)}
                                />
                            </span>
                        </div>
                        {child.url && (
                            <div style={{
                                color: '#595959',
                                fontSize: 14,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <span style={{color: '#8c8c8c', marginRight: 4, flexShrink: 0}}>网址：</span>
                                <a href={child.url.startsWith('http') ? child.url : `https://${child.url}`}
                                   target="_blank" rel="noreferrer" style={{fontSize: 14}}>
                                    <LinkOutlined style={{marginRight: 4}}/>
                                    {child.url.length > 30 ? child.url.substring(0, 30) + '...' : child.url}
                                </a>
                            </div>
                        )}
                        {child.repoUrl && (
                            <div style={{
                                color: '#595959',
                                fontSize: 14,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <span style={{color: '#8c8c8c', marginRight: 4, flexShrink: 0}}>代码：</span>
                                <a href={child.repoUrl.startsWith('http') ? child.repoUrl : `https://${child.repoUrl}`}
                                   target="_blank" rel="noreferrer" style={{fontSize: 14}}>
                                    <LinkOutlined style={{marginRight: 4}}/>
                                    {child.repoUrl.length > 30 ? child.repoUrl.substring(0, 30) + '...' : child.repoUrl}
                                </a>
                                {child.repoBranch && (
                                    <span style={{marginLeft: 8, fontSize: 12, color: '#8c8c8c'}}>
                                        (<span style={{fontFamily: 'monospace'}}>{child.repoBranch}</span>)
                                    </span>
                                )}
                            </div>
                        )}
                        {child.notes && (
                            <div style={{color: '#595959', fontSize: 14}}>
                                <span style={{color: '#8c8c8c', marginRight: 4}}>备注：</span>
                                {child.notes}
                            </div>
                        )}
                    </div>
                ))}
                {childDrawerParent && (!childDrawerParent.children || childDrawerParent.children.length === 0) && (
                    <div style={{textAlign: 'center', padding: '40px 0', color: '#999'}}>
                        暂无子账号，点击右上角添加
                    </div>
                )}
            </Drawer>
        </div>
    );
}
