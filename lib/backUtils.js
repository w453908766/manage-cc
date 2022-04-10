let { curly } = require('node-libcurl');
let { curlOption, threadNum } = require('../backConfig.json')

async function proxyFetch(url) {
    try {
        const { statusCode, data, headers } = await curly.get(url, curlOption)
        if (statusCode < 400) {
            return data
        } else {
            throw `fetch ${url}, statusCode: ${statusCode}`
        }
    } catch (err) {
        throw err.toString()
    }
}
module.exports = { proxyFetch }