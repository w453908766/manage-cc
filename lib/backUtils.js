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
        } else if (statusCode === 302) {
            console.log("wait 60s")
            await timeout(60000)
            return proxyFetch(url)
        } else {
            throw `fetch ${url}, statusCode: ${statusCode}`
        }
    } catch (err) {
        throw err.toString()
    }
}
module.exports = { proxyFetch }