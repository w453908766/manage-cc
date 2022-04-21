let { MongoClient } = require('mongodb')
let { mongodbUrl } = require('../backConfig.json')
let clearlist = require('./clearlist.json')

async function remove() {
    let db = await MongoClient.connect(mongodbUrl)
    let database = db.db("youtube-cc");
    let pageMap = database.collection("pageMap")
    let transMap = database.collection("transMap")

    for (let i = 0; i < clearlist.length; i++) {
        let vid = clearlist[i]
        console.log(i, vid)
        await pageMap.deleteOne({ vid })
        await transMap.deleteMany({ vid })
    }
    console.log('finish')
    await db.close();
}

remove()