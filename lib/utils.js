import { useEffect, useState, useRef } from "react"

export function useFetch(init, url) {
    let [value, setValue] = useState(init)
    useEffect(function() {
        fetch(url).then((req) => req.json()).then(setValue)
    }, [])
    return value
}

export async function post(url, data) {
    let option = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }
    let res = await fetch(url, option)
    return await res.json();
}

/*
export function useFetch(init, url) {
    let [value, setValue] = useState(init)

    async function f() {
        let req = await fetch(url)
        let ans = await req.json()
        console.log(value, ans)
        setValue(ans)
    }

    useEffect(function() { f() }, [])
    return value
}
*/