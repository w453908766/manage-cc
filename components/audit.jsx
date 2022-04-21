import { useFetch } from '../lib/utils'
import config from '../config.json'
import styles from '../styles/audit.module.css'
import { ControlBar } from './controlBar'
import { useState, useContext, useEffect } from 'react'
import { AuditContext } from './auditContext'

function Ctrack({ ctrack }) {
  let { vid, languageCode, title, status } = ctrack
  let { checkedMap, setCheckedMap } = useContext(AuditContext);

  let key = `${vid} ${languageCode}`
  let checked = checkedMap[key] ? true : false

  function change() {
    let newCheckedMap = { ...checkedMap }
    newCheckedMap[key] = !checked
    setCheckedMap(newCheckedMap)
  }

  return (
    <div>
      <input type="checkbox" checked={checked} onChange={change} />
      <span>{status}</span>
      <span>{languageCode}</span>
      <span>{title}</span>
    </div>
  )
}

function CtrackBox({ ctracks }) {
  return (
    <div>
      {ctracks.map((ctrack) => <Ctrack key={ctrack.languageCode} ctrack={ctrack} />)}
    </div>
  )
}

function VideoItem({ video }) {
  let { vid, title, zhTitle, description, keywords, category, ctracks } = video
  // let imgURL = `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`
  let imgURL = `https://i.ytimg.com/vi/${vid}/hq720.jpg`
  let keywords1 = keywords ? keywords.join(', ') : ""

  return (
    <div className={styles.pageItem}>
      <img src={imgURL} className={styles.thumbnail} />
      <div>
        <div className={styles.title} >{title}</div>
        <div className={styles.title} >{zhTitle}</div>
        <div className={styles.description}>{description}</div>
        <div className={styles.category_keywords}>
          <span className={styles.category}>{category}</span>
          <span className={styles.keywords}>{keywords1}</span>
        </div>
        <CtrackBox ctracks={ctracks} />
      </div>
    </div>
  )
}

function Videos({ videos }) {

  return (
    <div>
      {videos.map((video) => <VideoItem key={video.vid} video={video} />)}
    </div>
  )
}

function makeCheckedMap(videos) {
  let checkedMap = {}
  for (let video of videos) {
    let { vid, ctracks } = video
    for (let ctrack of ctracks) {
      let { languageCode, status } = ctrack
      let key = `${vid} ${languageCode}`
      checkedMap[key] = status === 1
    }
  }
  return checkedMap
}

export function Audit() {
  let videos = useFetch([], `${config.domain}/api/audit`)
  let [checkedMap, setCheckedMap] = useState({})
  useEffect(() => {
    setCheckedMap(makeCheckedMap(videos))
  }, [videos])

  return (
    <AuditContext.Provider value={{ checkedMap, setCheckedMap }}>
      <div>
        <ControlBar/>
        <Videos videos={videos} />
      </div>
    </AuditContext.Provider>
  )
}