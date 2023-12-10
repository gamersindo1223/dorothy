import * as cheerio from "cheerio";
import fetch from "node-fetch";


export async function scrap(url) {
    const request = await fetch(url).then(m => m.text())
    const $ = cheerio.load(request)
    const ep_list = {
        title: $('.bstar-meta__title a').text(), 
        vid: undefined,
        ep_id: []
    }
    $('.ep-list a').each((i, el) => {
        const links = $(el).attr('href')
        const reg = /(\d.+)\?/g;
        const [vid, ep_id] = reg.exec(links)[1].split('/')     

        !ep_list.vid ? ep_list.vid = vid : ''
        ep_list.ep_id.push(ep_id)

    })
    return ep_list
    
}