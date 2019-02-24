
export class BufferStream {

    constructor(reader, startPosition = -1, length = -1){
        this.reader = reader
        this.position = startPosition
        if(length === -1){
            this.endPosition = this.reader.length - 1
        }else{
            this.endPosition = startPosition + length
        }
        this.startPosition = startPosition
    }

    getByte(){
        return this.getBytes(1)
    }

    getBytes(length){
        if(this.position + length > this.endPosition){
            throw new Error('Trying to getBytes() larger then the file size.')
        }
        let r = this.reader.getBytes(this.position + 1, length)
        this.position = this.position + length
        return r
    }

    skip(length){
        if(this.position + length > this.endPosition){
            throw new Error('Trying to getBytes() larger then the file size.')
        }
        this.position += length
    }
    
    peekByte(){
        // return Buffer.from([this.buffer[this.position + 1]])
    }

    peekBytes(length){
        // return Buffer.from(this.buffer.slice(this.position + 1, this.position + length + 1))
    }

    hasNext(){
        return this.position < this.endPosition
    }
    
    reset(){
        this.position = this.startPosition
    }

    find(needle, limit, backwards){
        
    }
}