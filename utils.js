const crypto = require('crypto')

module.exports = {

    sha256(text){
        return crypto.createHash('sha256').update(text).digest('hex');
    },

    randomString (length = 8, chars = 'abcdefghijklmnopqrstvwxyzABCDEFGHIJKLMNOPQRSTUVWXTZ123456789@#$%&', uppercase = true ) {

        if (uppercase)
            chars = chars.toUpperCase()

        // Pick chars randomly
        let str = '';
        for (let w = 0; w < length; w++)
            str += chars.charAt(Math.floor(Math.random() * chars.length));

        return str;
    },

    getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++)
            color += letters[Math.floor(Math.random() * 16)];
        return color;
    }
}