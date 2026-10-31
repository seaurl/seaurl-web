'use client'
import React, {useState} from 'react';
import {Row, Col} from 'antd';
import {
    GlobalOutlined,
    FormOutlined,
    FolderOutlined,
    MailOutlined,
    RightOutlined
} from '@ant-design/icons';
import {useDispatch} from 'react-redux';
import {useSession} from 'next-auth/react';
import {userClickUrl} from '@/lib/slices/urlSpaceSlice';
import {withRouter} from '@/hoc/withRouter';
import {buildFaviconUrl, DEFAULT_FAVICON} from '@/utils/favicon';

const DEFAULT_VISIBLE = 3;

const TYPES = [
    {key: 'url',  label: '网址', Icon: GlobalOutlined,  color: '#54458B'},
    {key: 'note', label: '笔记', Icon: FormOutlined,    color: '#08979c'},
    {key: 'file', label: '文件', Icon: FolderOutlined,  color: '#d48806'},
    {key: 'mail', label: '邮件', Icon: MailOutlined,    color: '#c41d7f'}
];

function labelFor(typeKey, row) {
    if (typeKey === 'note') return row?.title || '无标题';
    if (typeKey === 'file') return row?.name || '未命名文件';
    if (typeKey === 'mail') {
        const from0 = Array.isArray(row?.from) && row.from.length > 0 ? row.from[0] : null;
        const fromText = from0 ? (from0.name || from0.address || '') : '';
        const subject = row?.subject || '无主题';
        return fromText ? `${subject} · ${fromText}` : subject;
    }
    return '';
}

function TypeBlock({type, data, colors, session, dispatch, routerPush}) {
    const [showAll, setShowAll] = useState(false);
    const count = data?.count || 0;
    const rows = data?.rows || [];

    if (count === 0 || rows.length === 0) return null;

    const visibleRows = showAll ? rows : rows.slice(0, DEFAULT_VISIBLE);
    const {key, label, Icon, color} = type;

    const handleClick = (row) => {
        if (key === 'url') return; // 由 <a> 处理
        if (key === 'note') {
            routerPush(`/noteSpace?cid=${row.categoryId}&nid=${row.id}`);
            return;
        }
        if (key === 'file') {
            const fullPath = row.fullPath || '';
            const lastSlash = fullPath.lastIndexOf('/');
            const parentPath = lastSlash <= 0 ? '/' : fullPath.substring(0, lastSlash);
            routerPush(`/fileSpace?type=personal&fullPath=${encodeURIComponent(parentPath)}`);
            return;
        }
        if (key === 'mail') {
            routerPush('/mailSpace');
        }
    };

    return (
        <div style={{marginBottom: 18}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                <span style={{fontWeight: 600, fontSize: 13, color: colors.textPrimary}}>{label}</span>
                <span style={{fontSize: 12, color: colors.textTertiary}}>({count})</span>
            </div>
            <Row gutter={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6, xxl: 6}}>
                {visibleRows.map((row, idx) => (
                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12} key={idx}>
                        {key === 'url' ? (
                            <a
                                href={row.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                    if (session?.user) dispatch(userClickUrl(row.id));
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '4px 2px', maxWidth: '90%',
                                    color: colors.textPrimary, textDecoration: 'none', fontSize: 13
                                }}
                            >
                                <span style={{
                                    background: colors.toolCardBg || '#f1f3f4',
                                    border: `1px solid ${colors.cardBorder}`,
                                    borderRadius: 999, height: 26, width: 26,
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <img
                                        src={buildFaviconUrl(row)}
                                        style={{width: 16, height: 16}}
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = DEFAULT_FAVICON;
                                        }}
                                    />
                                </span>
                                <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                    {row.title || row.url}
                                </span>
                            </a>
                        ) : (
                            <div
                                onClick={() => handleClick(row)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '4px 2px', maxWidth: '90%',
                                    color: colors.textPrimary, cursor: 'pointer', fontSize: 13
                                }}
                            >
                                <Icon style={{color, fontSize: 14, flexShrink: 0}}/>
                                <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                    {labelFor(key, row)}
                                </span>
                            </div>
                        )}
                    </Col>
                ))}
            </Row>
            {rows.length > DEFAULT_VISIBLE && (
                <div
                    onClick={() => setShowAll(v => !v)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        color: colors.accent, fontSize: 12, cursor: 'pointer',
                        padding: '4px 0', marginTop: 4
                    }}
                >
                    {showAll ? '收起' : `查看更多(${rows.length - DEFAULT_VISIBLE})`}
                    <RightOutlined style={{fontSize: 10}}/>
                </div>
            )}
        </div>
    );
}

const HistoryEntities = ({data, colors, routerPush}) => {
    const dispatch = useDispatch();
    const {data: session} = useSession();

    return (
        <div style={{paddingTop: 8}}>
            {TYPES.map(t => (
                <TypeBlock
                    key={t.key}
                    type={t}
                    data={data?.[t.key]}
                    colors={colors}
                    session={session}
                    dispatch={dispatch}
                    routerPush={routerPush}
                />
            ))}
        </div>
    );
};

export default withRouter(HistoryEntities);
