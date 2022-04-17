const words = require("./words")
const config = require('./config')
const utils = require('./utils')

module.exports = {
    generate(){
        const word = words[ Math.floor(Math.random()*words.length) ]
        return {audio: `sounds/`+utils.sha256(word+config.audio_salt)+'.mp3', secret: word}
    }
}