const svgCaptcha = require('ppfun-captcha');
const svg2img = require('svg2img');

module.exports = {

    generate(){

        return new Promise((resolve, reject)=>{

            const captcha = svgCaptcha.create( {
                size: 4,
                fill: 'black',
                ignoreChars: 'lOOIkvw'
            } );

            //1. convert from svg string
            svg2img(captcha.data, function(error, buffer) {
                //returns a Buffer
                if (error)
                    return reject(error)

                resolve( {display: buffer.toString('base64'), secret: captcha.text } )
            });

        })
    }

}