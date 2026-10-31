import { createFromIconfontCN } from '@ant-design/icons';

const IconFont = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/c/font_1977664_6fuw275hzw.js',
    // extraCommonProps: { fill: '#fff' }, // 强制设置 fill
});

export default IconFont;


// 如何使用iconfont
//1、引入
// import IconFont from "@/utils/iconFont";
//2、使用
//<IconFont type={"icon-tuijian1"} className={`${styles.icon} ${styles.iconFont}`} />


