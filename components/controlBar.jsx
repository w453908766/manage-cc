
import { useEffect, useState, useRef, useContext } from "react"
import config from '../config.json'
import { AuditContext } from './auditContext'
import domains from '../domains.json'
import { post } from '../lib/utils'

function DomainSelect({ host, setHost }) {
    function change(event) { setHost(event.target.value) }
    return (
        <select value={host} onChange={change}>
            {domains.map((d) => <option key={d.host}>{d.host}</option>)}
        </select>
    )
}

function upload(host, checkedMap) {
    return async function (event) {
        let res = await post(`${config.domain}/api/upload`, {host, checkedMap})
        console.log(res)
        return res
    }
}

export function ControlBar() {
    let [host, setHost] = useState(domains[0].host)
    let { checkedMap } = useContext(AuditContext);
    return (
        <div>
            <DomainSelect host={host} setHost={setHost} />
            <button onClick={upload(host, checkedMap)}>Upload</button>
            <button>Delete</button>
        </div>
    )
}