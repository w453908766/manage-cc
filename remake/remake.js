let { Sema } = require('async-sema')
let { MongoClient } = require('mongodb')
let { mongodbUrl, threadNum } = require('../config.json')
let { remakeLanguages } = require('./remakeLanguage')

async function remake(pageMap, transMap, item) {
    let newItem = {
        vid: item.vid,
        title: item.title,
        lengthSeconds: item.lengthSeconds,
        viewCount: item.viewCount,
        keywords: item.keywords,
        channelId: item.channelId,
        author: item.author,
        category: item.category,
        description: item.shortDescription,
        isCCLisence: true,
    }
    pageMap.insertOne(newItem)
    await remakeLanguages(transMap, item.vid, item.transcripts)
}


async function remake0(pageMap, transMap, discardMap, item) {
    let { vid } = item
    try {
        if (await pageMap.findOne({ vid })) {
            console.log(`${vid} has been remaked`)
            return
        }
        if (await discardMap.findOne({ vid })) {
            console.log(`${vid} has been discarded`)
            return
        }

        await remake(pageMap, transMap, item)
        console.log(`remake ${vid}`)

    } catch (err) {
        await discardMap.insertOne({ vid, msg: err.toString() })
        console.log(`${vid} ${err.toString()}`)
    }
}

async function remakeAll() {
    let sema = new Sema(threadNum);
    let db = await MongoClient.connect(mongodbUrl)
    let database0 = db.db("youtube-crawl");
    let pageMap0 = database0.collection("pageMap")
    let discardMap = database0.collection("discardMap")

    let database1 = db.db("youtube-cc");
    let pageMap1 = database1.collection("pageMap")
    let transMap = database1.collection("transMap")

    let cursor = await pageMap0.find()

    let i = 0;
    while (await cursor.hasNext()) {
        await sema.acquire()
        console.log(i)
        i++
        item = await cursor.next();
        remake0(pageMap1, transMap, discardMap, item).then(() => sema.release())
    }
    await sema.drain()
    console.log('finish')
    await db.close();
}

remakeAll()