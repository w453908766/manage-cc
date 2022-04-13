let { MongoClient } = require('mongodb')
let { mongodbUrl } = require('../backConfig.json')


async function clearList(pageMap, transMap, lst) {
    for (let item of lst) {
        await pageMap.deleteOne(item)
        await transMap.deleteMany(item)
    }
}

async function main() {
    let db = await MongoClient.connect(mongodbUrl)
    let database = db.db("youtube-cc");
    let pageMap = database.collection("pageMap")
    let transMap = database.collection("transMap")

    let lst = await pageMap.find({ $expr: { "$lt": [{ "$strLenCP": "$title" }, 40] } }).project({ _id: 0, vid: 1 }).toArray()
    await clearList(pageMap, transMap, lst)

    console.log('finish')
    await db.close();
}

main()