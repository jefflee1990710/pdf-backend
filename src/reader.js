import fs from 'fs'

import BufferStream from './buffer-stream'

export class FileReader {

    constructor(path){
        this.fd = fs.openSync(path, 'r')
    }

    get fileSize(){
        let stat = fs.fstatSync(fd)
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

    getStream(offset, length){
        let buffer = this.getBytes(offset, length)
        return new BufferStream(buffer)
    }

}

export class ByteArrayReader {

    constructor(byteArray){
        this.byteArray = byteArray
    }
}