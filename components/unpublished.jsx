import {useFetch} from '../lib/utils'
import config from '../config.json'
import styles from '../styles/unpublished.module.css'


//        vid: page.vid,
//        title: caption.title || page.title,
//        keywords: caption.keywords || page.keywords,
//        description: caption.description || page.description,
//
//        publishDate: page.publishDate || null,
//        viewCount: page.viewCount,
//        category: page.category,

function PageItem({ page }) {
  let imgURL = `https://i.ytimg.com/vi/${page.vid}/hqdefault.jpg`
  return (
    <div className={styles.pageItem}>
      <img src={imgURL} className={styles.thumbnail}/>
      <div>
        <div>vid: {page.vid}</div>
        <div>title: {page.title}</div>
        <div>keywords: {page.keywords}</div>
        <div>description: {page.description}</div>
      </div>
    </div>
  )
}

export function Unpublished() {
  let pages = useFetch([], `${config.domain}/api/unpublished`)
  return (
    <div>
      {pages.map((page) => <PageItem key={page.vid} page={page} />)}
    </div>
  )
}