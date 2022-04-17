const svgCaptcha = require('svg-captcha-fixed');

module.exports = {

    generate(){
        const captcha = svgCaptcha.create({
            size: 8, noise: 15, color: true, width: 330, height: 120,
            ignoreChars: 'lOOIkvw'
        });
        return {display: captcha.data, secret: captcha.text }
    }

}