'use client'
import { Timeline,Divider, Typography } from 'antd';
const { Title, Paragraph, Text, Link } = Typography;

const ClientPage = () => {
  return <div className={'bg-[#e9ecef] p-6 dark:bg-[#141414] dark:text-white'}>
    <div className={'flex items-center justify-center'}>
      <div className={'bg-white rounded-xl p-6 max-w-[1200px] dark:bg-[#1C2126] dark:text-white'}>
        <Typography>
          <Title level={3}>Seaurl 服务协议（草案）</Title>
          <Paragraph>
            欢迎您来到 Seaurl。
          </Paragraph>
          <Paragraph>
            请您仔细阅读以下条款，如果您对本协议的任何条款表示异议，您可以选择不进入 Seaurl。当您注册成功，无论是进入
            Seaurl，还是在 Seaurl 上发布任何内容（即“内容”），均意味着您（即“用户”）完全接受本协议项下的全部条款。
          </Paragraph>
          <Paragraph>
            [TOC]
          </Paragraph>
          <Title level={3}>使用规则</Title>
          <Paragraph>
            <ol>
              <li>
                用户注册成功后，Seaurl 将给予每个用户一个用户账号及相应的密码，该用户账号和密码由用户负责保管；用户应当对以其用户账号进行的所有活动和事件负法律责任。
              </li>
              <li>
                用户须对在 Seaurl 的注册信息的真实性、合法性、有效性承担全部责任，用户不得冒充他人；不得利用他人的名义发布任何信息；不得恶意使用注册账号导致其他用户误认；否则
                SegmentFault 有权立即停止提供服务，收回其账号并由用户独自承担由此而产生的一切法律责任。
              </li>
              <li>
                用户直接或通过各类方式（如 RSS 源和站外 API 引用等）间接使用 Seaurl
                服务和数据的行为，都将被视作已无条件接受本协议全部内容；若用户对本协议的任何条款存在异议，请停止使用
                SegmentFault 所提供的全部服务。
              </li>
              <li>
                Seaurl 是一个信息分享、传播及获取的平台，用户通过 Seaurl 发表的信息为公开的信息，其他第三方均可以通过
                Seaurl 获取用户发表的信息，用户对任何信息的发表即认可该信息为公开的信息，并单独对此行为承担法律责任；任何用户不愿被其他第三人获知的信息都不应该在
                SegmentFault 上进行发表。
              </li>
              <li>
                用户承诺不得以任何方式利用 Seaurl 直接或间接从事违反中国法律以及社会公德的行为，Seaurl 有权对违反上述承诺的内容予以删除。
              </li>
              <li>
                用户不得利用 Seaurl 服务制作、上载、复制、发布、传播或者转载如下内容：
                <ul>
                  <li>反对宪法所确定的基本原则的；</li>
                  <li>危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；</li>
                  <li>损害国家荣誉和利益的；</li>
                  <li>煽动民族仇恨、民族歧视，破坏民族团结的；</li>
                  <li>侮辱、滥用英烈形象，否定英烈事迹，美化粉饰侵略战争行为的；</li>
                  <li>破坏国家宗教政策，宣扬邪教和封建迷信的；</li>
                  <li>散布谣言，扰乱社会秩序，破坏社会稳定的；</li>
                  <li>散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；</li>
                  <li>侮辱或者诽谤他人，侵害他人合法权益的；</li>
                  <li>含有法律、行政法规禁止的其他内容的信息。</li>
                </ul>
              </li>
              <li>
              </li>
              <li>
              </li>
            </ol>
          </Paragraph>

          <Title level={3}>为什么选择 Seaurl？</Title>
          <Paragraph>
            对于那些每天都需要处理大量网址、笔记和文件的人来说，Seaurl 提供了一个简单而强大的解决方案。它不仅帮助用户节省时间，还确保所有的信息都安全地存储和备份。
          </Paragraph>
          <Paragraph>
            总之，Seaurl 是一个为现代人设计的信息管理工具，旨在帮助我们更好地应对数字化时代的挑战。无论你是学生、职员还是自由职业者，Seaurl
            都能为你提供高效、安全的信息管理服务。
          </Paragraph>
          <Title level={3}>联系方式</Title>
          <Paragraph>
            zhangwei900808@126.com
          </Paragraph>
        </Typography>
      </div>
      {/*<Timeline*/}
      {/*    mode="alternate"*/}
      {/*    items={[*/}

      {/*      {*/}
      {/*        color: 'red',*/}
      {/*        children: '2011：Seaurl的想法诞生于安徽芜湖',*/}
      {/*      },*/}
      {/*      {*/}
      {/*        children: 'Create a services site 2015-09-01',*/}
      {/*      },*/}
      {/*    ]}*/}
      {/*/>*/}
    </div>
  </div>
};
export default ClientPage;
