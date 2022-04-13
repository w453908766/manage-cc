let { MongoClient } = require('mongodb')
let { mongodbUrl } = require('../backConfig.json')
let clearlist = require('./clearlist.json')


async function listShort() {
    let db = await MongoClient.connect(mongodbUrl)
    let database = db.db("youtube-cc");
    let pageMap = database.collection("pageMap")
    let transMap = database.collection("transMap")

    let i = 0;
    let discard = {}
    let cursor = await transMap.find()
    while (await cursor.hasNext()) {
        console.log(i)
        i++
        item = await cursor.next();
        if (item.transcript.length < 20) {
            discard[item.vid] = true
        }
    }
    console.log(JSON.stringify(discard))
    console.log('finish')
    await db.close();
}



async function removeShort() {
    let db = await MongoClient.connect(mongodbUrl)
    let database = db.db("youtube-cc");
    let pageMap = database.collection("pageMap")
    let transMap = database.collection("transMap")

    let arr = Object.keys(clearlist)
    let i = 0
    for (let vid of arr) {
        console.log(i)
        i++
        await pageMap.deleteOne({ vid })
        await transMap.deleteMany({ vid })
    }
    console.log('finish')
    await db.close();
}

removeShort()