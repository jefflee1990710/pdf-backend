import helper from "../src/helper";
import config from 'config'
import {
    PDFBoolean,
    PDFInteger
} from './object'

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

    getObj(){
        let fnl = [this.getBoolean, this.getInteger]
        for(let i in fnl){
            let fn = fnl[i]
            let value = fn.apply(this)
            if(value) {
                return value
            }
        }
        return null
    }

    getBoolean(){
        this.savePosition()
        let ch = this.currentChar | this.nextChar()

        while(helper.isLineBreak(ch) || helper.isSpace(ch) || helper.isTab(ch)){
            ch = this.nextChar()
        }

        let choices = [{
            keyword : 'true'.split(''),
            value : new PDFBoolean(true),
            fit : true
        }, {
            keyword : 'false'.split(''),
            value : new PDFBoolean(false),
            fit : true
        }]
        let limit = Math.max(...choices.map(r => r.keyword.length))
        let cnt = 0
        while(true){
            for(let i in choices){
                if(choices[i].keyword[cnt] != String.fromCharCode(ch) && cnt < choices[i].keyword.length){
                    choices[i].fit = false
                }
            }
            cnt ++;
            ch = this.nextChar()
            if(cnt > limit){
                for(let i in choices){
                    if(choices[i].fit){
                        return choices[i].value
                    }
                }
                break;
            }
        }
        
        this.restorePosition()
        return null;
    }

    /**
     * Read until next byte is not number
     */
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
        return new PDFInteger(sign * parseInt(baseVal))
    }

    getReal(){
        this.savePosition()
        let ch = this.currentChar | this.nextChar()


        this.restorePosition()
        return null;
    }

}