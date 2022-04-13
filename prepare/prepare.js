let { MongoClient } = require('mongodb')
let { mongodbUrl } = require('../backConfig.json')
let { prepareMainLang } = require('./prepareMainLang')
let { translateMassage } = require('./translateMassage')
let { proxyFetch, proxyFetchTime } = require('../lib/backUtils')

async function existPage1(vid, title) {
    let url = `https://www.google.com/search?q=${encodeURIComponent(title)}`
    let html = await proxyFetchTime(url, 10)
    let exist = html.indexOf(vid) !== -1
    return exist
}

async function handle(transMap, page, ctrack) {
    let { vid, languageCode, status } = ctrack
    if (status !== undefined) {
        console.log(`captionTrack has been processed ${vid} ${languageCode}`)
        return
    }

    try {
        let newMassage = await translateMassage(page, 'auto', languageCode)
        let exist = await existPage1(vid, newMassage.title)
        let newStatus = exist ? -1 : 1
        let newMsg = {...newMassage, status: newStatus }

        await transMap.updateOne(ctrack, { $set: newMsg }, { upsert: true })
    } catch (err) {
        if (err.toString() === "same language") {
            await transMap.updateOne(ctrack, { $set: { status: -1 } }, { upsert: true })
        } else {
            throw err
        }
    }
}

async function prepare(transMap, page) {
    let { vid, isCCLisence } = page
    if (!isCCLisence) throw "This video is not Creative Commons Attribution licensed"

    await prepareMainLang(transMap, page.vid)

    let cursor = transMap.find({ vid }).project({ _id: 0, vid: 1, languageCode: 1, status: 1 })
    for await (let ctrack of cursor) {
        await handle(transMap, page, ctrack)
    }
}

async function prepare0(transMap, page) {
    let { vid } = page
    try {
        await prepare(transMap, page)
        console.log(`prepare ${vid}`)

    } catch (err) {
        console.log(`${vid} ${err.toString()}`)
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