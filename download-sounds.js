const words = require('./words')
const utils = require('./utils')
const config = require('./config')

const client = require('soundoftext-js');
const fs = require('fs');
const https = require('https');

function download(word, url, t, path ){
    return new Promise((resolve, reject)=>{

        https.get(url,(res) => {

            const filePath = fs.createWriteStream(path);
            res.pipe(filePath);
            filePath.on('finish',() => {
                filePath.close();
                console.log('Download Completed', word, t / words.length * 100, '%');
                resolve(true)
            })

        })

    })

}

async function  run(){
    for (let t=0; t < words.length; t++){

        const word = words[t]

        const filename = `sounds/`+utils.sha256(word+config.audio_salt)+'.mp3';
        if (fs.existsSync(filename))
            continue

        const soundUrl = await client.sounds.create({ text: word, voice: 'en-US' })

        await download(word, soundUrl, t, filename )
    }
}
run()