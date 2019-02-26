import fs from 'fs'

import BufferStream from './buffer-stream'

export class Reader {

}

export class FileReader extends Reader{

    constructor(path){
        super()

        this.fd = fs.openSync(path, 'r')
    }

    get length(){
        let stat = fs.fstatSync(this.fd)
        return stat.size
    }

    getByte(offset){
        let buffer = Buffer.alloc(1)
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

    getStream(offset = 0){
        return new BufferStream(this, offset)
    }

}

export class ByteArrayReader extends Reader{

    constructor(byteArray){
        super()
        
        this.byteArray = byteArray
    }
}