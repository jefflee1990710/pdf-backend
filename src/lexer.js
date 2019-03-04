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
    PDFArray,
    PDFDictEntry,
    PDFDict,
    PDFStream,
    PDFLineBreak,
    PDFNull,
    PDFXRefTableSectionHeader,
    PDFXRefTableSectionEntry,
    PDFXRefTable,
    PDFIndirectObject,
    PDFObjectReference
} from './object'
import logger from './logger'

  // A '1' in this array means the character is white space. A '1' or
  // '2' means the character ends a name or command.
const specialChars = [
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, // 0x
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 1x
    1, 0, 0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 2, // 2x
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, // 3x
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 4x
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, // 5x
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 6x
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, // 7x
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 8x
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 9x
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // ax
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // bx
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // cx
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // dx
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // ex
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0  // fx
];

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

    nextChars(length){
        return this.stream.getBytes(length)
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
        
        let buff = [] 
        while(helper.isLineBreak(ch) || helper.isSpace(ch) || helper.isTab(ch)){
            buff.push(ch)
            ch = this.nextChar()
            if(!(helper.isLineBreak(ch) || helper.isSpace(ch) || helper.isTab(ch))){
                this.rewindPosition()
            }
        }
        this.cleanSavedPosition(addr)
        if(buff.length > 0){
            return new PDFSpace(buff.toString(config.get('pdf.encoding')))
        }
        return null
    }

    getLineBreak(prevCh){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()
        if(ch === 0x0D){
            ch = this.nextChar()
            if(ch === 0x0D){
                this.cleanSavedPosition(addr)
                return new PDFLineBreak()
            }else{
                this.cleanSavedPosition(addr)
                return new PDFLineBreak()
            }
        }else if(ch === 0x0A){
            this.cleanSavedPosition(addr)
            return new PDFLineBreak()
        }else{
            this.restorePosition(addr)
            return null
        }
    }

    getCmd(prevCh, cmd){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        if(this.getSpace(ch)){
            ch = this.nextChar()
        }

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

    getNull(prevCh){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        if(this.getSpace(ch)){
            ch = this.nextChar()
        }

        let found = this.getCmd(ch, "null")

        if(found){
            this.cleanSavedPosition(addr)
            return new PDFNull(null)
        }else{
            this.restorePosition(addr)
            return null
        }
    }

    getBoolean(prevCh){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()
        
        if(this.getSpace(ch)){
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
        
        if(this.getSpace(ch)){
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

        if(this.getSpace(ch)){
            ch = this.nextChar()
        }

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
                    let arr = [ch1, ch2]
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

        if(this.getSpace(ch)){
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

        if(this.getSpace(ch)){
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
    
            if(ch === null || (specialChars[ch] > 0) || (ch < 0x21 || ch > 0x7E)){
                if(nameArr.length > 0){
                    this.rewindPosition()
                    this.cleanSavedPosition(addr)
                    return new PDFName(nameArr.join(''))
                }else{
                    this.restorePosition(addr)
                    return null
                }
            }

            if(ch === 0x23){ // "#"
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

        if(this.getSpace(ch)){
            ch = this.nextChar()
        }

        let fnl = [this.getName, this.getObjectReference, this.getDict, this.getArray, this.getLiteralString, this.getHexadecimalString, this.getReal]
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

        if(this.getSpace(ch)){
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

            let endCmd = this.getCmd(ch, "]")
            if(endCmd){
                this.cleanSavedPosition(addr)
                return new PDFArray(result)
            }
 
            let foundElem = this.getArrayElement(ch)
            if(!foundElem){
                logger.warn("invalidate element found in the array")
            }else{
                result.push(foundElem)
            }
            ch = this.nextChar()
        }
    }

    getDictValue(prevCh){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        if(this.getSpace(ch)){
            ch = this.nextChar()
        }

        let fnl = [this.getName, this.getObjectReference, this.getDict, this.getArray, this.getLiteralString, this.getHexadecimalString, this.getReal]
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

    getDictEntry(prevCh){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        if(this.getSpace(ch)){
            ch = this.nextChar()
        }

        let name = this.getName(ch)
        if(!name){
            logger.warn("Entry name is not found")
            this.restorePosition(addr)
            return null
        }

        if(this.getSpace()){
            ch = this.nextChar()
        }

        let value = this.getDictValue(ch)
        if(!value){
            logger.warn("Entry value is not found")
            this.restorePosition(addr)
            return null
        }

        this.cleanSavedPosition(addr)
        return new PDFDictEntry({
            fieldname : name,
            value : value
        })
    }

    getDict(prevCh){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        if(this.getSpace(ch)){
            ch = this.nextChar()
        }

        let startCmd = this.getCmd(ch, "<<")
        if(!startCmd){
            this.restorePosition(addr)
            return null
        }

        let entries = []
        while(true){
            ch = this.nextChar()

            let endCmd = this.getCmd(ch, ">>")
            if(endCmd){
                this.cleanSavedPosition(addr)
                return new PDFDict(entries)
            }

            let entry = this.getDictEntry(ch)
            if(entry){
                entries.push(entry)
            }else{
                logger.warn("Invalid dict entry found!")
            }
        }
    }

    getStream(prevCh){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        if(this.getSpace(ch)){
            ch = this.nextChar()
        }

        let startCmd = this.getCmd(ch, "stream")
        if(!startCmd){
            this.restorePosition(addr)
            return null
        }else{
            ch = this.nextChar()
        }

        if(this.getSpace(ch)){
            ch = this.nextChar()
        }

        let streamBuf = []
        while(true){

            this.getLineBreak(ch)

            let endCmd = this.getCmd(ch, "endstream")
            if(endCmd){
                this.cleanSavedPosition(addr)
                return new PDFStream(Buffer.from(streamBuf)) 
            }

            if(ch === null){
                this.restorePosition(addr)
                return null
            }

            streamBuf.push(ch)
            ch = this.nextChar()
        }
    }

    getXRefSectionHeader(prevCh){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        if(this.getSpace(ch)){
            ch = this.nextChar()
        }

        let firstObjectNum = this.getReal(ch)
        if(!firstObjectNum){
            this.restorePosition(addr)
            return null
        }else{
            ch = this.nextChar()
        }

        if(this.getSpace(ch)){
            ch = this.nextChar()
        }

        let objectCnt = this.getReal(ch)
        if(!objectCnt){
            this.restorePosition(addr)
            return null
        }else{
            this.cleanSavedPosition(addr)
            return new PDFXRefTableSectionHeader({
                firstObjectNum : firstObjectNum.val, 
                objectCnt : objectCnt.val
            })
        }
    }

    getXRefSectionEntry(prevCh){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        if(this.getSpace(ch)){
            ch = this.nextChar()
        }

        let offset = null
        let offsetBytes = []
        for(let i = 0; i < 10; i ++){
            if(ch != null){
                offsetBytes.push(String.fromCharCode(ch))
            }else{
                this.restorePosition(addr)
                return null
            }
            ch = this.nextChar()
        }
        try{
            offset = parseInt(offsetBytes.join(''))
        }catch(e){
            logger.error(e)
            this.restorePosition(addr)
            return null
        }

        if(this.getSpace(ch)){
            ch = this.nextChar()
        }

        let generationNumber = null
        let generationBytes = []
        for(let i = 0; i < 5; i ++){
            if(ch != null){
                generationBytes.push(String.fromCharCode(ch))
            }else{
                this.restorePosition(addr)
                return null
            }
            ch = this.nextChar()
        }
        try{
            generationNumber = parseInt(generationBytes.join(''))
        }catch(e){
            logger.error(e)
            this.restorePosition(addr)
            return null
        }

        if(this.getSpace(ch)){
            ch = this.nextChar()
        }

        let flag = String.fromCharCode(ch)
        if(!(flag === 'f' || flag === 'n')){
            this.restorePosition(addr)
            return null
        }

        if(ch == null){
            this.restorePosition(addr)
            return null
        }

        return new PDFXRefTableSectionEntry({
            offset, generationNumber, flag
        })

    }

    getXRefTable(prevCh){
        const getNewSectionObj = (header) => {
            return {
                header : header,
                entries : []
            }
        }
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        if(this.getSpace(ch)){
            ch = this.nextChar()
        }

        let sections = []
        let curSectionPtr = -1
        while(true){
            
            let entry = this.getXRefSectionEntry(ch)
            if(entry){
                if(sections[curSectionPtr]){
                    sections[curSectionPtr].entries.push(entry)
                    ch = this.nextChar()
                }else{
                    this.restorePosition(addr)
                    return null
                }
                continue
            }

            let header = this.getXRefSectionHeader(ch)
            if(header){
                curSectionPtr ++
                sections[curSectionPtr] = getNewSectionObj(header)
                ch = this.nextChar()
                continue
            }

            if(curSectionPtr < 0){
                this.restorePosition(addr)
                return null
            }else{
                this.cleanSavedPosition(addr)
                return new PDFXRefTable({
                    sections
                })
            }
        }
    }

    getIndirectObject(prevCh){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        if(this.getSpace(ch)){
            ch = this.nextChar()
        }

        let objNum = this.getReal(ch)
        if(objNum){
            ch = this.nextChar()
        }else{
            this.restorePosition(addr)
            return null
        }

        let genNum = this.getReal(ch)
        if(genNum){
            ch = this.nextChar()
        }else{
            this.restorePosition(addr)
            return null
        }

        let objCmd = this.getCmd(ch, 'obj')
        if(objCmd){
            ch = this.nextChar()
        }else{
            this.restorePosition(addr)
            return null
        }

        let obj = {
            objectNumber : objNum,
            generationNumber : genNum,
            content : []
        }

        while(true){

            if(ch === null){
                this.restorePosition(addr)
                return null
            }
            
            let endCmd = this.getCmd(ch, "endobj")
            if(endCmd){
                this.cleanSavedPosition(addr)
                return new PDFIndirectObject(obj)
            }

            let fnl = [this.getStream, this.getDict]
            for(let f in fnl){
                let fn = fnl[f]
                let pdfobj = fn.apply(this, [ch])
                if(pdfobj){
                    obj.content.push(pdfobj)
                }
            }

            ch = this.nextChar()
        }
    }

    getObjectReference(prevCh){
        let addr = this.savePosition()
        let ch = prevCh || this.nextChar()

        if(this.getSpace(ch)){
            ch = this.nextChar()
        }

        let objNum = this.getReal(ch)
        if(objNum){
            ch = this.nextChar()
        }else{
            this.restorePosition(addr)
            return null
        }

        let genNum = this.getReal(ch)
        if(genNum){
            ch = this.nextChar()
        }else{
            this.restorePosition(addr)
            return null
        }

        let objCmd = this.getCmd(ch, 'R')
        if(objCmd){
            this.cleanSavedPosition(addr)
                return new PDFObjectReference({
                    objectNumber : objNum,
                    generationNumber : genNum
                })
        }else{
            this.restorePosition(addr)
            return null
        }

    }

}