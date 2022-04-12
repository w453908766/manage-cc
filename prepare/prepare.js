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

async function handle(transMap, transStateMap, page, ctrack) {
    let { vid, languageCode } = ctrack
    if (await transStateMap.findOne(ctrack)) {
        console.log(`trans has been processed ${ctrack}`)
        return
    }

    let newMassage = await translateMassage(page, 'auto', languageCode)
    await transMap.updateOne(ctrack, { $set: newMassage }, { upsert: true })

    let exist = await existPage1(vid, newMassage.title)
    let status = exist ? 'conflict' : 'ready'
    await transStateMap.updateOne(ctrack, { $set: { status } }, { upsert: true })
}

async function prepare(transMap, transStateMap, page) {
    let { vid, isCCLisence } = page
    if (!isCCLisence) throw "This video is not Creative Commons Attribution licensed"

    await prepareMainLang(transMap, page.vid)

    let cursor = transMap.find({ vid }).project({ _id: 0, vid: 1, languageCode: 1 })
    for await (let ctrack of cursor) {
        await handle(transMap, transStateMap, page, ctrack)
    }
}

async function prepare0(transMap, transStateMap, page) {
    let { vid } = page
    try {
        await prepare(transMap, transStateMap, page)
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

    for await (let page of cursor) {
        console.log(`handle ${processed}`)
        processed++
        await prepare0(transMap, transStateMap, page)
        await cursorMap.updateOne({ task: "prepare" }, { $set: { processed } }, { upsert: true })
    }
    await db.close();
}

prepareAll()