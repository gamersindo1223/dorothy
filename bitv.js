import { readFileSync } from 'fs'

import got from 'got';

/**@type {Function} - got*/
export const api = got.extend({prefixUrl: 'https://api.bilibili.tv/intl/gateway/web/'})
export const validLink = /https:\/\/(?:bili.im\/\w{7}$)|(?:(?:www.|)bilibili.tv\/(?:en|id|th|vi)\/play(?:\/(\d{7}))(?:\/(\d{8})|).+)/
/** @type {{lang: language, s_locale: lang_id, bitrate: quality, account: cookie, permission: boolean, fs: string}}*/
export const config = JSON.parse(readFileSync('./config.json'))
/** @type {string} - get QR code link*/
export const authUrl = 'https://passport.bilibili.tv/x/intl/passport-login/qrcode/auth/url'
/** @type {string} - get credential*/
export const fetchUrl = 'https://passport.bilibili.tv/x/intl/passport-login/qrcode/auth/fetch'
