const captcha = require('trek-captcha')

module.exports = {
    async generate(){
        const { token, buffer } = await captcha({size: 6, style: -1})
        return {display: buffer.toString('base64'), secret: token}
    }
}