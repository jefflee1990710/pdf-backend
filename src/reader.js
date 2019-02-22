import fs from 'fs'

export class FileOffsetReader {

    constructor(path){
        this.fd = fs.openSync(path, 'r')
    }

    getByte(offset){
        let buffer =  Buffer.alloc(1)
        let cnt = fs.readSync(this.fd, buffer, 0, buffer.length, offset)
        if(cnt === 0){
            return null
        }
        return buffer
    }

    getBytes(offset, length){
        let buffer =  Buffer.alloc(length)
        fs.readSync(this.fd, buffer, 0, buffer.length, offset)
        return buffer
    }

    getStream(offset, length){

    }

}

export class ByteArrayReader {

    constructor(byteArray){
        this.byteArray = byteArray
    }
}