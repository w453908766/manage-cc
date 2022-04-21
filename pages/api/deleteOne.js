import { MongoClient } from 'mongodb'
import config from '../../backConfig.json'

async function deleteOne({ vid }) {
    let db = await MongoClient.connect(config.mongodbUrl)
    let database = db.db("youtube-cc");
    let pageMap = database.collection("pageMap")
    let transMap = database.collection("transMap")

    await pageMap.deleteOne({ vid })
    await transMap.deleteMany({ vid })

    await db.close()
}

export default async function handler(req, res) {
    await deleteOne(req.body)
    res.end('"succ"')
}