let { MongoClient } = require('mongodb')
let { mongodbUrl, env } = require('../backConfig.json')
let { prepareMainLang, makeTranscriptTranslator } = require('./prepareMainLang')
let { translateMassage, translateTitle } = require('./translateMassage')
let { proxyFetch, proxyFetchTime } = require('../lib/backUtils')

async function existPage1(vid, title) {
    let url = `https://www.google.com/search?q=${encodeURIComponent(title)}`
    let html = await proxyFetchTime(url, 10)
    let exist = html.indexOf(vid) !== -1
    return exist
}

async function handle(transMap, prevMassage, ctrack) {
    let { vid, languageCode } = ctrack
    if (ctrack.status !== undefined) {
        console.log(`captionTrack has been processed ${vid} ${languageCode}`)
        return prevMassage
    }

    try {
        if (languageCode === 'en') throw "skip English"

        let newMassage = await translateMassage(prevMassage, 'auto', languageCode)
        let { title } = newMassage
        let exist = await existPage1(vid, title)
        if (exist) throw `title conflict: ${title}`

        let newMsg = {...newMassage, status: 1 }
        await transMap.updateOne(ctrack, { $set: newMsg }, { upsert: true })
        return newMassage
    } catch (err) {
        await transMap.updateOne(ctrack, { $set: { status: -1 } }, { upsert: true })
        console.log(`${vid} ${languageCode} ${err}`)
        return prevMassage
    }
}



async function prepare(pageMap, transMap, page) {
    let { vid, title, isCCLisence } = page
    if (!isCCLisence) throw "have not Creative Commons Attribution licensed"

    let { languageCode, zhTitle } = await translateTitle(title)
    await pageMap.updateOne({ vid }, { $set: { languageCode, zhTitle, status: 1 } }, { upsert: true })

    await prepareMainLang(transMap, vid)
    let transcriptTranslator = await makeTranscriptTranslator(transMap, vid)

    let cursor = transMap.find({ vid }).project({ _id: 0, vid: 1, languageCode: 1, status: 1 })

    let promise = null
    let prevMassage = page
    for await (let ctrack of cursor) {
        prevMassage = await handle(transMap, prevMassage, ctrack)
        promise = transcriptTranslator(ctrack.languageCode)
    }
    await promise
}

async function prepare0(pageMap, transMap, page) {
    let { vid } = page
    try {
        await prepare(pageMap, transMap, page)
        console.log(`prepare ${vid}`)

    } catch (err) {
        console.log(`${vid} ${err.toString()}`)
        if (env === 'develop') throw err
    }
}

async function prepareAll0() {
    let db = await MongoClient.connect(mongodbUrl)
    let database = db.db("youtube-cc");
    let pageMap = database.collection("pageMap")
    let transMap = database.collection("transMap")

    let cursorMap = database.collection("cursorMap")
    let { processed } = await cursorMap.findOne({ task: "prepare" })

    let cursor = pageMap.find({}, { timeout: false })

    if (env === 'develop') processed = 0
    cursor.skip(processed)

    for await (let page of cursor) {
        console.log(`handle ${processed}`)
        processed++
        await prepare0(pageMap, transMap, page)
        let date = new Date();
        await cursorMap.updateOne({ task: "prepare" }, { $set: { processed, date } }, { upsert: true })
    }
    await db.close();
}

function prepareAll() {
    prepareAll0().catch((err) => console.log(err))
}

prepareAll()