let { proxyFetch } = require('../lib/backUtils')

function combineLines(lines) {
    let length = 0
    let enlines = []
    let segs = []
    for (let i = 0; i < lines.length; i++) {
        let line1 = lines[i].line.replaceAll('\n', ' ') + '\n'
        let enline = encodeURIComponent(line1)
        enlines.push(enline)
        length = length + enline.length
        if (length > 5000 || i === lines.length - 1) {
            segs.push(enlines.join(''))
            enlines = []
            length = 0
        }
    }
    return segs
}

function rebuildTranscript(transcript, rlines) {
    let newTranscript = []
    let i = 0,
        j = 0;
    while (i < transcript.length) {
        let srcLine = transcript[i].line.replaceAll('\n', ' ') + '\n'
        let rline = rlines[j]
        if (srcLine.startsWith(rline[1])) {
            newTranscript[i] = { time: transcript[i].time, line: rline[0].trim() }
            i++
            j++
        } else {
            newTranscript[i - 1].line += rline[0].trim()
            j++
        }
    }
    return newTranscript
}

async function translate(enline, srcLang, desLang) {
    let url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${srcLang}&tl=${desLang}&q=${enline}`
    let req = await proxyFetch(url)
    return req[0]
}

async function translateTranscript(transcript, srcLang, desLang) {
    let segs = combineLines(transcript)
    let ps = segs.map((seg) => translate(seg, srcLang, desLang))
    let newSegs = await Promise.all(ps)
    let rlines = newSegs.flat()

    let newTranscript = await rebuildTranscript(transcript, rlines)
    return newTranscript
}

module.exports = { translateTranscript }