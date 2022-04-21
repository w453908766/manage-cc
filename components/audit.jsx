
import { useState, useContext, useEffect } from 'react'
import { useFetch, post } from '../lib/utils'
import config from '../config.json'
import styles from '../styles/audit.module.css'
import { ControlBar } from './controlBar'
import { AuditContext } from './auditContext'
import domains from '../domains.json'

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

function open(vid) {
  return function () {
    window.open(`${domains[0].domain}/watch?v=${vid}`)
  }
}

function deleteOne(vid) {
  return async function () {
    let res = await post(`${config.domain}/api/deleteOne`, { vid })
    console.log(res)
    if(res === "succ"){
      location.reload()
    }
    return res
  }
}

function ItemLeft({ video }) {
  let { vid } = video
  // let imgURL = `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`
  let imgURL = `https://i.ytimg.com/vi/${vid}/hq720.jpg`
  return (
    <div>
      <img src={imgURL} className={styles.thumbnail} onClick={open(vid)} />
      <div>{vid}</div>
      <button onClick={deleteOne(vid)}>Delete</button>
    </div>
  )
}

function ItemRight({ video }) {
  let { vid, title, zhTitle, description, keywords, category, ctracks } = video
  let keywords1 = keywords ? keywords.join(', ') : ""
  return (
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
  )
}

function VideoItem({ video }) {
  return (
    <div className={styles.pageItem}>
      <ItemLeft video={video} />
      <ItemRight video={video} />
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
        <ControlBar />
        <Videos videos={videos} />
      </div>
    </AuditContext.Provider>
  )
}