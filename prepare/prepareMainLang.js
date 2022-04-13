let { translateTranscript } = require('./translateTranscript')

let mainLangs = ['en', 'zh-CN', 'zh-TW', 'fr', 'de', 'ru', 'ja']

function getMainLang(existLangs) {
    if (existLangs.length === 0) throw `have not transcript in any language`
    for (let lang of mainLangs) {
        if (existLangs.indexOf(lang) !== -1) {
            return lang
        }
    }
    return existLangs[0]
}

let effectLangs = ['es', 'ja', 'pt', 'de', 'ar', 'fr', 'ru', 'ko', 'tl']

async function translateLang(transMap, srcLangCode, srcTranscript, vid, lang) {
    if (await transMap.findOne({ vid, lang }) === null) {
        try {
            let transcript = await translateTranscript(srcTranscript, srcLangCode, lang)
            await transMap.updateOne({ vid, languageCode: lang }, { $set: { transcript } }, { upsert: true })

        } catch (err) {
            console.log(`translate transcript error: ${vid} ${srcLangCode} -> ${lang}, ${err}`)
        }
    }
}

async function prepareMainLang(transMap, vid) {
    let existLangs = await transMap.find({ vid }).project({ _id: 0, languageCode: 1 }).map(({ languageCode }) => languageCode).toArray()
    let srcLangCode = getMainLang(existLangs)

    let { transcript: srcTranscript } = await transMap.findOne({ vid, languageCode: srcLangCode })

    let ps = effectLangs.map((lang) => translateLang(transMap, srcLangCode, srcTranscript, vid, lang))
    await Promise.all(ps)
}

module.exports = { prepareMainLang }

/*
let { MongoClient } = require('mongodb')
let { mongodbUrl } = require('../backConfig.json')

async function f() {
    let db = await MongoClient.connect(mongodbUrl)
    let database = db.db("youtube-cc");
    let transMap = database.collection("transMap")
    let { transcript: srcTranscript } = await transMap.findOne({ vid: "uOwfC3BiTqc", languageCode: "en" })
    let transcript = await translateTranscript(srcTranscript, "en", "ja")

    console.log(srcTranscript)
    console.log(transcript)

    await db.close();
}

//f()

async function g() {
    let db = await MongoClient.connect(mongodbUrl)
    let database = db.db("youtube-cc");
    let transMap = database.collection("transMap")
    await prepareMainLang(transMap, "uOwfC3BiTqc")
    db.close()
}

g()
*/