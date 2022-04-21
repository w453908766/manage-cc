import { MongoClient } from 'mongodb'
import config from '../../backConfig.json'

async function upload({ host, checkedMap }) {
    let db = await MongoClient.connect(config.mongodbUrl)
    let database = db.db("youtube-cc");
    let pageMap = database.collection("pageMap")
    let transMap = database.collection("transMap")

    for (let key in checkedMap) {
        let checked = checkedMap[key]
        if (checked) {
            let [vid, languageCode] = key.split(' ')
            await pageMap.updateOne({ vid }, { $set: { status: 2 } })

            let up = { status: 2, host, uploadDate: new Date() }
            await transMap.updateOne({ vid, languageCode }, { $set: up })
        }
    }

    await db.close()
}

export default async function handler(req, res) {
    await upload(req.body)
    res.end('"succ"')
}