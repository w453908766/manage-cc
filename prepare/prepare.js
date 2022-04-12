let { MongoClient } = require('mongodb')
let { mongodbUrl } = require('../backConfig.json')
let { prepareMainLang } = require('./prepareMainLang')
let { translateMassage } = require('./translateMassage')
let { proxyFetch } = require('../lib/backUtils')

async function existPage1(vid, title) {
    let url = `https://www.google.com/search?q=${encodeURIComponent(title)}`
    let html = await proxyFetch(url)
    let exist = html.indexOf(vid) !== -1
    return exist
}

async function handle(transMap, transStateMap, item, trans) {
    let { vid, languageCode } = trans
    if (await transStateMap.findOne({ vid, languageCode })) {
        console.log(`trans has been processed`)
        return
    }

    let newMassage = await translateMassage(item, 'auto', languageCode)

    let exist = await existPage1(vid, newMassage.title)
    if (exist) {
        await transStateMap.updateOne({ vid, languageCode }, { $set: { status: 'conflict' } }, { upsert: true })
    } else {
        await transMap.updateOne({ vid, languageCode }, { $set: newMassage }, { upsert: true })
        await transStateMap.updateOne({ vid, languageCode }, { $set: { status: 'ready' } }, { upsert: true })
    }
}

async function prepare(transMap, transStateMap, item) {
    let { vid, isCCLisence } = item
    if (!isCCLisence) throw "This video is not Creative Commons Attribution licensed"

    await prepareMainLang(transMap, item.vid)

    let cursor = transMap.find({ vid }).project({ _id: 0, vid: 1, languageCode: 1 })
    for await (let trans of cursor) {
        await handle(transMap, transStateMap, item, trans)
    }
}

async function prepare0(transMap, transStateMap, item) {
    let { vid } = item
    try {
        await prepare(transMap, transStateMap, item)
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
    let transStateMap = database.collection("transStateMap")

    let cursorMap = database.collection("cursorMap")
    let { processed } = await cursorMap.findOne({ task: "prepare" })
    let cursor = pageMap.find()
    cursor.skip(processed)

    for await (let item of cursor) {
        console.log(`handle ${processed}`)
        processed++
        await prepare0(transMap, transStateMap, item)
        await cursorMap.updateOne({ task: "prepare" }, { $set: { processed } }, { upsert: true })
    }
    await db.close();
}

prepareAll()