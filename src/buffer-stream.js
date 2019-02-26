import config from 'config'

/**
 * BufferStream hold a pointer start from -1 or given starting position.
 * Byte will be feed one by one to Lexer to construct PDF Object.
 */
export default class BufferStream {

    /**
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

    /**
     * Retrieve one byte
     */
    getByte(){
        if(!this.hasNext()){
            return null
        }
        return this.getBytes(1)[0]
    }

    /**
     * Retrieve a number of bytes
     * @param {number} length 
     */
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

    /**
     * Skip a number of bytes
     * @param {number} length 
     */
    skip(length){
        if(this.position + length > this.endPosition){
            throw new Error('Trying to skip larger then the file size.')
        }
        this.lastPosition = this.position
        this.position += length
    }

    /**
     * Shift the pointer back to a certain length
     * @param {number} length 
     */
    back(length){
        if(this.position - length < -1){
            throw new Error('Trying to back to before the start of file')
        }
        this.lastPosition = this.position
        this.position -= length
    }
    
    /**
     * Peek a byte forward and don't change the pointer position
     */
    peekByte(){
        return this.peekBytes(1)
    }

    /**
     * Peek a number of bytes forward and don't change the pointer position
     * @param {number} length 
     */
    peekBytes(length){
        if(this.position + length > this.endPosition){
            throw new Error('Trying to peekBytes() larger then the file size.')
        }
        this.lastPosition = this.position
        let r = this.reader.getBytes(this.position + 1, length)
        return r
    }

    /**
     * Check if the pointer already at the end of the stream
     */
    hasNext(){
        return this.position < this.endPosition
    }
    
    /**
     * Reset the position to starting position
     */
    reset(){
        this.lastPosition = this.position
        this.position = this.startPosition
    }

    /**
     * Find a keyword in the stream and stop at before the keyword offset.
     * @param {string} needle 
     * @param {number} limit 
     */
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

    /**
     * Find a keyword in stream backward and stop at that offset in a limited range
     * @param {string} needle 
     * @param {number} limit 
     */
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
                    // this.position ++
                    return true
                }
                this.position -= 1
            }catch(e){
                // Do nothing, normal behaviour for just start the search on backward.
                this.position -= 1
            }
        }
    }

    /**
     * Go back position one step before
     */
    rewindPosition(){
        this.position = this.lastPosition
    }
    
}