const Captcha = require("captcha-generator-alphanumeric").default;
const utils = require('./utils')

module.exports = {
    generate(){
        const secret = utils.randomString(8, undefined, true )
        const captcha = new Captcha(undefined, secret );
        return {display: captcha.dataURL, secret }
    }
}