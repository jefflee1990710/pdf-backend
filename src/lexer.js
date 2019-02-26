export default class Lexer {

    constructor(bufferStream){
        this.bufferStream = bufferStream
    }

    nextChar(){
        try{
            return (this.currentChar = this.bufferStream.getByte())
        }catch(err){
            return null
        }
    }

    peekChar(){
        return this.bufferStream.peekByte()
    }

    getNumber(){
        // to be implement
    }

    getString(){
        // to be implement
    }

    getName(){
        // to be implement
    }

    getHexString(){
        // to be implement
    }

    getObj(){
        // to be implement
    }

    skipToNextLine(){
        // to be implement
    }

}