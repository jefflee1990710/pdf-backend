import config from 'config'

export default class BufferStream {

    /**
     * 
     * @param {Reader} reader 
     * @param {number} startPosition 
     * @param {number} length 
     */
    constructor(reader, startPosition = -1, length = -1){
        this.reader = reader
        this.position = startPosition
        if(length === -1){
            this.endPosition = this.reader.length - 1
        }else{
            this.endPosition = startPosition + length
        }
        this.startPosition = startPosition
        this.lastPosition = this.position
    }

    getByte(){
        if(!this.hasNext()){
            return null
        }
        return this.getBytes(1)[0]
    }

    getBytes(length){
        if(!this.hasNext()){
            return null
        }
        if(this.position + length > this.endPosition){
            throw new Error('Trying to getBytes larger then the file size.')
        }
        this.lastPosition = this.position
        let r = this.reader.getBytes(this.position + 1, length)
        this.position = this.position + length
        return r
    }

    skip(length){
        if(this.position + length > this.endPosition){
            throw new Error('Trying to skip larger then the file size.')
        }
        this.lastPosition = this.position
        this.position += length
    }

    back(length){
        if(this.position - length < -1){
            throw new Error('Trying to back to before the start of file')
        }
        this.lastPosition = this.position
        this.position -= length
    }
    
    peekByte(){
        return this.peekBytes(1)
    }

    peekBytes(length){
        if(this.position + length > this.endPosition){
            throw new Error('Trying to peekBytes() larger then the file size.')
        }
        this.lastPosition = this.position
        let r = this.reader.getBytes(this.position + 1, length)
        return r
    }

    hasNext(){
        return this.position < this.endPosition
    }
    
    reset(){
        this.lastPosition = this.position
        this.position = this.startPosition
    }

    find(needle, limit){
        this.lastPosition = this.position
        let oldPos = this.position
        let startPos = this.position + 1;
        let endPos = startPos + limit
        if(endPos > this.endPosition){
            endPos = this.endPosition
        }
        if(limit === -1){
            endPos = this.endPosition
        }
        while(true){
            if(this.position >= endPos){
                this.position = oldPos
                return false
            }
            let peeked = this.peekBytes(needle.length)
            this.position += 1
            if(peeked.toString(config.get('pdf.encoding')) === needle){
                return true
            }
        }
    }

    findBackward(needle, limit){
        this.lastPosition = this.position
        let oldPos = this.position
        // Set the pos to the end first
        this.position = this.endPosition
        let endPos = Math.max(0, this.endPosition - limit)
        // Search backward
        if(limit === -1){
            endPos = 0
        }
        while(true){
            try{
                if(this.position <= endPos){
                    this.position = oldPos
                    return false
                }
                let peeked = this.peekBytes(needle.length)
                if(peeked.toString(config.get('pdf.encoding')) === needle){
                    this.position ++
                    return true
                }
                this.position -= 1
            }catch(e){
                // Do nothing, normal behaviour for just start the search on backward.
                this.position -= 1
            }
        }
    }

    rewindPosition(){
        this.position = this.lastPosition
    }
    
}