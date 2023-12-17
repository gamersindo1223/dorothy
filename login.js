import got from 'got'
import QRcode from 'qrcode-terminal'

import { authUrl, fetchUrl, config } from './bitv.js';

import { writeFileSync } from 'fs';

const { searchParams, timeout } = {
    searchParams: {
        s_locale: config.s_locale,
        platform: 'web',
        ticket: undefined
    },
    timeout: {
        lookup: 1000,
        connect: 5000,
        secureConnect: 50000,
        socket: 1000,
        send: 10000,
        response: 1000
    }
};
const gqr = async () => {
    const res = await got(authUrl, {searchParams, timeout}).json()
    if(res.code !== 0) throw res.message
    return res.data.qr_url
}

const createQR = async () => {
    const qr_url = await gqr()
    searchParams.ticket = qr_url.match(/\?ticket=(.+)$/)[1]
    QRcode.generate(qr_url, {small: true})
}
const timeouts = () => new Promise(resolve => setTimeout(resolve, 4000));

(async() => {

    await createQR()
    while (true) {
        const authFetch = await got(fetchUrl, { searchParams, timeout }).json()
        if(authFetch.code == 10018100) {console.log('=> QR code has expired, renew...'); createQR()}
        else if(authFetch.code == 10018102 && !authFetch.data) console.log('QR has been scanned...waiting to get approval!!!')
        else if(authFetch.code == 0 && authFetch.data) {
            const mid = authFetch.data.mid
            const regCookie = /(\w+)=([^&]+)/g;
            const creds = authFetch.data.go_url.match(regCookie)
            const cookies = `mid=${mid}; ${creds[0]}; ${creds[1]}; ${creds[3]}; ${creds[4]}`
            
            config.account = cookies
            writeFileSync('./config.json', JSON.stringify(config, null, 2))
            console.log('login success...')

            break
        }
        await timeouts()
    }
})()


