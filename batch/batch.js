let { MongoClient } = require('mongodb')
let { mongodbUrl } = require('../config.json')


async function removeShort() {
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

removeShort()