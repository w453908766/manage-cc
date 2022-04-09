import { MongoClient } from 'mongodb'
import config from '../../backendConfig.json'

async function unpublished() {
    let db = await MongoClient.connect(config.mongodbUrl)
    let database = db.db("youtube-cc");
    let pageMap = database.collection("pageMap")

    let pages = await pageMap.find().limit(10).toArray()
    db.close()
    return pages
}

export default async function handler(req, res) {
    let pages = await unpublished()
    res.status(200).json(pages)
}