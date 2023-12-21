import { writeFileSync } from 'fs'

const desc = `[Script Info]
Title: Bilibili Subtitle
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.601
PlayResX: 3840
PlayResY: 2160`

const style = `[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Noto Sans,55,&H00FFFFFF,&H00FFFFFF,&H00002208,&H80000000,-1,0,0,0,100,100,0,0,1,5,1.5,2,96,96,65,1
Style: Default - atas,Noto Sans,55,&H00FFFFFF,&H00FFFFFF,&H00002208,&H80000000,-1,0,0,0,100,100,0,0,1,5,1.5,8,96,96,65,1
Style: 5-normal,Noto Sans,45,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,5,10,10,10,1
Style: 6-normal,Noto Sans,45,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,6,10,10,10,1
Style: 4-normal,Noto Sans,45,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,4,10,10,10,1\n\n`

let events = `[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`

export function parseJsonToAss(JSON, path ) {
    
    for(const body of JSON) {
        const start = createTimes(body.from)
        const end = createTimes(body.to)
        
        events += `Dialogue: ${body.location},${start},${end},Default,,0,0,0,,${body.content.replaceAll('\n', '\\N')}\n`
    }
    const ass = desc + style + events
    writeFileSync(path, ass)
}

const fix_fs = style_str => {
    const style_fs = style_str.replaceAll(/Noto Sans,(\d+),/g, 'Noto Sans,100,')
    const fs_style = style_fs.replaceAll(/fs\d+/g, 'fs100')
    return fs_style
}

const setPlayRes = playRes => playRes.replace(/PlayResX: (\d+)\nPlayResY: (\d+)/, 'PlayResX: 3840\nPlayResY: 2160')

export function fixAss(text, path) {
    const gpr = setPlayRes(text)
    const gfs = fix_fs(gpr)

    writeFileSync(path, gfs)
}

function createTimes(times) {
    const [seconds, miliseconds = '00'] = (times % 60).toString().split('.'),
    ficSec = seconds.length == 1 ? `0${seconds}.${miliseconds.slice(0, 2)}` : `${seconds}.${miliseconds.slice(0, 2)}`,
    minutes = times < 3600 ? Math.floor(times / 60) : Math.floor(times % 3600),
    hours = Math.floor(times / 3600)
    return `${hours}:${minutes}:${ficSec.length == 4 ? ficSec.concat('0') : ficSec}`
}
