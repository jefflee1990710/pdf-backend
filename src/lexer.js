import config from 'config'
import helper from "../src/helper";
import {
    PDFBoolean,
    PDFReal,
    PDFCmd,
    PDFString,
    PDFLiteralString
} from './object'

export default class Lexer {

    constructor(bufferStream){
        this.stream = bufferStream
    }

    savePosition(){
        return this.stream.savePosition()
    }

    restorePosition(addr){
        this.stream.restorePosition(addr)
    }

    cleanSavedPosition(addr){
        this.stream.cleanSavedPosition(addr)
    }
    
    nextChar(){
        return this.stream.getByte()
    }

    peekChar(){
        return this.stream.peekByte();
    }

    getObj(){
        let fnl = [this.getBoolean, this.getReal]
        for(let i in fnl){
            let fn = fnl[i]
            let value = fn.apply(this)
            if(value) {
                return value
            }
        }
        return null
    }

    getCmd(prevCh, cmd){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        let cmdBuf = Buffer.from(cmd, config.get("pdf.encoding"))
        let cnt = 0
        while(true){
            if(cnt >= cmdBuf.length - 1){
                this.cleanSavedPosition(addr)
                return new PDFCmd(cmd)
            }
            if(ch !== cmdBuf[cnt]){
                this.restorePosition(addr)
                return null
            }
            ch = this.nextChar()
            cnt ++
        }

    }

    getBoolean(prevCh){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()
        while(helper.isLineBreak(ch) || helper.isSpace(ch) || helper.isTab(ch)){
            ch = this.nextChar()
        }

        let choices = [{
            cmd : 'true',
            value : new PDFBoolean(true)
        }, {
            cmd : 'false',
            value : new PDFBoolean(false)
        }]
        
        for(let c in choices){
            let choice = choices[c]
            let found = this.getCmd(ch, choice.cmd)
            if(found){
                this.cleanSavedPosition(addr)
                return choice.value
            }
        }

        this.restorePosition(addr)
        return null;
    }

    getReal(prevCh){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

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

        // If next comming byte is not number
        if(!helper.isNumber(ch) && ch !== 0x2E){ // Not number and "."
            this.restorePosition(addr)
            return null;
        }

        let head = []
        let tail = []
        let scanningHead = true
        while(true){
            if(ch === 0x2E){
                scanningHead = false
                ch = this.nextChar()
                continue
            }else if(helper.isNumber(ch)){
                if(scanningHead){
                    head.push(ch)
                }else{
                    tail.push(ch)
                }
            }

            if(!helper.isNumber(ch)){
                if(head.length > 0){
                    head = head.map(r => String.fromCharCode(r))
                    tail = tail.map(r => String.fromCharCode(r))
                    let baseVal = `${head.join('')}.${tail.length > 0 ? tail.join('') : '0'}`
                    this.cleanSavedPosition(addr)
                    return new PDFReal(sign * parseFloat(baseVal));
                } else if(tail.length > 0){
                    head = head.map(r => String.fromCharCode(r))
                    tail = tail.map(r => String.fromCharCode(r))
                    let baseVal = `0.${tail.join('')}`
                    this.cleanSavedPosition(addr)
                    return new PDFReal(sign * parseFloat(baseVal));
                }
            }

            ch = this.nextChar()
        }
    }

    getStringObject(prevCh, startBy, closeBy){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        let openingCmd = this.getCmd(ch, startBy)
        if(!openingCmd){
            this.restorePosition(addr)
            return null
        }
        
        let stringBuffer = []
        let parenCnt = 0;

        while(true){
            ch = this.nextChar()
            if(String.fromCharCode(ch) === closeBy && parenCnt === 0){
                this.cleanSavedPosition(addr)
                let str = Buffer.from(stringBuffer)
                return new PDFString(str.toString(config.get('pdf.encoding')))
            }else{
                if(ch === 0x28){ // (
                    parenCnt ++
                }else if(ch === 0x29){ // )
                    parenCnt --
                }
                stringBuffer.push(ch)
            }
        }
    }

    getLiteralString(prevCh){
        let pdfObj = this.getStringObject(prevCh, "(", ")")
        if(pdfObj){
            return new PDFLiteralString(pdfObj.val)
        }else{
            return null
        }
    }
}