import helper from "../src/helper";
import config from 'config'

export default class Lexer {

    constructor(bufferStream){
        this.stream = bufferStream
    }

    savePosition(){
        this.stream.savePosition()
    }

    restorePosition(){
        this.stream.restorePosition()
    }
    
    nextChar(){
        return (this.currentChar = this.stream.getByte());
    }

    peekChar(){
        return this.stream.peekByte();
    }

    getInteger(){
        this.savePosition()
        let ch = this.currentChar | this.nextChar()

        let sign = 1
        
        while(helper.isLineBreak(ch) || helper.isSpace(ch) || helper.isTab(ch)){
            ch = this.nextChar()
        }

        if(ch === 0x2D){ // - sign
            sign = -1
            ch = this.nextChar()
        }else if(ch === 0x2B){ // + sign
            sign = 1
            ch = this.nextChar()
        }
        sign = sign | 1

        let baseValArr = []
        while(true){
            if(helper.isNumber(ch)){
                baseValArr.push(ch)
            }else{
                break
            }
            ch = this.nextChar()
            if(ch === null){
                break
            }
        }

        if(baseValArr.length === 0){
            this.restorePosition()
            return null;
        }

        let baseVal = Buffer.from(baseValArr, config.get('pdf.encoding'))
        return sign * parseInt(baseVal)
    }

}