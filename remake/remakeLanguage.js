function formatTranscript(transcript) {
    let es = []
    for (let event of transcript.events) {
        if (event.segs) {
            let line = event.segs.map((x) => x.utf8).join('').trim()
            if (line === "") continue
            let time = event.tStartMs
            let e = { time, line }
            es.push(e)
        }
    }
    return es
}

function formatLangCode(code) {
    switch (code) {
        case "zh":
        case "zh-Hans":
        case "zh-CN":
        case "zh-SG":
            return "zh-CN"
        case "zh-Hant":
        case "zh-HK":
        case "zh-TW":
            return "zh-TW"
        default:
            return code.split('-')[0]
    }
}

function formatLangCode1(captionTracks) {
    let captionMap = {}
    for (let c of captionTracks) {
        let code = formatLangCode(c.languageCode)
        let x = captionMap[code]
        if (x === undefined || x.kind !== undefined) {
            c.languageCode = code
            captionMap[code] = c
        }
    }
    return Object.values(captionMap)
}

async function remakeLanguages(transMap, vid, captionTracks) {
    let captionTracks1 = formatLangCode1(captionTracks)
    for (let caption of captionTracks1) {
        let transcript = formatTranscript(caption)
        let { languageCode } = caption
        let item = { vid, languageCode, transcript }
        await transMap.insertOne(item)
    }
}

module.exports = { remakeLanguages }