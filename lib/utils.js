import { useEffect, useState, useRef } from "react"

export function useFetch(init, url) {
    let [value, setValue] = useState(init)
    useEffect(function() {
        fetch(url).then((req) => req.json()).then(setValue)
    }, [])
    return value
}