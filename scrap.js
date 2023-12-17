import * as cheerio from "cheerio";
import fetch from "node-fetch";

import { validLink } from "./bitv.js";

export async function scrap(url) {
    const request = await fetch(url).then(m => m.text())
    const $ = cheerio.load(request)
    const ep_list = {
        title: $('.bstar-meta__title a').text(),
        vid: undefined,
        ep: undefined,
        ep_id: []
    }

    const [, vid, epId] = validLink.exec(url)
    if(epId) {
        ep_list.vid = vid;
        ep_list.ep_id = epId
        $('.ep-list a').each((i, el) => ep_list.ep = ($(el).attr('href')).includes(epId) ? $(el).attr('href', epId).text().replace('E', '') : ep_list.ep)
        ep_list.ep = parseInt(ep_list.ep)
        return ep_list
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