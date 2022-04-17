const { CaptchaGenerator } = require("captcha-canvas");
const utils = require('./utils')

module.exports = {

    generate(){

        const text = utils.randomString(8, "abcdefghijkmnpqrstvwxyzABCDEFGHIJKLMNOPQRSTUVWXTZ123456789@#$%&", true )

        const captcha = new CaptchaGenerator()
            .setCaptcha({text, color: utils.getRandomColor() })
            .setDimension(150, 450)
            .setDecoy({opacity: 0.5, total: 30})
            .setTrace({color: utils.getRandomColor(), size: 5 });

        const image = captcha.generateSync();
        return { display: image.toString('base64'), secret: text }
    }

}
