let { curly } = require('node-libcurl');
let { curlOption, threadNum } = require('../backConfig.json')

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function proxyFetch(url) {
    try {
        const { statusCode, data, headers } = await curly.get(url, curlOption)
        if (statusCode < 300) {
            return data
        } else {
            throw `fetch ${url}, statusCode: ${statusCode}`
        }
    } catch (err) {
        throw err.toString()
    }
}

async function proxyFetchTime(url, time) {
    try {
        const { statusCode, data, headers } = await curly.get(url, curlOption)
        if (statusCode < 300) {
            return data
        } else if (statusCode === 302 && time > 0) {
            console.log("wait 60s")
            await timeout(60000)
            return proxyFetchTime(url, time - 1)
        } else {
            throw `fetch ${url}, statusCode: ${statusCode}`
        }
    } catch (err) {
        throw err.toString()
    }
}

function splitArray(arr, p) {
    let ret = []
    let start = 0
    for (let i = 0; i < arr.length; i++) {
        if (p(arr[i])) {
            ret.push(arr.slice(start, i))
            start = i + 1
        }
    }
    ret.push(arr.slice(start, arr.length))
    return ret
}

module.exports = { proxyFetch, proxyFetchTime, splitArray }