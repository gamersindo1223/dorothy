import * as readline from 'readline';
import { createWriteStream, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'fs';

import fetch from 'node-fetch'
import ffmpeg from 'fluent-ffmpeg'

import { core, subtitle } from './index.js';
import { scrap } from './scrap.js';
import { parseJsonToAss, fixAss } from './subass.js'
import { validLink, config } from './bitv.js'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function input(param) {
    return new Promise(res => {
        rl.question(param, command => {
            res(command)
        })
    })
};

async function glink() {
    const greq = await input('input the link: ')

    const errorms = ['the link you input is invalid!!!...try again', 'link is incorrect!!!', 'the link is not from bilibli/bstation', 'you must check again the link you`are inputting']
    const random_erm = random_error(errorms)
    if(!validLink.test(greq)) {
        console.log(`${random_erm}\n`)
        return await glink()
    }
    return greq
}

async function geps(gid, ep_id) { 
    const gint = parseInt(gid);

    if(isNaN(gint) || !(/\d+$/).test(gid)) {
        const errorm = await input(`please select a number between 1-${ep_id.length}: `)
        return await geps(errorm, ep_id)
    }
    else if(gint > ep_id.length) {
        const errorms = ['the episode that you choosed is not available or you wrong choose episode', `the anime is only have ${ep_id.length} episode`, 'the episode is not available', 'you choose the wrong episode']
        const random_erm = random_error(errorms)
        
        const errorm = await input(`${random_erm}\ntry again: `)
        return await geps(errorm, ep_id)
    }
    return gint
    
};

async function gquality(video) {

    let qstring = ''
    for(const [i, dvideo] of video.entries()) {
        if(dvideo.url.length <= 1)continue
        if(i % 2 == 0) {qstring += `[${dvideo.bitrate}]\n`; continue}
        qstring += `[${dvideo.bitrate}] `
    }
    const quality = await input(`quality video:\n${qstring} \ninput the quality video: `)
    if(!qstring.includes(quality, 1))return await gquality(video)
    return quality.toLowerCase()
}

async function permission(quality) {

    if(config.permission) {console.log(`the video size is around ${Math.floor(quality / 1024)/ 1000}Mb\n`); return true}

    const prefix = ['y', 'n']
    const answer = await input(`the video size is around ${Math.floor(quality / 1024)/ 1000}Mb\n[y/n]: `)
    if(prefix[0] == answer) return true
    else if(prefix[1] == answer) return false
    return await permission(quality)
}

(async() => {
    const rlink = await glink()
    const { title, vid, ep_id, ep } = await scrap(rlink)
    
    const gid = Array.isArray(ep_id) ? await input(`\nAnime: ${title}
there have ${ep_id.length} Episode, choose one: `) : console.log(`\nAnime: ${title} Episode: ${ep}`)
    const reps = ep || await geps(gid, ep_id)
    const episode = ep ? ep_id : ep_id[reps-1]

    const response = await core(vid, episode)
    
    const quality = config.bitrate || await gquality(response.video)
    const video = response.video.find(m => m.bitrate.includes(quality))
    const audio = response.audio.find(m => m.quality == video.audio)
    const gpermission = await permission(video.size)
    if(!gpermission) return rl.close()

    const specialCase = title.match(/(?:"(.+)")/) || ''
    const path = `./download/${title.split(' ').join('_').replace(':', '').replace(specialCase[0], specialCase[1])}/`
    const temp = path.concat(`temp/EP-${reps}`)
    makeDir(path.concat('temp'))
    
    console.log('start to download the video...')
    
    await gbufferr(video.url, temp.concat(`.mp4`))
    await gbufferr(audio.url, temp.concat(`.mp3`))

    console.log('download successfully...')

    const sub = await subtitle(vid, episode)
    if(!sub.ass) {
        const JSON = await (await fetch(sub.json)).json()
        parseJsonToAss(JSON.body, temp.concat('.ass'))
    }
    else {
        const ass = await (await fetch(sub.ass)).text()
        fixAss(ass, temp.concat('.ass'))
    }

    try {
        const final = await merge(temp, path.concat(`EP-${reps}.mkv`))
        console.log(final)
    } catch (e) {
        console.log('ERROR:\n' + e)
    }
    rl.close()
    clearTemp(path.concat('temp/'))
})()


const random_error = errArr => errArr[Math.floor(Math.random() * (errArr.length - 1))]
const gbufferr = async(url, path) => {
    const response = await fetch(url)
    return new Promise(res => {
        response.body.pipe(createWriteStream(path))
        .on('finish', () => {
            res('download successfully...')
        })
    })
}
const merge = (temp, path) => {
    return new Promise((res, rej) => {
        ffmpeg()
            .input(temp.concat('.mp4')).videoCodec('copy')
            .input(temp.concat('.mp3')).audioCodec('copy')
            .input(temp.concat('.ass')).inputFormat('ass')
            .on('start', () => {
                console.log('starting to merge...')
            })
            .on('error', e => rej('error\n' + e))
            .save(path)
            .on('end', () => res('merging successfully...'))
        })
}

const makeDir = dir => !existsSync(dir) ? mkdirSync(dir, {recursive: true}) : ''
const clearTemp = dir => {
    readdirSync(dir, {withFileTypes: true}).map(item => {
        if(item.isFile()) {
            rmSync(dir+item.name)
        }
    })
}