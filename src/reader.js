import fs from 'fs'

import BufferStream from './buffer-stream'
/**
 * Provide implementation on how to retrieve data from source
 */
export class FileReader {

    constructor(path){
        this.fd = fs.openSync(path, 'r')
    }

    get length(){
        let stat = fs.fstatSync(this.fd)
        return stat.size
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

    getStream(offset){
        return new BufferStream(offset)
    }

}

export class ByteArrayReader {

    constructor(byteArray){
        this.byteArray = byteArray
    }
}