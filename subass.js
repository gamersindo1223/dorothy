import { readFileSync, writeFileSync } from 'fs'

export const desc = `[Script Info]
Title: Bilibili Subtitle
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.601
PlayResX: 1920
PlayResY: 1080`

const style = `[V4+ Styles]
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: dialog,Noto Sans,55,&H00FFFFFF,&H00FFFFFF,&H00002208,&H80000000,-1,0,0,0,100,100,0,0,1,5,1.5,2,96,96,65,1
Style: dialog - atas,Noto Sans,55,&H00FFFFFF,&H00FFFFFF,&H00002208,&H80000000,-1,0,0,0,100,100,0,0,1,5,1.5,8,96,96,65,1\n\n`

let events = `[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`

export function parseJsonToAss(JSON, path ) {
    
    for(const body of JSON) {
        const start = createTimes(body.from)
        const end = createTimes(body.to)
        
        events += `Dialogue: ${body.location},${start},${end},dialog,,0,0,0,,${body.content.replaceAll('\n', '\\N')}\n`
    }
    const ass = desc + style + events
    writeFileSync(path, ass)

}

function createTimes(times) {
    const [seconds, miliseconds = '00'] = (times % 60).toString().split('.'),
    ficSec = seconds.length == 1 ? `0${seconds}.${miliseconds.slice(0, 2)}` : `${seconds}.${miliseconds.slice(0, 2)}`,
    minutes = times < 3600 ? Math.floor(times / 60) : Math.floor(times % 3600),
    hours = Math.floor(times / 3600)
    return `${hours}:${minutes}:${ficSec.length == 4 ? ficSec.concat('0') : ficSec}`
}
