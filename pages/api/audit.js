import { MongoClient } from 'mongodb'
import config from '../../backConfig.json'

async function audit() {
    let db = await MongoClient.connect(config.mongodbUrl)
    let database = db.db("youtube-cc");
    let pageMap = database.collection("pageMap")
    let transMap = database.collection("transMap")

    let cursor = pageMap.find({ status: 1 }).limit(2)
    let pages = []
    for await (let page of cursor) {
        let { vid } = page
        let column = { _id: 0, vid: 1, languageCode: 1, status: 1, title: 1 }
        let cond = { vid, languageCode: { $ne: "en" }, transcript: { $ne: null } }
        let ctracks = await transMap.find(cond).project(column).toArray()
        pages.push({...page, ctracks })
    }

    await db.close()
    return pages
}

export default async function handler(req, res) {
    let pages = await audit()
    res.status(200).json(pages)
}