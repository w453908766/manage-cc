import { MongoClient } from 'mongodb'
import config from '../../backConfig.json'

async function upload(uploadMap) {
    let db = await MongoClient.connect(config.mongodbUrl)
    let database = db.db("youtube-cc");
    let pageMap = database.collection("pageMap")
    let transMap = database.collection("transMap")

    for (let key in uploadMap) {
        let checked = uploadMap[key]
        let [vid, languageCode] = key.split(' ')
        await pageMap.updateOne({ vid }, { $set: { status: 2 } }, { upsert: true })

        let status = checked ? 2 : -2;
        await transMap.updateOne({ vid, languageCode }, { $set: { status } }, { upsert: true })
    }

    await db.close()
}

export default async function handler(req, res) {
    await upload(req.body)
    res.end('"succ"')
}