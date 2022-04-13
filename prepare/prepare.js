let { MongoClient } = require('mongodb')
let { mongodbUrl, env } = require('../backConfig.json')
let { prepareMainLang, makeTranscriptTranslator } = require('./prepareMainLang')
let { translateMassage } = require('./translateMassage')
let { proxyFetch, proxyFetchTime } = require('../lib/backUtils')

async function existPage1(vid, title) {
    let url = `https://www.google.com/search?q=${encodeURIComponent(title)}`
    let html = await proxyFetchTime(url, 10)
    let exist = html.indexOf(vid) !== -1
    return exist
}

async function handle(transMap, page, ctrack) {
    let { vid, languageCode } = ctrack
    if (ctrack.status !== undefined) {
        console.log(`captionTrack has been processed ${vid} ${languageCode}`)
        return
    }

    try {
        let newMassage = await translateMassage(page, 'auto', languageCode)
        let { title } = newMassage
        let exist = await existPage1(vid, title)
        if (exist) throw `title conflict: ${title}`

        let newMsg = {...newMassage, status: 1 }
        await transMap.updateOne(ctrack, { $set: newMsg }, { upsert: true })
    } catch (err) {
        await transMap.updateOne(ctrack, { $set: { status: -1 } }, { upsert: true })
        console.log(`${vid} ${languageCode} ${err}`)
    }
}

async function prepare(transMap, page) {
    let { vid, isCCLisence } = page
    if (!isCCLisence) throw "have not Creative Commons Attribution licensed"

    await prepareMainLang(transMap, vid)
    let transcriptTranslator = await makeTranscriptTranslator(transMap, vid)

    let cursor = transMap.find({ vid }).project({ _id: 0, vid: 1, languageCode: 1, status: 1 })
    let promise = null
    for await (let ctrack of cursor) {
        await handle(transMap, page, ctrack)
        promise = transcriptTranslator(ctrack.languageCode)
    }
    await promise
}

async function prepare0(transMap, page) {
    let { vid } = page
    try {
        await prepare(transMap, page)
        console.log(`prepare ${vid}`)

    } catch (err) {
        console.log(`${vid} ${err.toString()}`)
        if (env === 'develop') throw err
    }
}

async function prepareAll() {
    let db = await MongoClient.connect(mongodbUrl)
    let database = db.db("youtube-cc");
    let pageMap = database.collection("pageMap")
    let transMap = database.collection("transMap")

    let cursorMap = database.collection("cursorMap")
    let { processed } = await cursorMap.findOne({ task: "prepare" })
    let cursor = pageMap.find()

    if (env === 'develop') processed = 0
    cursor.skip(processed)

    for await (let page of cursor) {
        console.log(`handle ${processed}`)
        processed++
        await prepare0(transMap, page)
        await cursorMap.updateOne({ task: "prepare" }, { $set: { processed } }, { upsert: true })
    }
    await db.close();
}

prepareAll()