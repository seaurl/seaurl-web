'use client'
import React, {useState, useEffect, useRef} from "react";
import {
    Card,
    Typography,
    Button,
    Avatar,
    Skeleton,
    Select,
    Space,
    Tag,
    Divider
} from "antd";
import {
    GlobalOutlined,
    FormOutlined,
    FolderOutlined,
    MailOutlined,
    ReadOutlined,
    CalendarOutlined,
    UserOutlined,
    StarOutlined,
    EnvironmentOutlined,
    LinkOutlined,
    IdcardOutlined,
    SettingOutlined,
    OpenAIOutlined
} from "@ant-design/icons";
import {useDispatch, useSelector} from "react-redux";
import {useSession} from "next-auth/react";
import {withRouter} from "@/hoc/withRouter";
import {getUserData} from "@/lib/slices/homeSlice";
import {getUserMostClickUrlList} from "@/lib/slices/systemSlice";
import {getAccountBaseInfo} from "@/lib/slices/authSlice";
import {
    getUrlsByFlag,
    getHeatMapSubmitData,
    getSubmitUrlByDate,
    setSubmitActivityData,
    setQueryDate
} from "@/lib/slices/userSlice";
import {getMyRecentlyNotes} from "@/lib/slices/noteSpaceSlice";
import {getMailProvider, getMailMessages} from "@/lib/slices/mailSpaceSlice";
import axios from "@/lib/axios";
import UserHeatmap from "@/components/user/userHeatmap";
import FavoriteUrls from "@/components/user/favoriteUrls";
import TimeLine from "@/components/user/timeline";
import HistoryEntities from "@/components/user/historyEntities";
import HeatMapLegend from "@/components/heatMapLegend";
import Empty from "@/components/empty";
import IconFont from "@/utils/iconFont";
import {buildFaviconUrl, DEFAULT_FAVICON} from "@/utils/favicon";
import dayjs from 'dayjs';

const {Title, Text} = Typography;
const {Option} = Select;

const sectionTitle = (icon, label, count, link, colors) => (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
        <Space size={8}>
            {icon && <span style={{color: colors.accent, fontSize: 16}}>{icon}</span>}
            <span style={{fontWeight: 600, fontSize: 15, color: colors.textPrimary}}>{label}</span>
            {count !== undefined && (
                <span style={{fontWeight: 400, fontSize: 13, color: colors.textTertiary}}>({count})</span>
            )}
        </Space>
        {link && (
            <a onClick={link} style={{color: colors.textTertiary, fontSize: 14, cursor: 'pointer', lineHeight: 1}}>→</a>
        )}
    </div>
);

