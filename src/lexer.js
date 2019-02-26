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

}