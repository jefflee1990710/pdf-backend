import config from 'config'

import {Reader} from './reader'

export class BufferStream {

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
        return this.peekBytes(1)
    }

    peekBytes(length){
        if(this.position + length > this.endPosition){
            throw new Error('Trying to peekBytes() larger then the file size.')
        }
        let r = this.reader.getBytes(this.position + 1, length)
        return r
    }

    hasNext(){
        return this.position < this.endPosition
    }
    
    reset(){
        this.position = this.startPosition
    }

    find(needle, limit){
        let oldPos = this.position
        let startPos = this.position + 1;
        let endPos = startPos + limit
        if(endPos > this.endPosition){
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
        let oldPos = this.position
        // Set the pos to the end first
        this.position = this.endPosition
        let endPos = Math.max(0, this.endPosition - limit)
        // Search backward
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
    
    subStream(offset, limit){

    }
}