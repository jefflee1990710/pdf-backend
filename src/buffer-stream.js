import config from 'config'
import uuidv4 from 'uuid/v4'
import {RestorePositionError} from './error'


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
    constructor(reader, startPosition = 0, length = -1){
        this.reader = reader
        this.position = startPosition
        if(length === -1){
            this.endPosition = this.reader.length - 1
        }else{
            this.endPosition = startPosition + length
        }
        this.startPosition = startPosition
        this.lastPosition = this.position
        this.savedPosition = {}
    }

    /**
     * Retrieve one byte
     */
    getByte(){
        if(!this.hasNext()){
            return null
        }
        this.lastPosition = this.position
        return this.reader.getByte(this.position ++)
    }

    skip(length = 0){
        if(!this.hasNext()){
            return null
        }
        this.lastPosition = this.position
        this.position += length
    }
    
    /**
     * Peek a byte forward and don't change the pointer position
     */
    peekByte(){
        if(!this.hasNext()){
            return null
        }
        return this.reader.getByte(this.position)
    }

    peekBytes(length){
        if(!this.hasNext()){
            return null
        }
        return this.reader.getBytes(this.position, length)
    }

    /**
     * Check if the pointer already at the end of the stream
     */
    hasNext(){
        return this.position <= this.endPosition
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
        let endPos = startPos + limit - 1
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
            if(peeked.toString(config.get('pdf.encoding')) === needle){
                return true
            }
            this.position += 1
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
        let endPos = Math.max(0, this.endPosition - (limit - 1))
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

    savePosition(){
        let addr = uuidv4()
        this.savedPosition[addr] = this.position
        return addr
    }

    restorePosition(addr){
        this.lastPosition = this.position
        if(!this.savedPosition[addr] && this.savedPosition[addr] != 0){
            throw new RestorePositionError("Position not found in address : " + addr)
        }
        this.position = this.savedPosition[addr]
        this.savedPosition[addr] = null
    }

    cleanSavedPosition(addr){
        this.savedPosition[addr] = null
        delete this.savedPosition[addr]
    }

    moveTo(offset){
        this.lastPosition = this.position
        this.position = offset
    }
}