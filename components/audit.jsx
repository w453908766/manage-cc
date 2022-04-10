import { useFetch } from '../lib/utils'
import config from '../config.json'
import styles from '../styles/audit.module.css'


//        vid: page.vid,
//        title: caption.title || page.title,
//        keywords: caption.keywords || page.keywords,
//        description: caption.description || page.description,
//
//        publishDate: page.publishDate || null,
//        viewCount: page.viewCount,
//          page.category

function PageItem({ page }) {
  let imgURL = `https://i.ytimg.com/vi/${page.vid}/hqdefault.jpg`
  let keywords = page.keywords ? page.keywords.join(', ') : ""
  return (
    <div className={styles.pageItem}>
      <img src={imgURL} className={styles.thumbnail} />
      <div>
        <div className={styles.title} >{page.title}</div>
        <div className={styles.description}>{page.description}</div>
        <div className={styles.category_keywords}>
          <span className={styles.category}>{page.category}</span>
          <span className={styles.keywords}>{keywords}</span>
        </div>
      </div>
    </div>
  )
}

export function Audit() {
  let pages = useFetch([], `${config.domain}/api/audit`)
  return (
    <div>
      {pages.map((page) => <PageItem key={page.vid} page={page} />)}
    </div>
  )
}