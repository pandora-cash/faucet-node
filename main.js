console.log("faucet start")

const sanitizer = require('sanitize')();
const express = require('express');
const http = require('http');
const https = require('https');
const app = express();
const captcha1 = require('./captcha1')
const captcha2 = require('./captcha2')
const captcha3 = require('./captcha3')
const captcha4 = require('./captcha4')
const captcha5 = require('./captcha5')
const captcha6 = require('./captcha6')
const captcha7 = require('./captcha7')
const captcha8 = require('./captcha8')
const utils = require('./utils')
const cors = require('cors')
const bodyParser = require('body-parser')
const hcaptcha = require('hcaptcha');
const config = require('./config')
const Storage = require('node-storage');
const crypto = require("crypto");
const dict = require("dict");
const fs = require('fs')

var storage
let captchaT = 0;
let successT = 0
let failT = 0

app.use(cors({ origin: 'https://pandoracash.com' , credentials :  true}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.use('/sounds', express.static('sounds'))

app.get('/', function (req, res) {
    res.send('working');
});

const challenges = dict({})

const validAddressAlphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZZ0123456789"

function validateAddress(address){
    address = sanitizer.value(address, String )
    for (let i =0; i < address.length; i++)
        if (validAddressAlphabet.indexOf(address[i]) === -1)
            throw `Address contains invalid letters ${address[i]}`
    if (address.length < 30) throw "Address is too short."
    if (address.indexOf("PCASH") !== 0) throw "Address is invalid. It should start with PCASH..."
    return address
}

function extractAddress(body){
    if (!body.address || typeof body.address !== "string") throw "Missing address"
    return validateAddress(body.address)
}

function sha256(text){
    return crypto.createHmac("sha256", "mysecret" ).update(text).digest("hex");
}

app.post('/captcha',  async function (req, res) {

    const data = req.body
    try{

        if (new Date("Apr 16 2022 07:00 am PST").getTime() < new Date().getTime())
            throw "Faucet expired"

        const address = extractAddress(data)

        const c = await Promise.all([
            captcha1.generate(),
            captcha2.generate(),
            captcha3.generate(),
            captcha4.generate(),
            captcha5.generate(),
            captcha6.generate(),
            captcha7.generate(),
            captcha8.generate(),
        ])

        const id = utils.randomString(32)
        const id2 = "prefix_"+sha256(id)

        const time = new Date().getTime() +  10 * 60 * 1000

        challenges.set(id2, {
            c1: c[0].secret,
            c2: c[1].secret,
            c3: c[2].secret,
            c4: c[3].secret,
            c5: c[4].secret,
            c6: c[5].secret,
            c7: c[6].secret,
            c8: c[7].secret,
            time,
        })

        //console.log(new Date(), "new captcha!")
        captchaT++

        const value = storage.get("balance_"+address)

        return res.json({
            result: true,
            id,
            c1: {
                display: c[0].display,
                length: c[0].secret.length,
            },
            c2: {
                display: c[1].display,
                length: c[1].secret.length,
            },
            c3: {
                display: c[2].display,
                length: c[2].secret.length,
            },
            c4: {
                display: c[3].display,
                length: c[3].secret.length,
            },
            c5: {
                display: c[4].display,
                length: c[4].secret.length,
            },
            c6: {
                display: c[5].display,
                length: c[5].secret.length,
            },
            c7: {
                display: c[6].display,
                piece: c[6].piece,
                width: c[6].width,
                height: c[6].height,
                pieceWidth: c[6].pieceWidth,
                pieceHeight: c[6].pieceHeight,
            },
            c8: {
                audio: c[7].audio,
            },

            time,
            b: value || 0,
        })

    }catch(err){
        return res.json({result: false, error: err.toString() })
    }

})

app.post('/solution', async function (req, res, next ) {


    const data = req.body
    try{

        if (new Date("Apr 16 2022 07:00 am PST").getTime() < new Date().getTime())
            throw "Faucet expired"

        if (!data || typeof data !== "object") throw "Invalid data"
        if (!data.id || typeof data.id !== "string") throw "Missing Id"

        const id = sanitizer.value(data.id, String)
        if (id.length !== 32) throw "Invalid id"

        const id2 = "prefix_"+sha256(id)

        const challenge = challenges.get(id2)

        if (!challenge)
            throw "Challenge expired. Maximum 10 minutes"

        challenges.delete(id2)

        const address = extractAddress(data)

        data.c1 = sanitizer.value(data.c1, String )
        data.c2 = sanitizer.value(data.c2, String).toUpperCase()
        data.c3 = sanitizer.value(data.c3, String).toUpperCase()
        data.c4 = sanitizer.value(data.c4, String)
        data.c5 = sanitizer.value(data.c5, String)
        data.c6 = sanitizer.value(data.c6, String)
        data.c7 = sanitizer.value(data.c7, Object )
        const c7X = sanitizer.value(data.c7.x, Number)
        const c7Y = sanitizer.value(data.c7.y, Number)
        data.c8 = sanitizer.value(data.c8, String).toLowerCase()
        data.c9 = sanitizer.value(data.c9, String)

        if (challenge.c1 !== data.c1) throw `Challenge 1 mismatch "${data.c1}" with "${challenge.c1}" `
        if (challenge.c2 !== data.c2 ) throw `Challenge 2 mismatch "${data.c2}" with "${challenge.c2}"`
        if (challenge.c3 !== data.c3 ) throw `Challenge 3 mismatch "${data.c3}" with "${challenge.c3}"`
        if (challenge.c4 !== data.c4 ) throw `Challenge 4 mismatch "${data.c4}" with "${challenge.c4}" `
        if (challenge.c5 !== data.c5 ) throw `Challenge 5 mismatch "${data.c5}" with "${challenge.c5}" `
        if (challenge.c6 !== data.c6 ) throw `Challenge 6 mismatch "${data.c6}" with "${challenge.c6}" `

        const distance = Math.sqrt(Math.pow( challenge.c7.x - c7X, 2 ) + Math.pow(challenge.c7.y - c7Y, 2) )
        if ( distance > 20 ) throw `Challenge 7 too far away ${distance} > 20`

        if (challenge.c8 !== data.c8)  throw `Challenge 8 mismatch "${data.c8}" with "${challenge.c8}"`

        const verification = await hcaptcha.verify( config.hcaptcha_secret, data.c9 )
        if (!verification || verification.success !== true)
            throw `Challenge 9 (hcaptcha) failed`

        const value = storage.get("balance_"+address)
        const newValue = (value || 0) + 50

        storage.put( "balance_"+address, newValue )

        if (value === undefined) {
            const count = storage.get("count") || 0
            storage.put("count", count + 1)
            storage.put("unique_"+count, address)
        }

        successT++
        console.log(new Date(), "captcha solved!")

        return res.json({ result: true, b: newValue } )
    }catch(err){
        failT++
        return res.json({result: false, error: err.toString() })
    }finally{

    }

})

start()

function start(){
    function deleteOld (){

        const time = new Date().getTime()
        challenges.forEach(function (value, key){
            if (value.time < time )
                challenges.delete(key)
        })

        setTimeout(deleteOld, 10*1000)
    }

    setTimeout(deleteOld, 10*1000)

    storage =  new Storage('./balances')

    if (fs.existsSync('./ssl/key.pem')){

        const options = {
            key: fs.readFileSync('./ssl/key.pem'),
            cert: fs.readFileSync('./ssl/cert.pem'),
        };

        https.createServer(options, app).listen(config.port, function(){
            console.log('open https://%s', config.port);
        });
    }else {
        http.createServer({}, app).listen(config.port, function () {
            console.log('open http://%s', config.port);
        });
    }

    setInterval(()=>{
        console.log("captcha", captchaT, "success", successT, "fail", failT)
    }, 5000)
}