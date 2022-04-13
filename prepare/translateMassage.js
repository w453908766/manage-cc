let { proxyFetch, splitArray } = require('../lib/backUtils')


function combineMassage({ title, keywords, description }) {
    let separator = '-------------'
    let title0 = title.split(':')
    let keywords0 = keywords || []
    let description0 = description ? description.substr(0, 5000) : ''
    let pack = [...title0, separator, ...keywords0, separator, description0].join('\n')
    let enline = encodeURIComponent(pack)
    return enline
}



function splitMassage(relines) {
    let separator = '-------------'
    let [title0, keywords0, description0] = splitArray(relines, separator)

    let title = title0.join(': ')
    let keywords = keywords0
    let description = description0.join(' ')
    return { title, keywords, description }
}

async function translate(enline, srcLang, desLang) {
    let url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${srcLang}&tl=${desLang}&q=${enline}`
    let req = await proxyFetch(url)
    if (req[2] === desLang) throw "same language"
    return req[0].map((reline) => reline[0].trim())
}

async function translateMassage(massage, srcLang, desLang) {
    let enline = combineMassage(massage)
    let relines = await translate(enline, srcLang, desLang)
    let newMassage = splitMassage(relines)
    return newMassage
}

module.exports = { translateMassage }

//let massage = { title: "quantum computing", keywords: null, description: null }
//translateMassage(massage, "auto", "zh-CN").then((r) => console.log(r))