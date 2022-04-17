const utils = require('./utils')
const gm = require('gm')

module.exports = {
    generate(){

        return new Promise((resolve, reject)=>{

            const width = Math.floor( Math.random() * 60 + 60 )
            const height = Math.floor( Math.random() * 60 + 60 )

            const path = './puzzle/puzzle'+Math.floor( Math.random()*6 ).toString()+'.jpg'
            const img = gm( path )
            const crop = gm( path  )

            img.size(function (err, size) {

                if (err) return reject(err)

                const x = Math.floor( Math.random()*(size.width -  width))
                const y = Math.floor( Math.random()*(size.height - height))

                img.fill( (Math.random() < 0.5 ? '#000000' : '#FFFFFF' )+(120+Math.floor(Math.random()*30)).toString(16) )
                img.drawRectangle( x, y, x+width, y+height )

                crop.crop(width, height, x, y)
                    .sepia()

                crop.toBuffer('PNG', function (err, bufferCrop ){
                    if (err) return reject(err)

                    img.toBuffer('PNG', function(err, buffer){
                        if (err) return reject(err)
                        resolve({
                            display: buffer.toString('base64'),
                            piece: bufferCrop.toString('base64'),
                            width: size.width,
                            height: size.height,
                            pieceWidth: width,
                            pieceHeight: height,
                            secret: {
                                x, y
                            }
                        })
                    })


                })


            })


        })


    }
}