import config from 'config'
import helper from "../src/helper";
import {
    PDFSpace,
    PDFBoolean,
    PDFReal,
    PDFCmd,
    PDFString,
    PDFLiteralString,
    PDFHexadecimalString,
    PDFName,
    PDFOctalBytes,
    PDFArray
} from './object'

export default class Lexer {

    constructor(bufferStream){
        this.stream = bufferStream
        this.objectMap = {
            "LiteralString" : this.getLiteralString,
            "HexadecimalString" :  this.getHexadecimalString,
            "Boolean" : this.getBoolean, 
            "Real" : this.getReal
        }
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

    rewindPosition(){
        this.stream.rewindPosition()
    }
    
    nextChar(){
        return this.stream.getByte()
    }

    peekChar(){
        return this.stream.peekByte();
    }

    getObj(prevCh, ...objectTypes){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        let fnl = []
        if(objectTypes.length === 0){
            fnl = Object.keys(this.objectMap).map((i) => this.objectMap[i])
        }else{
            for(let i in objectTypes){
                let type = objectTypes[i]
                fnl.push(this.objectMap[type])
            }
        }
        for(let i in fnl){
            let fn = fnl[i]
            let value = fn.apply(this, [ch])
            if(value) {
                this.cleanSavedPosition(addr)
                return value
            }
        }
        this.restorePosition(addr)
        return null
    }

    getSpace(prevCh){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()
        
        while(helper.isLineBreak(ch) || helper.isSpace(ch) || helper.isTab(ch)){
            ch = this.nextChar()
            if(!(helper.isLineBreak(ch) || helper.isSpace(ch) || helper.isTab(ch))){
                this.rewindPosition()
            }
        }
        this.cleanSavedPosition(addr)
        return new PDFSpace("")
    }

    getCmd(prevCh, cmd){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        this.getSpace(ch)

        let cmdBuf = Buffer.from(cmd, config.get("pdf.encoding"))
        let cnt = 0
        while(true){
            if(ch !== cmdBuf[cnt]){
                this.restorePosition(addr)
                return null
            }
            if(cnt >= cmdBuf.length - 1){
                this.cleanSavedPosition(addr)
                return new PDFCmd(cmd)
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
        
        while(helper.isLineBreak(ch) || helper.isSpace(ch) || helper.isTab(ch)){
            ch = this.nextChar()
        }

        let sign = 1
        if(ch === 0x2D){ // - sign
            sign = -1
            ch = this.nextChar()
        }else if(ch === 0x2B){ // + sign
            sign = 1
            ch = this.nextChar()
        }

        // If next comming byte is not number
        if(!helper.isNumber(ch) && ch !== 0x2E){ // Not number and "."
            this.restorePosition(addr)
            return null;
        }

        let head = []
        let tail = []
        let scanningHead = true
        while(true){
            if(ch === 0x2E){ // .
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

            if(!helper.isNumber(ch) || ch === null){
                if(ch != null){
                    this.rewindPosition()
                }
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

    getOctal(prevCh){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        if(ch === 0x5C){
            let ch1 = this.nextChar()
            let ch2 = this.nextChar()
            let ch3 = this.peekChar()
            if(helper.isNumber(ch1) && helper.isNumber(ch2)){
                if(helper.isNumber(ch3)){
                    ch3 = this.nextChar()
                    let arr = [ch1, ch2, ch3]
                    let buf = Buffer.from(arr)
                    let byte = parseInt(buf.toString(config.get('pdf.encoding')))
                    return new PDFOctalBytes(String.fromCharCode(parseInt(byte, 8)))
                }else{
                    let arr = [0x00, ch1, ch2]
                    let buf = Buffer.from(arr)
                    let byte = parseInt(buf.toString(config.get('pdf.encoding')))
                    return new PDFOctalBytes(String.fromCharCode(parseInt(byte, 8)))
                }
            }else{
                this.restorePosition(addr)
            return null
            }
        }else{
            this.restorePosition(addr)
            return null
        }
    }

    getStringObject(prevCh, startBy, closeBy){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        while(helper.isLineBreak(ch) || helper.isSpace(ch) || helper.isTab(ch)){
            ch = this.nextChar()
        }

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
                return new PDFString(stringBuffer.join(''))
            }else{
                if(ch === 0x28){ // (
                    parenCnt ++
                }else if(ch === 0x29){ // )
                    parenCnt --
                }
                // Check octla
                let octalCode = this.getOctal(ch)
                if(octalCode){
                    stringBuffer.push(octalCode.val)
                } else if(ch === 0x5C){ // Check escape
                    ch = this.nextChar()
                    switch(ch){
                        case 0x0A:
                            stringBuffer.concat('\\n')
                            break;
                        case 0x0D:
                            stringBuffer.concat('\\r')
                            if(this.peekChar() === 0x0A){
                                ch = this.nextChar()
                                stringBuffer.concat('\\n')
                            }
                            break;
                        case 0x09:
                            stringBuffer.concat('\\t')
                            break;
                        case 0x08:
                            stringBuffer.concat('\\b')
                            break;
                        case 0xFF:
                            stringBuffer.concat('\\f')
                            break;
                        case 0x28:
                            stringBuffer.concat('\\(')
                            break;
                        case 0x29:
                            stringBuffer.concat('\\)')
                            break;
                        case 0x5C:
                            stringBuffer.concat('\\')
                            break;
                        default:
                            console.warn('Not found', ch);
                            break
                            // Ignore if not in table 3 in page 13 of PDF32000_2008.pdf 
                    }
                }else{
                    stringBuffer.push(String.fromCharCode(ch))
                }
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

    getHexadecimalString(prevCh){
        let pdfObj = this.getStringObject(prevCh, "<", ">")
        if(pdfObj){
            let str;
            if(pdfObj.val.length % 2 != 0){
                str = pdfObj.val + "0"
            }else{
                str = pdfObj.val
            }
            return new PDFHexadecimalString(str)
        }else{
            return null
        }
    }

    getName(prevCh){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        while(helper.isLineBreak(ch) || helper.isSpace(ch) || helper.isTab(ch)){
            ch = this.nextChar()
        }

        let nameCmd = this.getCmd(ch, "/")
        if(!nameCmd){
            this.restorePosition(addr)
            return null
        }

        let nameArr = []
        while(true){
            ch = this.nextChar()
    
            if(ch === null){
                this.cleanSavedPosition(addr)
                return new PDFName(nameArr.join(''))
            }

            if(ch === 0x23){
                let hexArr = []
                ch = this.nextChar()
                hexArr.push(ch)
                ch = this.nextChar()
                hexArr.push(ch)
                let hexStr = Buffer.from(hexArr).toString(config.get('pdf.encoding'))
                nameArr.push(helper.hexToAscii(hexStr))
            }else{
                nameArr.push(String.fromCharCode(ch))
            }
        }

    }

    getArrayElement(prevCh){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        while(helper.isLineBreak(ch) || helper.isSpace(ch) || helper.isTab(ch)){
            ch = this.nextChar()
        }

        let fnl = [this.getReal]
        for(let i in fnl){
            let fn = fnl[i]
            let value = fn.apply(this, [ch])
            if(value) {
                this.cleanSavedPosition(addr)
                return value
            }
        }
        this.restorePosition(addr)
        return null
    }

    getArray(prevCh){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        while(helper.isLineBreak(ch) || helper.isSpace(ch) || helper.isTab(ch)){
            ch = this.nextChar()
        }

        let arrayCmd = this.getCmd(ch, "[")
        if(!arrayCmd){
            this.restorePosition(addr)
            return null
        }

        // Loop and file all element
        ch = this.nextChar()
        let result = []
        while(true){
            if(ch === null){
                this.restorePosition(addr)
                return null
            }
 
            console.log('before get array', this.stream.position, String.fromCharCode(ch))
            let foundElem = this.getArrayElement(ch)
            console.log('after get array', this.stream.position, String.fromCharCode(ch))
            if(!foundElem){
                console.warn("invalidate element found in the array")
            }else{
                result.push(foundElem)
            }
            ch = this.nextChar()

            let endCmd = this.getCmd(ch, "]")
            if(endCmd){
                this.cleanSavedPosition(addr)
                return new PDFArray(result)
            }
        }
    }

}