const DashboardPage = ({userInfo, routerPush}) => {
    const {data: session} = useSession();
    const dispatch = useDispatch();

    const {userData} = useSelector(state => state.home);
    const {topUrls} = useSelector(state => state.system);
    const {accountInfo} = useSelector(state => state.auth);
    const {
        recentlyVisitUrls,
        heatmapSubmitData,
        submitYearList,
        submitActivityData,
        queryDate
    } = useSelector(state => state.user);
    const {platFormTheme} = useSelector(state => state.system);

    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const queryListAbortControllerRef = useRef();
    const [recentNotes, setRecentNotes] = useState([]);
    const [recentFiles, setRecentFiles] = useState([]);
    const [unreadMails, setUnreadMails] = useState([]);
    const [userAiTools, setUserAiTools] = useState([]);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkDark = () => {
            const bg = platFormTheme.background;
            if (bg === 'dark') return true;
            if (bg === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches;
            return false;
        };
        const apply = () => setIsDark(checkDark());
        apply();
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        mql.addEventListener('change', apply);
        return () => mql.removeEventListener('change', apply);
    }, [platFormTheme.background]);

    useEffect(() => {
        const hour = new Date().getHours();
        let greet = '晚上好';
        if (hour < 6) greet = '凌晨好';
        else if (hour < 9) greet = '早上好';
        else if (hour < 12) greet = '上午好';
        else if (hour < 14) greet = '中午好';
        else if (hour < 18) greet = '下午好';
        setGreeting(greet);

        const now = new Date();
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${weekDays[now.getDay()]}`;
        setCurrentDate(dateStr);

        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const startDate = dayjs().format('YYYY-MM');

        await Promise.all([
            dispatch(getUserData()),
            dispatch(getUserMostClickUrlList()),
            dispatch(getAccountBaseInfo()),
            dispatch(getUrlsByFlag({flag: 'click'})),
            dispatch(getHeatMapSubmitData({
                date: startDate,
                type: 'currentDate'
            }))
        ]);

        try {
            const notesRes = await dispatch(getMyRecentlyNotes());
            if (notesRes.payload?.status === 0 && notesRes.payload?.data) {
                setRecentNotes(notesRes.payload.data.slice(0, 6));
            }
        } catch (e) {
            console.log('获取笔记失败:', e);
        }

        try {
            const filesRes = await axios.get('/space/crud/file/getRecentlyFiles');
            if (filesRes.data?.status === 0 && filesRes.data?.data) {
                setRecentFiles(filesRes.data.data.slice(0, 6));
            }
        } catch (e) {
            console.log('获取文件失败:', e);
        }

        try {
            const providerRes = await dispatch(getMailProvider({abortController: new AbortController()}));
            if (providerRes.payload?.status === 0 && providerRes.payload?.data?.length > 0) {
                const firstProvider = providerRes.payload.data[0];
                const inboxFolder = firstProvider.mailFolderList?.find(f => f.realName === 'INBOX');
                if (inboxFolder) {
                    const mailRes = await dispatch(getMailMessages({
                        data: {
                            email: inboxFolder.email,
                            folderName: inboxFolder.realName,
                            pageNum: 1,
                            pageSize: 6,
                        },
                        abortController: new AbortController()
                    }));
                    if (mailRes.payload?.data?.rows) {
                        setUnreadMails(mailRes.payload.data.rows.slice(0, 6));
                    }
                }
            }
        } catch (e) {
            console.log('获取邮件失败:', e);
        }

        try {
            const toolsRes = await axios.get('/space/crud/userAiTools/query');
            if (toolsRes.data?.status === 0 && toolsRes.data?.data) {
                setUserAiTools(toolsRes.data.data.slice(0, 8));
            }
        } catch (e) {
            console.log('获取工具失败:', e);
        }

        setTimeout(() => setLoading(false), 300);
    };

    const profileInfo = accountInfo || {};

    function getIpAddr() {
        if (profileInfo.ipAddr) {
            const s = profileInfo.ipAddr.split('|');
            if (s.length > 0) {
                if (s[2] === 0) return '内网IP';
                else return s[2];
            }
        }
        return '未知';
    }

    const userName = session?.user?.name || '用户';
    const userAvatar = session?.user?.image || userInfo?.image;

    const guysInfo = {
        userName: userName,
        nickName: profileInfo?.nickName || userName,
        avatar: userAvatar,
        email: profileInfo?.email,
        website: profileInfo?.website,
        school: profileInfo?.school,
        company: profileInfo?.company,
        ipAddr: profileInfo?.ipAddr,
    };

    const getSubmitTotal = () => {
        let sum = 0;
        if (heatmapSubmitData) {
            heatmapSubmitData.forEach(item => sum += item.count);
            return sum;
        }
        return sum;
    };

    const handleChangeYear = async (value) => {
        let month = 12;
        if (dayjs().year() === value) {
            const _m = dayjs().month() + 1;
            month = _m < 10 ? `0${_m}` : _m;
        }
        const date = `${value}-${month}`;
        dispatch(setQueryDate(date));
        await dispatch(getHeatMapSubmitData({
            date,
            type: 'fullYear'
        }));
    };

    const handleShowMoreActivity = async () => {
        if (queryListAbortControllerRef.current?.abort) {
            queryListAbortControllerRef.current.abort();
        }
        queryListAbortControllerRef.current = new AbortController();
        const prevDate = submitActivityData[submitActivityData.length - 1]?.date;
        let nextDate = '';
        let format = '';
        if (prevDate && dayjs(prevDate, 'YYYY-MM', true).isValid()) {
            nextDate = dayjs(prevDate).add(-1, 'month').format('YYYY-MM');
            format = 'y-m';
        }
        if (prevDate && dayjs(prevDate, 'YYYY-MM-DD', true).isValid()) {
            nextDate = dayjs(prevDate).add(-1, 'day').format('YYYY-MM-DD');
            format = 'y-m-d';
        }
        const res = await dispatch(getSubmitUrlByDate({
            date: nextDate,
            format,
            abortController: queryListAbortControllerRef.current
        }));
        if (res.payload?.data && res.payload.data.length > 0) {
            dispatch(setSubmitActivityData({
                data: res.payload.data[0],
                format: 'push'
            }));
        }
    };

    const colors = {
        pageBg: isDark ? '#0d1117' : '#f5f5f9',
        cardBg: isDark ? '#161b22' : '#fff',
        cardBorder: isDark ? '#30363d' : '#f0f0f0',
        boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
        boxShadowSm: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.04)',
        toolCardBg: isDark ? '#1C2126' : '#f8f7ff',
        accent: isDark ? '#a78bfa' : '#54458B',
        textPrimary: isDark ? '#e6edf3' : '#1a1a2e',
        textSecondary: isDark ? '#8b949e' : '#6b7280',
        textTertiary: isDark ? '#6e7681' : '#9ca3af',
        dividerBorder: isDark ? '#30363d' : '#f0f0f0',
    };

    const renderTimeLine = () => {
        if (!submitActivityData || submitActivityData.length === 0) {
            return <Empty />;
        }
        let showMore = true;
        const timeline = submitActivityData.map((item, idx) => {
            const day = item.date.split('-');
            if (day.length > 2) showMore = false;

            const urlCount = item.url?.count || 0;
            const noteCount = item.note?.count || 0;
            const fileCount = item.file?.count || 0;
            const mailCount = item.mail?.count || 0;
            const total = urlCount + noteCount + fileCount + mailCount;

            const countSegment = (n) => (
                <span style={{color: colors.accent, fontWeight: 600, padding: '0 4px'}}>{n}</span>
            );

            return (
                <TimeLine
                    key={idx}
                    icon={<LinkOutlined style={{fontSize: '16px'}} />}
                    data={{
                        prefix: day.length === 2
                            ? dayjs(item.date).format("MM月")
                            : dayjs(item.date).format("MM月DD日"),
                        suffix: dayjs(item.date).format("YYYY"),
                        content: total > 0
                            ? [{
                                title: (
                                    <div className={'flex items-center'}>
                                        <span style={{color: colors.textSecondary, fontSize: 14}}>
                                            创建了{countSegment(urlCount)}个网址，
                                            创建了{countSegment(noteCount)}个笔记，
                                            上传{countSegment(fileCount)}个文件，
                                            收到{countSegment(mailCount)}封邮件
                                        </span>
                                    </div>
                                ),
                                comp: <HistoryEntities data={item} colors={colors} />
                            }]
                            : [{
                                title: '',
                                comp: <Empty />
                            }]
                    }}
                />
            );
        });

        return (
            <>
                {timeline}
                {showMore && (
                    <div style={{marginTop: 16}}>
                        <Button
                            block
                            onClick={handleShowMoreActivity}
                            style={{
                                borderRadius: 10,
                                border: `1px dashed ${colors.cardBorder}`,
                                color: colors.textSecondary,
                                height: 40
                            }}
                        >
                            显示更多活动
                        </Button>
                    </div>
                )}
            </>
        );
    };

    return (
        <div
            className="h-full w-full overflow-y-auto overflow-x-hidden"
            style={{background: colors.pageBg, transition: 'background 0.3s'}}
        >
            <div className="w-full mx-auto" style={{maxWidth: 1400, padding: '16px 16px'}}>
                {/* ===== 移动端用户信息（横向卡片） ===== */}
                <div className="xl:hidden mb-4 rounded-2xl p-4 flex items-center gap-4"
                     style={{background: colors.cardBg, boxShadow: colors.boxShadowSm}}>
                    <Avatar size={56} src={userAvatar} icon={!userAvatar && <UserOutlined />}
                            style={{backgroundColor: colors.accent, border: 'none', flexShrink: 0}}/>
                    <div style={{minWidth: 0, flex: 1}}>
                        <div style={{fontSize: 15, fontWeight: 600, color: colors.textPrimary}}>
                            {greeting}，{profileInfo?.nickName || userName}
                        </div>
                        <div style={{fontSize: 12, color: colors.textTertiary, marginTop: 2}}>{currentDate}</div>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-6 items-stretch">
                    {/* ===== 左侧用户信息面板（桌面端） ===== */}
                    <div className="hidden xl:flex flex-col w-[280px] shrink-0 rounded-2xl p-5 sticky top-4"
                         style={{background: colors.cardBg, boxShadow: colors.boxShadowSm, transition: 'background 0.3s, box-shadow 0.3s', alignSelf: 'flex-start'}}>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
                            <Avatar
                                size={160}
                                src={userAvatar}
                                icon={!userAvatar && <UserOutlined />}
                                style={{backgroundColor: colors.accent, border: 'none'}}
                            />
                            <div style={{textAlign: 'center'}}>
                                <div style={{fontSize: 16, fontWeight: 600, color: colors.textPrimary}}>
                                    {greeting}，{profileInfo?.nickName || userName}
                                </div>
                                <div style={{fontSize: 12, color: colors.textTertiary, marginTop: 4}}>{currentDate}</div>
                            </div>
                        </div>

                        <Divider style={{margin: '16px 0', borderColor: colors.dividerBorder}} />

                        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 12, color: colors.textSecondary, fontSize: 13}}>
                                <UserOutlined style={{color: colors.accent, fontSize: 14}} />
                                <span>{userName}</span>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', gap: 12, color: colors.textSecondary, fontSize: 13}}>
                                <EnvironmentOutlined style={{color: colors.accent, fontSize: 14}} />
                                <span>{getIpAddr()}</span>
                            </div>
                            {profileInfo?.email && (
                                <div style={{display: 'flex', alignItems: 'center', gap: 12, color: colors.textSecondary, fontSize: 13, minWidth: 0}}>
                                    <MailOutlined style={{color: colors.accent, fontSize: 14, flexShrink: 0}} />
                                    <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{profileInfo.email}</span>
                                </div>
                            )}
                            {profileInfo?.website && (
                                <div style={{display: 'flex', alignItems: 'center', gap: 12, color: colors.textSecondary, fontSize: 13, minWidth: 0}}>
                                    <LinkOutlined style={{color: colors.accent, fontSize: 14, flexShrink: 0}} />
                                    <a href={profileInfo.website} target="_blank" style={{color: colors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{profileInfo.website}</a>
                                </div>
                            )}
                            {profileInfo?.school && (
                                <div style={{display: 'flex', alignItems: 'center', gap: 12, color: colors.textSecondary, fontSize: 13}}>
                                    <IdcardOutlined style={{color: colors.accent, fontSize: 14}} />
                                    <span>{profileInfo.school}</span>
                                </div>
                            )}
                            {profileInfo?.company && (
                                <div style={{display: 'flex', alignItems: 'center', gap: 12, color: colors.textSecondary, fontSize: 13}}>
                                    <IconFont type="icon-gongsi" style={{color: colors.accent, fontSize: 14}} />
                                    <span>{profileInfo.company}</span>
                                </div>
                            )}
                        </div>

                        <Divider style={{margin: '16px 0', borderColor: colors.dividerBorder}} />

                        <Button
                            block
                            onClick={() => routerPush('/setting/profile')}
                            type="text"
                            icon={<SettingOutlined />}
                            style={{color: colors.accent, justifyContent: 'flex-start'}}
                        >
                            设置
                        </Button>
                    </div>

                    {/* ===== 右侧主要内容区域 ===== */}
                    <div className="flex-1 min-w-0">

                    {/* ===== 常用工具 ===== */}
                    <div className="mb-4 xl:mb-6">
                    <Card
                        style={{borderRadius: 16, border: 'none', boxShadow: colors.boxShadow, background: colors.cardBg, transition: 'background 0.3s, box-shadow 0.3s'}}
                        styles={{body: {padding: 16}, header: {borderBottom: `1px solid ${colors.cardBorder}`, padding: '12px 16px'}}}
                        title={sectionTitle(<OpenAIOutlined style={{color: colors.accent}} />, '常用工具', undefined, () => routerPush('/aiSpace/aiUsed'), colors)}
                    >
                        {loading ? (
                            <Skeleton active paragraph={{rows: 1}} />
                        ) : userAiTools.length === 0 ? (
                            <Empty />
                        ) : (
                            <div style={{display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8}}>
                                {userAiTools.map((tool, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => routerPush(`/aiSpace/aiUsed?usedId=${tool.usedId}`)}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '12px 16px',
                                            background: colors.toolCardBg,
                                            borderRadius: 12,
                                            boxShadow: colors.boxShadowSm,
                                            cursor: 'pointer',
                                            width: 100,
                                            flexShrink: 0,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Avatar src={tool.avatar} size={40} style={{backgroundColor: colors.accent, border: 'none'}} />
                                        <span style={{fontSize: 12, color: colors.textPrimary, textAlign: 'center', whiteSpace: 'nowrap'}}>{tool.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                    </div>

                    {/* ===== 四宫格快捷入口 ===== */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-4 xl:mb-6">
                            <Card
                                className="overflow-hidden"
                                style={{borderRadius: 16, border: 'none', boxShadow: colors.boxShadow, background: colors.cardBg, transition: 'background 0.3s, box-shadow 0.3s'}}
                                styles={{body: {padding: 16}, header: {borderBottom: `1px solid ${colors.cardBorder}`, padding: '12px 16px'}}}
                                title={sectionTitle(<GlobalOutlined style={{color: colors.accent}} />, '常用网址', userData?.urlCount, () => routerPush('/urlSpace'), colors)}
                            >
                                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                                    <div style={{flex: 1}}>
                                        {loading ? (
                                            <Skeleton active paragraph={{rows: 4}} />
                                        ) : (recentlyVisitUrls?.slice(0, 6) || []).length === 0 ? (
                                            <Empty />
                                        ) : (
                                            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                                                {(recentlyVisitUrls?.slice(0, 6) || []).map((url, idx) => (
                                                    <a key={idx} href={url.url} target="_blank" style={{display: 'flex', alignItems: 'center', gap: 12, color: colors.textPrimary, textDecoration: 'none', fontSize: 13}}>
                                                        <img src={buildFaviconUrl(url)} style={{width: 16, height: 16, borderRadius: 4}} onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FAVICON; }} />
                                                        <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{url.title}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                            <Card
                                className="overflow-hidden"
                                style={{borderRadius: 16, border: 'none', boxShadow: colors.boxShadow, background: colors.cardBg, transition: 'background 0.3s, box-shadow 0.3s'}}
                                styles={{body: {padding: 16}, header: {borderBottom: `1px solid ${colors.cardBorder}`, padding: '12px 16px'}}}
                                title={sectionTitle(<FormOutlined style={{color: '#08979c'}} />, '常用笔记', userData?.noteCount, () => routerPush('/noteSpace'), colors)}
                            >
                                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                                    <div style={{flex: 1}}>
                                        {loading ? (
                                            <Skeleton active paragraph={{rows: 4}} />
                                        ) : recentNotes.length === 0 ? (
                                            <Empty />
                                        ) : (
                                            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                                                {recentNotes.map((note, idx) => (
                                                    <div key={idx} style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: colors.textPrimary, cursor: 'pointer'}} onClick={() => routerPush('/noteSpace')}>
                                                        <FormOutlined style={{color: '#08979c', fontSize: 14}} />
                                                        <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{note.title || '无标题'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                            <Card
                                className="overflow-hidden"
                                style={{borderRadius: 16, border: 'none', boxShadow: colors.boxShadow, background: colors.cardBg, transition: 'background 0.3s, box-shadow 0.3s'}}
                                styles={{body: {padding: 16}, header: {borderBottom: `1px solid ${colors.cardBorder}`, padding: '12px 16px'}}}
                                title={sectionTitle(<FolderOutlined style={{color: '#d48806'}} />, '常用文件', userData?.fileCount, () => routerPush('/fileSpace'), colors)}
                            >
                                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                                    <div style={{flex: 1}}>
                                        {loading ? (
                                            <Skeleton active paragraph={{rows: 4}} />
                                        ) : recentFiles.length === 0 ? (
                                            <Empty />
                                        ) : (
                                            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                                                {recentFiles.map((file, idx) => (
                                                    <div key={idx} style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: colors.textPrimary, cursor: 'pointer'}} onClick={() => routerPush('/fileSpace')}>
                                                        <FolderOutlined style={{color: '#d48806', fontSize: 14}} />
                                                        <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{file.name || file.fileName || '未命名文件'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                            <Card
                                className="overflow-hidden"
                                style={{borderRadius: 16, border: 'none', boxShadow: colors.boxShadow, background: colors.cardBg, transition: 'background 0.3s, box-shadow 0.3s'}}
                                styles={{body: {padding: 16}, header: {borderBottom: `1px solid ${colors.cardBorder}`, padding: '12px 16px'}}}
                                title={sectionTitle(<MailOutlined style={{color: '#c41d7f'}} />, '未读邮件', userData?.mailUnreadCount, () => routerPush('/mailSpace'), colors)}
                            >
                                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                                    <div style={{flex: 1}}>
                                        {loading ? (
                                            <Skeleton active paragraph={{rows: 4}} />
                                        ) : unreadMails.length === 0 ? (
                                            <Empty />
                                        ) : (
                                            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                                                {unreadMails.map((mail, idx) => (
                                                    <div key={idx} style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: colors.textPrimary, cursor: 'pointer'}} onClick={() => routerPush('/mailSpace')}>
                                                        <MailOutlined style={{color: '#c41d7f', fontSize: 14}} />
                                                        <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{mail.subject || '无主题'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="hidden xl:block mb-4 xl:mb-6">
                        <Card
                            className="mb-6 overflow-hidden"
                            style={{
                                borderRadius: 16,
                                border: 'none',
                                boxShadow: colors.boxShadow,
                                background: colors.cardBg,
                                transition: 'background 0.3s, box-shadow 0.3s'
                            }}
                            styles={{
                                body: {padding: 20},
                                header: {
                                    borderBottom: `1px solid ${colors.cardBorder}`,
                                    padding: '14px 20px'
                                }
                            }}
                            title={
                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                                    {sectionTitle(<CalendarOutlined style={{color: colors.accent}} />, '提交历史', undefined, undefined, colors)}
                                    <div className="heatmap-legend-desktop">
                                        <HeatMapLegend />
                                    </div>
                                </div>
                            }
                        >
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12}}>
                                <span style={{color: colors.textSecondary, fontSize: 13}}>
                                    过去一年共提交
                                    <span style={{color: colors.accent, fontWeight: 600, padding: '0 4px'}}>{getSubmitTotal()}</span>
                                    次
                                </span>
                            </div>
                            <UserHeatmap guysInfo={guysInfo} userInfo={session?.user} />
                        </Card>
                        </div>

                        {/* ===== 活动记录 ===== */}
                        <Card
                            className="mb-6 overflow-hidden"
                            style={{
                                borderRadius: 16,
                                border: 'none',
                                boxShadow: colors.boxShadow,
                                background: colors.cardBg,
                                transition: 'background 0.3s, box-shadow 0.3s'
                            }}
                            styles={{
                                body: {padding: 20},
                                header: {
                                    borderBottom: `1px solid ${colors.cardBorder}`,
                                    padding: '14px 20px'
                                }
                            }}
                            title={
                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                                    {sectionTitle(<ReadOutlined style={{color: colors.accent}} />, '活动记录', undefined, undefined, colors)}
                                    <Select
                                        defaultValue={dayjs().year()}
                                        onChange={handleChangeYear}
                                        style={{width: 100}}
                                        size="small"
                                        variant="borderless"
                                    >
                                        {submitYearList?.map(year => (
                                            <Option key={year} value={year}>{year}</Option>
                                        )) || (
                                            <Option value={dayjs().year()}>{dayjs().year()}</Option>
                                        )}
                                    </Select>
                                </div>
                            }
                        >
                            {loading ? (
                                <Skeleton active paragraph={{rows: 3}} />
                            ) : (
                                renderTimeLine()
                            )}
                        </Card>
                        </div>
                    </div>
                </div>
        </div>
    );
};

export default withRouter(DashboardPage);
