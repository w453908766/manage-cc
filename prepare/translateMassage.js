let { proxyFetch } = require('../lib/backUtils')

async function handleMassage(f, { title, keywords, description }) {
    let separator = '-------------'
    let keywords0 = keywords || []
    let description0 = description ? description.substr(0, 5000) : ''
    let pack = [title, ...keywords0, separator, description0].join('\n')
    let enline = encodeURIComponent(pack)
    let relines = await f(enline)

    let sepIndex = relines.indexOf(separator)
    let newTitle = relines[0]
    let newKeywords = relines.slice(1, sepIndex)
    let newDescription = relines.slice(sepIndex + 1).join(' ')
    return { title: newTitle, keywords: newKeywords, description: newDescription }
}

function makeTranslator(srcLang, desLang) {
    return async function(enline) {
        let url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${srcLang}&tl=${desLang}&q=${enline}`
        let req = await proxyFetch(url)
        return req[0].map((reline) => reline[0].trim())
    }
}

async function translateMassage(massage, srcLang, desLang) {
    let translator = makeTranslator(srcLang, desLang)
    let newMassage = await handleMassage(translator, massage)
    return newMassage
}

module.exports = { translateMassage }

//let massage = { title: "quantum computing", keywords: null, description: null }
//translateMassage(massage, "auto", "zh-CN").then((r) => console.log(r))