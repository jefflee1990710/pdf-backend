
export class BufferStream {

    constructor(buffer){
        this.buffer = buffer
        this.position = 0
        this.endPosition = this.buffer.length - 1
        this.startPosition = 0
    }

    getByte(){
        return this.buffer[this.position++]
    }

    getBytes(length){
        if(this.position + length > this.endPosition + 1) {
            return null
        }
        let r = this.buffer.slice(this.position, this.position + length)
        this.position = this.position + length
        return r
    }
    
    peekByte(){

    }

    peekBytes(){

    }

    hasNext(){

    }
    
    reset(){

    }
}