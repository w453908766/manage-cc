let { proxyFetch } = require('../lib/backUtils')


function combineMassage({ title, keywords, description }) {
    let separator = '-------------'
    let keywords0 = keywords || []
    let description0 = description ? description.substr(0, 5000) : ''
    let pack = [title, ...keywords0, separator, description0].join('\n')
    let enline = encodeURIComponent(pack)
    return enline
}



function splitMassage(relines) {
    let separator = '-------------'
    let sepIndex = relines.indexOf(separator)
    let newTitle = relines[0]
    let newKeywords = relines.slice(1, sepIndex)
    let newDescription = relines.slice(sepIndex + 1).join(' ')
    return { title: newTitle, keywords: newKeywords, description: newDescription }
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

let massage = {
        "title": "Earth Optics Video 3: Fast & Slow Ray",
        "keywords": ["mineralogy", "optical microscopy", "earth materials", "geoscience education", "geology", "fast and slow ray", "accessory plate", "gypsum plate", "retardation", "interference color", "extinction angle"],
        "description": "In this video, I introduce the concept of light propogating through minerals as a faster and slower ray. Examples use the accessory plate to determine orientation of a faster and slower ray.\n\nFor supplemental questions and resources, please check out my webpage at www.earthopticsmineralogy.com\n\nAccessory Plate Image:\nhttp://micro.magnet.fsu.edu/primer/techniques/polarized/images/firstorderfigure1.jpg\n\nMichel-Levy Chart:\nUniversity of Liverpool. D Flinn G Newell"
    }
    //translateMassage(massage, "auto", "de").then((r) => console.log(r))