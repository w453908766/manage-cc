let axios = require('axios')
let { axiosOption } = require('../backConfig.json')

async function proxyFetch(url) {
    const res = await axios.get(url, axiosOption)
    return res.data
}

module.exports = { proxyFetch }