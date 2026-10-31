'use client'
import styles from './index.module.scss'

const HeatMapLegend = (props) => {
  return <div className={styles.tips}>
    <span className={styles.tipTxt}>少</span>
    <svg width="10" height="10" className={styles.inlineBlock}>
      <rect width="10" height="10" className={styles.rect1} rx="8" ry="8" data-level="0"/>
    </svg>
    <svg width="10" height="10" className={styles.inlineBlock}>
      <rect width="10" height="10" className={styles.rect2} rx="8" ry="8" data-level="1"/>
    </svg>
    <svg width="10" height="10" className={styles.inlineBlock}>
      <rect width="10" height="10" className={styles.rect3} rx="8" ry="8" data-level="2"/>
    </svg>
    <svg width="10" height="10" className={styles.inlineBlock}>
      <rect width="10" height="10" className={styles.rect4} rx="8" ry="8" data-level="3"/>
    </svg>
    <svg width="10" height="10" className={styles.inlineBlock}>
      <rect width="10" height="10" className={styles.rect5} rx="8" ry="8" data-level="4"/>
    </svg>
    <span className={styles.tipTxt}>多</span>
  </div>
}

export default HeatMapLegend;