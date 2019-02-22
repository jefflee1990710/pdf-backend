
export class BufferStream {

    constructor(buffer, startPosition = -1){
        this.buffer = buffer
        this.position = startPosition
        this.endPosition = this.buffer.length - 1
        this.startPosition = startPosition
    }

    nextByte(){
        return this.nextBytes(1)
    }

    nextBytes(length){
        if(this.position + length > this.endPosition){
            return null
        }
        let r = this.buffer.slice(this.position + 1, this.position + 1 + length)
        this.position = this.position + length
        return r
    }

    skip(length){
        if(this.position + length > this.endPosition + 1){
            this.position = this.endPosition + 1
        }else{
            this.position += length
        }
    }
    
    peekByte(){
        return Buffer.from([this.buffer[this.position + 1]])
    }

    peekBytes(length){
        return Buffer.from(this.buffer.slice(this.position + 1, this.position + length + 1))
    }

    hasNext(){
        return this.position < this.endPosition
    }
    
    reset(){
        this.position = this.startPosition
    }
}