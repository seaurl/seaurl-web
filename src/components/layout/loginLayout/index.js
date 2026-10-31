'use client'
import {
    OpenAIOutlined,
    GlobalOutlined,
    FolderOutlined,
    FormOutlined,
    MailOutlined,
    SettingOutlined,
    LogoutOutlined,
    UserOutlined,
    InfoCircleOutlined,
    HomeOutlined,
    LikeOutlined,
    DownloadOutlined,
    FireOutlined,
    ReadOutlined,
    BookOutlined,
    PhoneOutlined,
    VideoCameraOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    RobotOutlined,
    PlusOutlined,
    HistoryOutlined,
    DeleteOutlined,
    ArrowLeftOutlined,
    LoadingOutlined,
    SendOutlined,
    CopyOutlined,
} from "@ant-design/icons";
import {useSelector, useDispatch} from "react-redux";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useState, useEffect, useRef} from "react";
import {withRouter} from "@/hoc/withRouter";
import {Button, Drawer, Tooltip, Avatar, Menu, Popover, Spin, Empty, Input, Modal, message} from "antd";
import classNames from "classnames/bind";
import {useSession, signOut} from "next-auth/react";
import {logoutAll} from '@/lib/slices/authSlice'
import IconFont from "@/utils/iconFont";
import {buildFaviconUrl, DEFAULT_FAVICON} from "@/utils/favicon";
import UrlAddDlg from '@/components/dialog/urlAddDlg'
import {getUrlListByType} from '@/lib/slices/urlSpaceSlice'
import axios from '@/lib/axios'
import {chatWithAIStream} from '@/lib/aiChat'
import MarkdownMessage from '@/components/aihub/chatAiSpace/chatList/markdownMessage'

