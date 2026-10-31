'use client'
import { Typography, Card } from 'antd';
import { BulbOutlined, EyeOutlined, HeartOutlined, CustomerServiceOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useSelector } from "react-redux";

const { Title, Paragraph, Text } = Typography;

const About = () => {
    const { platFormTheme } = useSelector(state => state.system)
    const primaryColor = platFormTheme?.color || '#54458A'

    const sections = [
        {
            icon: <InfoCircleOutlined />,
            title: '关于Seaurl',
            content: '在数字化时代，我们每天都会接触大量信息和各式各样的工具，无论是AI搜索提供的内容，还是工作中使用的关键工具。对于许多人来说，有效管理这些信息和工具是一个挑战，这正是 Seaurl 的使命所在。'
        },
        {
            icon: <BulbOutlined />,
            title: '使命',
            content: 'I WANT TO CHANGE THE WORLD! 《四魂之玉》拥有强大的力量，但被阿离一箭射中后碎裂四散。我的任务是像阿离和犬夜叉一样，踏遍世界各地，收集并打造像《四魂之玉》一样强大力量的AI工具，为每一位用户提供至尊般的体验。'
        },
        {
            icon: <EyeOutlined />,
            title: '愿景',
            content: '致力于构建全球领先的AI工具管理平台'
        },
        {
            icon: <HeartOutlined />,
            title: '价值观',
            content: '那些疯狂的以为自己能改变世界的人才是真正能改变世界的人'
        },
        {
            icon: <CustomerServiceOutlined />,
            title: '联系方式',
            content: null,
            contact: [
                { label: '邮箱', value: 'seaurl@126.com' },
                { label: 'QQ群', value: '701558381' }
            ]
        }
    ]

    return (
        <div className={'w-full h-full overflow-y-auto px-[16px] py-[12px]'}>
            <div className={'max-w-[700px]'}>
                <Title level={4} className={'flex items-center gap-2'}>
                    <InfoCircleOutlined /> 关于Seaurl
                </Title>
                <div className={'flex flex-col gap-4 mt-4'}>
                    {sections.slice(1).map((section, index) => (
                        <Card key={index} size="small" className={'shadow-sm'}>
                            <div className={'flex items-start gap-3'}>
                                <div className={'flex items-center justify-center w-[32px] h-[32px] rounded-full shrink-0 mt-0.5'}
                                     style={{ backgroundColor: primaryColor + '20', color: primaryColor }}>
                                    {section.icon}
                                </div>
                                <div className={'flex-1 min-w-0'}>
                                    <Text strong className={'text-base'}>{section.title}</Text>
                                    {section.content && (
                                        <Paragraph className={'mt-2 mb-0 text-[#666] dark:text-[#aaa]'}>
                                            <Text style={{ fontSize: '15px' }} className={'text-[#666] dark:text-[#aaa]'}>
                                                {section.content}
                                            </Text>
                                        </Paragraph>
                                    )}
                                    {section.contact && (
                                        <div className={'flex flex-col gap-1 mt-2'}>
                                            {section.contact.map((item, i) => (
                                                <Text key={i} style={{ fontSize: '15px' }} className={'text-[#666] dark:text-[#aaa]'}>
                                                    {item.label}：{item.value}
                                                </Text>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
};

export default About;
