let { proxyFetch } = require('../lib/backUtils')



async function existPage1() {
    let url = "https://www.google.com/search?q=%E5%82%85%E7%AB%8B%E5%8F%B6%E5%8F%98%E6%8D%A2%E5%A6%82%E4%BD%95%E7%90%86%E8%A7%A3%EF%BC%9F%E7%BE%8E%E9%A2%9C%E5%92%8C%E5%8F%98%E5%A3%B0%E9%83%BD%E6%98%AF%E4%BB%80%E4%B9%88%E5%8E%9F%E7%90%86%EF%BC%9F%E6%9D%8E%E6%B0%B8%E4%B9%90%E8%80%81%E5%B8%88%E5%91%8A%E8%AF%89%E4%BD%A0&sourceid=chrome&ie=UTF-8"
    let html = await proxyFetch(url)

    let exist = html.indexOf("0LuyxzqI3Hk") !== -1
    return exist ? "" : html
}


async function f() {
    while (true) {
        let html = await existPage1()
        if (html) {
            console.log(html)
            break
        }
    }
}

//f()

async function g() {
    let url = "https://www.google.com/search?q=%E5%82%85%E7%AB%8B%E5%8F%B6%E5%8F%98%E6%8D%A2%E5%A6%82%E4%BD%95%E7%90%86%E8%A7%A3%EF%BC%9F%E7%BE%8E%E9%A2%9C%E5%92%8C%E5%8F%98%E5%A3%B0%E9%83%BD%E6%98%AF%E4%BB%80%E4%B9%88%E5%8E%9F%E7%90%86%EF%BC%9F%E6%9D%8E%E6%B0%B8%E4%B9%90%E8%80%81%E5%B8%88%E5%91%8A%E8%AF%89%E4%BD%A0&sourceid=chrome&ie=UTF-8"
    let html = await proxyFetch(url)
    console.log(html)
}

g()