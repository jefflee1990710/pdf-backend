export default class Lexer {

    constructor(bufferStream){
        this.bufferStream = bufferStream
    }

    nextChar(){
        return (this.currentChar = this.bufferStream.getByte())
    }

    peekChar(){
        return this.bufferStream.peekByte()
    }

}