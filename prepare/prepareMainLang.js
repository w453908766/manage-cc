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


async function translateLang(transMap, srcLangCode, srcTranscript, vid, languageCode) {
    let ctrack = await transMap.findOne({ vid, languageCode })
    if (ctrack.status === 1 && ctrack.transcript === undefined) {
        try {
            let transcript = await translateTranscript(srcTranscript, srcLangCode, languageCode)
            await transMap.updateOne({ vid, languageCode }, { $set: { transcript } }, { upsert: true })

        } catch (err) {
            console.log(`translate transcript error: ${vid} ${srcLangCode} -> ${languageCode}, ${err}`)
        }
    }
}

async function makeTranscriptTranslator(transMap, vid) {
    let existLangs = await transMap.find({ vid }).project({ _id: 0, languageCode: 1 }).map(({ languageCode }) => languageCode).toArray()
    let srcLangCode = getMainLang(existLangs)
    let { transcript: srcTranscript } = await transMap.findOne({ vid, languageCode: srcLangCode })

    return (languageCode) => translateLang(transMap, srcLangCode, srcTranscript, vid, languageCode)
}

let effectLangs = ['ja', 'es', 'pt', 'ko', 'ar', 'fr', 'ru', 'de']

async function prepareMainLang(transMap, vid) {
    for (let languageCode of effectLangs) {
        await transMap.updateOne({ vid, languageCode }, { $set: {} }, { upsert: true })
    }
}

module.exports = { prepareMainLang, makeTranscriptTranslator }

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