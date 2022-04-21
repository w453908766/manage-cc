
import { useEffect, useState, useRef, useContext } from "react"
import config from '../config.json'
import { AuditContext } from './auditContext'
import domains from '../domains.json'
import { post } from '../lib/utils'

function DomainSelect({ index, setIndex }) {
    function change(event) { setIndex(event.target.value)}
    return (
        <select value={index} onChange={change}>
            {domains.map((d,i) => <option key={i} value={i}>{d.host}</option>)}
        </select>
    )
}

function upload(domain, checkedMap) {
    return async function (event) {
        let res = await post(`${config.domain}/api/upload`, {host:domain.host, checkedMap})
        await fetch(`https://www.google.com/ping?sitemap=${domain.domain}/sitemap.xml`)
        console.log(res)
        return res
    }
}

export function ControlBar() {
    let [domainIndex, setDomainIndex] = useState(0)
    let domain = domains[domainIndex]

    let { checkedMap } = useContext(AuditContext)
    return (
        <div>
            <DomainSelect index={domainIndex} setIndex={setDomainIndex} />
            <button onClick={upload(domain, checkedMap)}>Upload</button>
            <button>Delete</button>
        </div>
    )
}