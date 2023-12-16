import { api, config } from './bitv.js'

export async function core(vid, id) {
    const {headers, timeout} = options(vid, id)
    const playurl = await api('./playurl', {
        searchParams: {
            s_locale: config.s_locale,
            platform: 'web',
            ep_id: id
        },
        headers, timeout
    }).json()
    if(!playurl.data) throw 'data can`t be fetching, maybe the video is for premium only...'
    const recons = playurl.data.playurl.video.map(response => {
        const metadata_video = response.video_resource
        return {
            url: metadata_video.url,
            bitrate: response.stream_info.desc_words,
            mimetype: metadata_video.mime_type,
            codecs: metadata_video.codecs,
            audio: response.audio_quality,
            size: metadata_video.size
            }
    })
    const audio = playurl.data.playurl.audio_resource.map(response => {
        return {
            url: response.url,
            quality: response.quality,
            mimetype: response.mime_type,
            codecs: response.codecs,
            size: response.size
        }
    })
    const video = recons.filter(m => m.codecs.includes('hev'))
    return {audio, video}   
};

export async function subtitle(vid, id) {
    const { headers, timeout } = options(vid, id)
    const gsubtitle = await api('v2/subtitle', {
        searchParams: {
            s_locale: config.s_locale,
            platform: 'web',
            episode_id: id
        },
        headers, timeout
    }).json()

    const subtitles = gsubtitle.data.video_subtitle.find(m => m.lang_key == config.lang ? m : '')
    return {
        ass: subtitles.ass?.url,
        json: subtitles.srt?.url
    }
}

const options = (vid, id) => {
    return {
        headers: {
            Origin: 'https://www.bilibili.tv',
            Referer: `https://www.bilibili.tv/id/play/${vid}/${id}?bstar_from=bstar-web.pgc-video-detail.episode.all`,
            Cookie: config.account
        },
        timeout: {
            connect: 3000,
            request: 5000,
            response: 5000,
            socket: 4000,
            send: 5000,
            secureConnect: 5000,
            read: 5000,
            lookup: 5000,
        }
    }
}