function UserLayout({children, routerPush}) {
    const {platFormTheme} = useSelector(state => state.system)
    const isDark = platFormTheme?.background === 'dark' || (platFormTheme?.background === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const hoverBg = isDark ? '#1C2126' : '#f5f5f5'
    const pathname = usePathname()
    const router = useRouter()
    const query = useSearchParams()
    const {data: session} = useSession()
    const dispatch = useDispatch()

    const [open, setOpen] = useState(false);
    const [showAddDlg, setShowAddDlg] = useState(false)
    const [commonUrlsOpen, setCommonUrlsOpen] = useState(false)
    const [commonUrls, setCommonUrls] = useState([])
    const [commonUrlsLoading, setCommonUrlsLoading] = useState(false)
    const [commonNotesOpen, setCommonNotesOpen] = useState(false)
    const [commonNotes, setCommonNotes] = useState([])
    const [commonNotesLoading, setCommonNotesLoading] = useState(false)

    // Logo drawer state
    const [logoDrawerVisible, setLogoDrawerVisible] = useState(false);
    const {loginMenus, logoutMenus} = useSelector(state => state.system)

    // Avatar drawer state
    const [avatarDrawerVisible, setAvatarDrawerVisible] = useState(false);

    const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
    const [aiMessages, setAiMessages] = useState([]);
    const [aiInput, setAiInput] = useState('');
    const [aiHistory, setAiHistory] = useState([]);
    const [aiShowHistory, setAiShowHistory] = useState(false);
    const [aiConfigOpen, setAiConfigOpen] = useState(false);
    const [aiConfigModel, setAiConfigModel] = useState('');
    const [aiConfigKey, setAiConfigKey] = useState('');
    const [aiConfigHost, setAiConfigHost] = useState('');
    const [aiHasKey, setAiHasKey] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiConversationId, setAiConversationId] = useState('');
    const aiChatRef = useRef(null);

    useEffect(() => {
        axios.get('/space/crud/ai/config').then(res => {
            if (res.data?.status === 0) {
                setAiConfigModel(res.data.data.model || '');
                setAiConfigHost(res.data.data.baseUrl || '');
                setAiHasKey(!!res.data.data.hasKey);
            }
        }).catch(() => {});
    }, []);

    function fetchAiHistory() {
        axios.get('/space/crud/ai/conversations').then(res => {
            if (res.data?.status === 0) {
                setAiHistory(res.data.data || []);
            }
        }).catch(() => {});
    }

    useEffect(() => {
        fetchAiHistory();
    }, []);

    const isAiConfigured = aiConfigModel.trim() && aiHasKey;

    useEffect(() => {
        if (aiChatRef.current) {
            aiChatRef.current.scrollTop = aiChatRef.current.scrollHeight;
        }
    }, [aiMessages]);

    async function handleAiSend() {
        const text = aiInput.trim();
        if (!text || aiLoading) return;
        if (!isAiConfigured) {
            message.warning('请先配置模型和Key');
            setAiConfigOpen(true);
            return;
        }

        const userMessage = {role: 'user', content: text};
        const apiMessages = aiMessages
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .map(m => ({role: m.role, content: m.content}))
        apiMessages.push({role: 'user', content: text});

        const displayMessages = [...aiMessages, userMessage];
        setAiMessages(displayMessages);
        setAiInput('');
        setAiLoading(true);

        const assistantIndex = displayMessages.length;
        setAiMessages(prev => [...prev, {role: 'assistant', content: ''}]);

        const conversationId = aiConversationId || `conv_${Date.now()}`;
        if (!aiConversationId) setAiConversationId(conversationId);

        axios.post('/space/crud/ai/message/save', {
            conversationId,
            role: 'user',
            content: text,
            title: aiMessages.length === 0 ? text : undefined
        }).catch(() => {});

        try {
            let fullContent = '';
            for await (const chunk of chatWithAIStream(apiMessages)) {
                if (chunk.type === 'content') {
                    fullContent = chunk.content;
                    setAiMessages(prev => {
                        const updated = [...prev];
                        updated[assistantIndex] = {role: 'assistant', content: fullContent};
                        return updated;
                    });
                } else if (chunk.type === 'error') {
                    throw new Error(chunk.message);
                }
            }

            axios.post('/space/crud/ai/message/save', {
                conversationId,
                role: 'assistant',
                content: fullContent
            }).catch(() => {});

            fetchAiHistory();
        } catch (e) {
            setAiMessages(prev => {
                const updated = [...prev];
                updated[assistantIndex] = {
                    role: 'assistant',
                    content: `请求失败：${e.message}`
                };
                return updated;
            });
        } finally {
            setAiLoading(false);
        }
    }

    const showLogoDrawer = () => setLogoDrawerVisible(true);
    const hideLogoDrawer = () => setLogoDrawerVisible(false);
    // ---- Logo drawer: navigation menu ----
    function onClickMenuItem({item, key}) {
        if (session) {
            loginMenus.forEach(async d => {
                if (d.key === key) {
                    routerPush(key === '0' ? '/' : d.url)
                }
            })
        } else {
            logoutMenus.forEach(d => {
                if (d.key === key) {
                    window.location = d.url
                }
            })
        }
        hideLogoDrawer()
    }

    function getMenuList() {
        const menus = session ? loginMenus : logoutMenus
        let newMenus = JSON.parse(JSON.stringify(menus))
        return newMenus.map(item => {
            if (item.type === 'drawer-menus') {
                const iconMap = {
                    '0': <HomeOutlined/>,
                    '1': <LikeOutlined/>,
                    '3': <DownloadOutlined/>,
                    '4': <InfoCircleOutlined/>,
                    '5': <FireOutlined/>,
                    '6': <ReadOutlined/>,
                    '7': <BookOutlined/>,
                    '8': <PhoneOutlined/>,
                    '9': <VideoCameraOutlined/>
                }
                item.icon = iconMap[item.key] || item.icon
                return item;
            }
        })
    }

    // ---- User menu ----
    const onClose = () => {
        setOpen(false);
    };

    async function handleLogout() {
        const res = await dispatch(logoutAll())
        if (res.payload.status === 0 && res.payload.data) {
            await signOut({callbackUrl: `/`})
            localStorage.removeItem('theme.background')
            localStorage.removeItem('theme.color')
        }
    }

    async function fetchCommonUrls() {
        setCommonUrlsLoading(true)
        try {
            const res = await axios.get(`/space/crud/url/getUrlListByType?type=frequently`)
            if (res.data?.status === 0) {
                setCommonUrls(res.data.data || [])
            }
        } catch (e) {
        } finally {
            setCommonUrlsLoading(false)
        }
    }

    function openCommonUrlsDrawer() {
        setCommonUrlsOpen(true)
        fetchCommonUrls()
    }

    async function fetchCommonNotes() {
        setCommonNotesLoading(true)
        try {
            const res = await axios.get(`/space/crud/url/getNotesListByType?type=frequently`)
            if (res.data?.status === 0) {
                setCommonNotes(res.data.data || [])
            }
        } catch (e) {
        } finally {
            setCommonNotesLoading(false)
        }
    }

    function openCommonNotesDrawer() {
        setCommonNotesOpen(true)
        fetchCommonNotes()
    }

    const userMenuItems = [
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '设置',
            onClick: () => routerPush('/setting/profile')
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出',
            onClick: handleLogout
        },
        {
            key: 'about',
            icon: <InfoCircleOutlined />,
            label: '关于',
            onClick: () => routerPush('/about')
        }
    ];

    // ---- Left panel icons ----
    function renderDom(name, cls, isActive = false) {
        let icon = null
        if (name === 'aiUsed'){
            icon = <OpenAIOutlined className={'text-md'}/>
        }
        if (name === 'urlSpace'){
            icon = <GlobalOutlined className={'text-md'}/>
        }
        if (name === 'noteSpace'){
            icon = <FormOutlined className={'text-md'}/>
        }
        if (name === 'fileSpace'){
            icon = <FolderOutlined className={'text-md'}/>
        }
        if (name === 'mailSpace'){
            icon = <MailOutlined className={'text-md'}/>
        }

        const handleClick = () => {
            if (name === 'aiUsed') {
                routerPush('/aiSpace/aiUsed')
            } else if (name === 'urlSpace') {
                routerPush('/urlSpace')
            } else if (name === 'noteSpace') {
                routerPush('/noteSpace')
            } else if (name === 'fileSpace') {
                routerPush('/fileSpace')
            } else if (name === 'mailSpace') {
                routerPush('/mailSpace')
            }
        }

        return (
            <div
                className={classNames({
                    'items-center justify-center h-[36px] w-[36px] rounded-full cursor-pointer': true,
                    [cls]: true
                })}
                style={{
                    background: isActive ? '#ffffff30' : 'transparent',
                    color: '#fff',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#ffffff20' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                onClick={handleClick}>
                {icon}
            </div>
        )
    }

    function isActive(pathPrefix) {
        return pathname.startsWith(pathPrefix)
    }

    return (
        <div className={'w-full flex h-screen overflow-hidden'}>
            <div
                className={'w-[60px] flex flex-col justify-between items-center relative z-30 shrink-0 border-r border-[#ffffff20]'}
                style={{backgroundColor: platFormTheme?.color}}>
                <div
                    className={'p-[12px] flex flex-col items-center gap-[18px]'}>
                    <img
                        src="https://cdn.awbeci.com/seaurl/logo/seaurl_logo.png"
                        alt=""
                        className={'w-[36px] h-[36px] rounded-full border-2 border-[#ffffff40] object-cover cursor-pointer'}
                        onClick={() => routerPush('/')}
                    />

                    <Tooltip placement={"right"} title={'网址'}>
                        {renderDom('urlSpace', 'hidden xl:flex', isActive('/urlSpace'))}
                        {renderDom('urlSpace', 'flex xl:hidden', isActive('/urlSpace'))}
                    </Tooltip>
                    <Tooltip placement={"right"} title={'工具'}>
                        {renderDom('aiUsed', 'hidden xl:flex', pathname.includes('aiSpace'))}
                        {renderDom('aiUsed', 'flex xl:hidden', pathname.includes('aiSpace'))}
                    </Tooltip>
                    <Tooltip placement={"right"} title={'笔记'}>
                        {renderDom('noteSpace', 'hidden xl:flex', isActive('/noteSpace'))}
                        {renderDom('noteSpace', 'flex xl:hidden', isActive('/noteSpace'))}
                    </Tooltip>
                    <Tooltip placement={"right"} title={'文件'}>
                        {renderDom('fileSpace', 'hidden xl:flex', isActive('/fileSpace'))}
                        {renderDom('fileSpace', 'flex xl:hidden', isActive('/fileSpace'))}
                    </Tooltip>
                    <Tooltip placement={"right"} title={'邮箱'}>
                        {renderDom('mailSpace', 'hidden xl:flex', isActive('/mailSpace'))}
                        {renderDom('mailSpace', 'flex xl:hidden', isActive('/mailSpace'))}
                    </Tooltip>
                </div>
                <div className={'p-[12px] flex flex-col items-center gap-[18px]'}>
                    <Tooltip placement={"right"} title={'添加网址'}>
                        <div
                            className={'flex items-center justify-center h-[36px] w-[36px] rounded-full cursor-pointer text-white'}
                            style={{background: 'transparent'}}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#ffffff20'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            onClick={() => setShowAddDlg(true)}>
                            <IconFont type="icon-jia" className={'text-md'}/>
                        </div>
                    </Tooltip>
                    <Tooltip placement={"right"} title={'AI'}>
                        <div
                            className={'flex items-center justify-center h-[36px] w-[36px] rounded-full cursor-pointer text-white'}
                            style={{background: 'transparent'}}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#ffffff20'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            onClick={() => setAiDrawerOpen(true)}>
                            <RobotOutlined className={'text-md'}/>
                        </div>
                    </Tooltip>
                    <Tooltip placement={"right"} title={'常用网址'}>
                        <div
                            className={'flex items-center justify-center h-[36px] w-[36px] rounded-full cursor-pointer text-white'}
                            style={{background: 'transparent'}}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#ffffff20'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            onClick={openCommonUrlsDrawer}>
                            <ClockCircleOutlined className={'text-md'}/>
                        </div>
                    </Tooltip>
                    <Tooltip placement={"right"} title={'常用笔记'}>
                        <div
                            className={'flex items-center justify-center h-[36px] w-[36px] rounded-full cursor-pointer text-white'}
                            style={{background: 'transparent'}}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#ffffff20'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            onClick={openCommonNotesDrawer}>
                            <FileTextOutlined className={'text-md'}/>
                        </div>
                    </Tooltip>
                    <Popover
                        trigger="click"
                        open={avatarDrawerVisible}
                        onOpenChange={setAvatarDrawerVisible}
                        placement="rightTop"
                        arrow={false}
                        styles={{ body: { padding: 0, borderRadius: 8, overflow: 'hidden' } }}
                        content={
                            <div style={{width: 200}}>
                                {/* User menu items at top */}
                                <Menu
                                    onClick={({key}) => {
                                        const item = userMenuItems.find(i => i.key === key)
                                        if (item?.onClick) item.onClick()
                                        setAvatarDrawerVisible(false)
                                    }}
                                    selectable={false}
                                    style={{ width: '100%', border: 'none' }}
                                    mode="inline"
                                    items={userMenuItems}
                                />
                            </div>
                        }>
                        <div className={'bg-white rounded-full'}>
                            {session && session.user.image ? (
                                <Avatar src={session.user.image} size={36} className={'cursor-pointer rounded-full border-2 border-[#ffffff40]'} />
                            ) : (
                                <Avatar icon={<UserOutlined />} size={36} className={'cursor-pointer rounded-full border-2 border-[#ffffff40]'} />
                            )}
                        </div>
                    </Popover>
                </div>
            </div>
            <div className={'h-full flex-1 min-w-0 overflow-hidden box-border'}>
                {children}
            </div>
            <UrlAddDlg action="add" title="添加新的网址" show={showAddDlg} onClose={() => {
                setShowAddDlg(false)
            }}/>

            {/* Common URLs Drawer */}
            <Drawer
                title="常用网址"
                placement="left"
                closable={true}
                onClose={() => setCommonUrlsOpen(false)}
                open={commonUrlsOpen}
                width={320}
                styles={{
                    body: {padding: 0, overflowY: 'auto'}
                }}
            >
                {commonUrlsLoading ? (
                    <div style={{display: 'flex', justifyContent: 'center', padding: '40px 0'}}>
                        <Spin/>
                    </div>
                ) : commonUrls.length === 0 ? (
                    <div style={{padding: '40px 0'}}>
                        <Empty description="暂无常用网址"/>
                    </div>
                ) : (
                    <div style={{display: 'flex', flexDirection: 'column', padding: '0 8px'}}>
                        {commonUrls.map((url, index) => (
                            <a
                                key={url.id || url._id || index}
                                href={url.url?.startsWith('http') ? url.url : `https://${url.url}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '10px 14px',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                {url.favicon ? (
                                    <img
                                        src={buildFaviconUrl(url)}
                                        alt=""
                                        style={{width: 20, height: 20, borderRadius: 4, flexShrink: 0}}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = DEFAULT_FAVICON;
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 4,
                                        background: isDark ? '#30363d' : '#f0f0f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 10,
                                        color: '#999',
                                        flexShrink: 0
                                    }}>
                                        {(url.domain || url.title || '?').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span style={{
                                    fontSize: 13,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {url.title || url.domain || url.url}
                                </span>
                            </a>
                        ))}
                    </div>
                )}
            </Drawer>

            {/* Common Notes Drawer */}
            <Drawer
                title="常用笔记"
                placement="left"
                closable={true}
                onClose={() => setCommonNotesOpen(false)}
                open={commonNotesOpen}
                width={320}
                styles={{
                    body: {padding: 0, overflowY: 'auto'}
                }}
            >
                {commonNotesLoading ? (
                    <div style={{display: 'flex', justifyContent: 'center', padding: '40px 0'}}>
                        <Spin/>
                    </div>
                ) : commonNotes.length === 0 ? (
                    <div style={{padding: '40px 0'}}>
                        <Empty description="暂无常用笔记"/>
                    </div>
                ) : (
                    <div style={{display: 'flex', flexDirection: 'column', padding: '0 8px'}}>
                        {commonNotes.map((note, index) => (
                            <div
                                key={note.id || note._id || index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '10px 14px',
                                    cursor: 'pointer',
                                    borderRadius: 6,
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                onClick={() => {
                                    setCommonNotesOpen(false)
                                    routerPush(`/noteSpace?type=frequently&nid=${note.id}`)
                                }}
                            >
                                <FileTextOutlined style={{color: '#8c8c8c', flexShrink: 0}}/>
                                <span style={{
                                    fontSize: 13,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {note.title || '无标题'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Drawer>

            {/* Logo Drawer: navigation menus */}
            <Drawer
                styles={{
                    body: { padding: '0', overflow: 'hidden' },
                    header: { padding: '0' }
                }}
                title={null}
                placement="left"
                closable={false}
                onClose={hideLogoDrawer}
                open={logoDrawerVisible}
                width={320}>
                <div className={'relative overflow-y-auto h-full'}>
                    <Menu
                        onClick={onClickMenuItem}
                        selectable={false}
                        style={{ width: '100%', border: 'none' }}
                        mode="inline"
                        items={getMenuList()}
                    />
                </div>
            </Drawer>

            {/* AI Chat Drawer */}
            <Drawer
                title={
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                            {aiShowHistory && (
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<ArrowLeftOutlined/>}
                                    onClick={() => setAiShowHistory(false)}
                                />
                            )}
                            {aiShowHistory ? '历史记录' : 'AI 助手'}
                        </span>
                        <span style={{display: 'flex', alignItems: 'center', gap: 4}}>
                            {!aiShowHistory && (
                                <Tooltip title={isAiConfigured ? "配置" : "请先配置模型和Key"}>
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<SettingOutlined style={{color: isAiConfigured ? undefined : '#ff4d4f'}}/>}
                                        onClick={() => setAiConfigOpen(true)}
                                    />
                                </Tooltip>
                            )}
                            {!aiShowHistory && (
                                <Tooltip title="历史记录">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<HistoryOutlined/>}
                                        onClick={() => setAiShowHistory(true)}
                                    />
                                </Tooltip>
                            )}
                            {!aiShowHistory && aiMessages.length > 0 && (
                                <Tooltip title="新建对话">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<PlusOutlined/>}
                                        onClick={() => {
                                        setAiMessages([]);
                                        setAiConversationId('');
                                    }}
                                    />
                                </Tooltip>
                            )}
                        </span>
                    </div>
                }
                placement="left"
                closable={false}
                onClose={() => { setAiDrawerOpen(false); setAiShowHistory(false); }}
                open={aiDrawerOpen}
                width={520}
                styles={{
                    body: {padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden'},
                }}
            >
                {aiShowHistory ? (
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '8px'
                    }}>
                        {aiHistory.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                color: '#999',
                                padding: '60px 20px',
                                fontSize: 14
                            }}>
                                <HistoryOutlined style={{fontSize: 40, marginBottom: 12, color: '#d9d9d9'}}/>
                                <div>暂无历史记录</div>
                            </div>
                        ) : (
                            aiHistory.map((record) => (
                                <div
                                    key={record.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 10,
                                        padding: '12px',
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                        borderBottom: '1px solid ' + (isDark ? '#21262d' : '#f5f5f5'),
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = isDark ? '#161b22' : '#fafafa'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    onClick={async () => {
                                        try {
                                            const res = await axios.get(`/space/crud/ai/messages?conversationId=${record.id}`);
                                            if (res.data?.status === 0) {
                                                const msgs = (res.data.data || []).map(m => ({
                                                    role: m.role,
                                                    content: m.content
                                                }));
                                                setAiMessages(msgs);
                                                setAiConversationId(record.id);
                                                setAiShowHistory(false);
                                            }
                                        } catch (e) {
                                            message.error('加载失败');
                                        }
                                    }}
                                >
                                    <RobotOutlined style={{fontSize: 16, color: '#8c8c8c', marginTop: 2, flexShrink: 0}}/>
                                    <div style={{flex: 1, minWidth: 0}}>
                                        <div style={{
                                            fontSize: 14,
                                            fontWeight: 500,
                                            color: isDark ? '#e6edf3' : '#262626',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {record.title}
                                        </div>
                                        <div style={{fontSize: 12, color: '#8c8c8c', marginTop: 2}}>
                                            {record.time} · {record.messageCount} 条
                                        </div>
                                    </div>
                                    <DeleteOutlined
                                        style={{fontSize: 14, color: '#bfbfbf', marginTop: 2, flexShrink: 0}}
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                                await axios.get(`/space/crud/ai/conversation/delete?conversationId=${record.id}`);
                                                fetchAiHistory();
                                            } catch (err) {
                                                message.error('删除失败');
                                            }
                                        }}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <>
                <div ref={aiChatRef} style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    {aiMessages.length === 0 && (
                        <div style={{padding: '24px 8px'}}>
                            <div style={{textAlign: 'center', marginBottom: 24}}>
                                <div style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #1677ff, #722ed1)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 12
                                }}>
                                    <RobotOutlined style={{fontSize: 28, color: '#fff'}}/>
                                </div>
                                <div style={{fontSize: 18, fontWeight: 600, color: isDark ? '#e6edf3' : '#262626'}}>
                                    你好，我是 AI 助手
                                </div>
                                <div style={{fontSize: 13, marginTop: 6, color: '#8c8c8c'}}>
                                    可以帮你查询和操作以下内容
                                </div>
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 10
                            }}>
                                {[
                                    {icon: <GlobalOutlined/>, label: '查询网址', desc: '搜索收藏的网址', text: '帮我查找关于 '},
                                    {icon: <FormOutlined/>, label: '搜索笔记', desc: '查找你的笔记内容', text: '搜索笔记：'},
                                    {icon: <FolderOutlined/>, label: '查找文件', desc: '定位云端文件', text: '查找文件：'},
                                    {icon: <MailOutlined/>, label: '查阅邮件', desc: '搜索邮件内容', text: '搜索邮件：'},
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setAiInput(item.text)}
                                        style={{
                                            padding: '14px',
                                            borderRadius: 10,
                                            border: '1px solid ' + (isDark ? '#30363d' : '#f0f0f0'),
                                            backgroundColor: isDark ? '#161b22' : '#fafafa',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#1677ff';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(22,119,255,0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = isDark ? '#30363d' : '#f0f0f0';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 8,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            backgroundColor: '#1677ff15', color: '#1677ff',
                                            marginBottom: 8, fontSize: 16
                                        }}>
                                            {item.icon}
                                        </div>
                                        <div style={{fontSize: 14, fontWeight: 500, color: isDark ? '#e6edf3' : '#262626'}}>
                                            {item.label}
                                        </div>
                                        <div style={{fontSize: 12, color: '#8c8c8c', marginTop: 2}}>
                                            {item.desc}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{
                                marginTop: 16,
                                padding: '12px 14px',
                                borderRadius: 8,
                                backgroundColor: isDark ? '#161b22' : '#f6f8fa',
                                border: '1px solid ' + (isDark ? '#30363d' : '#e8e8e8'),
                                fontSize: 12,
                                color: '#8c8c8c',
                            }}>
                                <span style={{fontWeight: 500}}>试试问我：</span>
                                <div style={{display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6}}>
                                    {['最近收藏的技术网址有哪些', '找一下包含 React 的笔记', '帮我搜索关于发票的邮件'].map((q, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setAiInput(q)}
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: 6,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                lineHeight: 1.8
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = isDark ? '#21262d' : '#e6f4ff';
                                                e.currentTarget.style.color = isDark ? '#69b1ff' : '#1677ff';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = '#8c8c8c';
                                            }}
                                        >
                                            "{q}"
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {aiMessages.map((msg, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                        }}>
                            {msg.role === 'user' ? (
                                <div style={{maxWidth: '80%'}}>
                                    <div style={{
                                        padding: '10px 14px',
                                        borderRadius: '18px 18px 4px 18px',
                                        backgroundColor: '#1677ff',
                                        color: '#fff',
                                        fontSize: 14,
                                        lineHeight: 1.6,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                    }}>
                                        {msg.content}
                                    </div>
                                    <div style={{padding: '4px 2px', display: 'flex', justifyContent: 'flex-end'}}>
                                        <Tooltip title="复制">
                                            <CopyOutlined
                                                style={{
                                                    cursor: 'pointer',
                                                    color: '#bfbfbf',
                                                    fontSize: 13,
                                                    transition: 'color 0.2s'
                                                }}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(msg.content).then(() => {
                                                        message.success('已复制');
                                                    }).catch(() => {
                                                        message.error('复制失败');
                                                    });
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = '#1677ff'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = '#bfbfbf'}
                                            />
                                        </Tooltip>
                                    </div>
                                </div>
                            ) : (
                                <div style={{maxWidth: '85%'}}>
                                    <div
                                        style={{
                                            padding: '2px 14px',
                                            borderRadius: '18px 18px 18px 4px',
                                            fontSize: 14,
                                            lineHeight: 1.6,
                                            overflowX: 'hidden'
                                        }}
                                        onClick={(e) => {
                                            const target = e.target.closest('a');
                                            if (target) {
                                                const href = target.getAttribute('href');
                                                if (href && href.startsWith('/') && !href.startsWith('/api/')) {
                                                    e.preventDefault();
                                                    setAiDrawerOpen(false);
                                                    routerPush(href);
                                                }
                                            }
                                        }}
                                    >
                                        {msg.content ? (
                                            <MarkdownMessage content={msg.content}/>
                                        ) : (aiLoading && index === aiMessages.length - 1 ? (
                                            <span style={{color: '#8c8c8c', fontStyle: 'italic', display: 'inline-block', padding: '8px 0'}}>正在思考...</span>
                                        ) : '')}
                                    </div>
                                    {msg.content && !(aiLoading && index === aiMessages.length - 1) && (
                                        <div style={{padding: '4px 2px'}}>
                                            <Tooltip title="复制">
                                                <CopyOutlined
                                                    style={{
                                                        cursor: 'pointer',
                                                        color: '#bfbfbf',
                                                        fontSize: 13,
                                                        transition: 'color 0.2s'
                                                    }}
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(msg.content).then(() => {
                                                            message.success('已复制');
                                                        }).catch(() => {
                                                            message.error('复制失败');
                                                        });
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = '#1677ff'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = '#bfbfbf'}
                                                />
                                            </Tooltip>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div style={{
                    flexShrink: 0,
                    padding: '12px 16px',
                    borderTop: '1px solid ' + (isDark ? '#30363d' : '#f0f0f0'),
                    backgroundColor: isDark ? '#0d1117' : '#fff'
                }}>
                    <div style={{display: 'flex', gap: 8, alignItems: 'flex-end'}}>
                        <Input.TextArea
                            value={aiInput}
                            onChange={e => setAiInput(e.target.value)}
                            placeholder="输入问题..."
                            autoSize={{minRows: 1, maxRows: 4}}
                            disabled={aiLoading}
                            style={{
                                flex: 1,
                                borderRadius: 8,
                                resize: 'none'
                            }}
                            onKeyDown={e => {
                                if (e.nativeEvent.isComposing) return;
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (!aiLoading && aiInput.trim() && isAiConfigured) {
                                        handleAiSend();
                                    }
                                }
                            }}
                        />
                        <Button
                            type="primary"
                            icon={aiLoading ? <LoadingOutlined/> : <SendOutlined/>}
                            disabled={!aiInput.trim() || aiLoading}
                            onClick={handleAiSend}
                        />
                    </div>
                </div>
                    </>
                )}
            </Drawer>

            {/* AI Config Modal */}
            <Modal
                title="AI 配置"
                open={aiConfigOpen}
                onOk={async () => {
                    if (!aiConfigModel.trim()) {
                        message.warning('请填写模型');
                        return;
                    }
                    if (!aiHasKey && !aiConfigKey.trim()) {
                        message.warning('请填写 API Key');
                        return;
                    }
                    try {
                        const payload = {
                            model: aiConfigModel.trim(),
                            baseUrl: aiConfigHost.trim()
                        };
                        if (aiConfigKey.trim()) {
                            payload.apiKey = aiConfigKey.trim();
                        } else if (aiHasKey) {
                            payload.apiKey = '__UNCHANGED__';
                        }
                        const res = await axios.post('/space/crud/ai/config/save', payload);
                        if (res.data?.status === 0) {
                            setAiHasKey(true);
                            setAiConfigKey('');
                            setAiConfigOpen(false);
                            message.success('配置已保存');
                        } else {
                            message.error('保存失败');
                        }
                    } catch (e) {
                        message.error('保存失败');
                    }
                }}
                onCancel={() => setAiConfigOpen(false)}
                okText="保存"
                cancelText="取消"
                width={460}
            >
                <div style={{display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8}}>
                    <div>
                        <div style={{marginBottom: 6, color: '#666'}}>模型 <span style={{color: '#ff4d4f'}}>*</span></div>
                        <Input
                            value={aiConfigModel}
                            onChange={e => setAiConfigModel(e.target.value)}
                            placeholder="如 gpt-4o, gpt-3.5-turbo, deepseek-chat"
                        />
                    </div>
                    <div>
                        <div style={{marginBottom: 6, color: '#666'}}>
                            API Key {!aiHasKey && <span style={{color: '#ff4d4f'}}>*</span>}
                            {aiHasKey && <span style={{color: '#52c41a', fontSize: 12}}>（已配置，留空则不修改）</span>}
                        </div>
                        <Input.Password
                            value={aiConfigKey}
                            onChange={e => setAiConfigKey(e.target.value)}
                            placeholder={aiHasKey ? '••••••（已保存，修改请重新输入）' : 'sk-...'}
                        />
                    </div>
                    <div>
                        <div style={{marginBottom: 6, color: '#666'}}>API Host（可选）</div>
                        <Input
                            value={aiConfigHost}
                            onChange={e => setAiConfigHost(e.target.value)}
                            placeholder="https://api.openai.com"
                        />
                    </div>
                    {!isAiConfigured && (
                        <div style={{
                            padding: '10px 12px',
                            borderRadius: 8,
                            backgroundColor: '#fffbe6',
                            border: '1px solid #ffe58f',
                            fontSize: 13,
                            color: '#d48806'
                        }}>
                            配置完成后才能使用 AI 助手
                        </div>
                    )}
                </div>
            </Modal>

        </div>
    )
}

export default withRouter(UserLayout)
