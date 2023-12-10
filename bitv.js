import got from 'got'

/**
 * @returns {string} https://bilibili.tv/intl/gateway/web/
 */
export default got.extend({prefixUrl: 'https://api.bilibili.tv/intl/gateway/web/'})