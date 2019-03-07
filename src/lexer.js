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
    PDFObjectReference,
    PDFTrailer
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
        this.savedCurrentChar = this.currentChar
        return this.stream.savePosition()
    }

    restorePosition(addr){
        this.lastChar = this.currentChar
        this.currentChar = this.savedCurrentChar
        this.stream.restorePosition(addr)
    }

    cleanSavedPosition(addr){
        this.stream.cleanSavedPosition(addr)
    }

    rewindPosition(){
        this.currentChar = this.lastChar
        this.stream.rewindPosition()
    }
    
    nextChar(){
        this.lastChar = this.currentChar
        return (this.currentChar = this.stream.getByte())
    }

    peekChar(){
        return this.stream.peekByte();
    }

    getObj(prevCh, ...objectTypes){
        let addr = this.savePosition()
        this.currentChar = prevCh || this.nextChar()

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
            let value = fn.apply(this, [this.currentChar])
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
        this.currentChar = prevCh || this.nextChar()
        
        let buff = [] 
        while(true){
            buff.push(this.currentChar)
            if(helper.isLineBreak(this.currentChar) || helper.isSpace(this.currentChar) || helper.isTab(this.currentChar)){
                this.nextChar()
            }else{
                this.rewindPosition()
                break;
            }
        }
        if(buff.length > 0){
            this.cleanSavedPosition(addr)
            return new PDFSpace(buff.toString(config.get('pdf.encoding')))
        }else{
            this.restorePosition(addr)
            return null
        }
    }

    getLineBreak(prevCh){
        let addr = this.savePosition()
        this.currentChar = prevCh || this.nextChar()
        if(this.currentChar === 0x0D){
            this.currentChar = this.nextChar()
            if(this.currentChar === 0x0D){
                this.cleanSavedPosition(addr)
                return new PDFLineBreak()
            }else{
                this.cleanSavedPosition(addr)
                return new PDFLineBreak()
            }
        }else if(this.currentChar === 0x0A){
            this.cleanSavedPosition(addr)
            return new PDFLineBreak()
        }else{
            this.restorePosition(addr)
            return null
        }
    }

    getCmd(prevCh, cmd){
        let addr = this.savePosition()
        this.currentChar = prevCh || this.nextChar()

        console.log("getcmd space start", this.stream.position, String.fromCharCode(this.currentChar))

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        console.log("getcmd space end", this.stream.position, String.fromCharCode(this.currentChar))


        let cmdBuf = Buffer.from(cmd, config.get("pdf.encoding"))
        let cnt = 0
        while(true){
            if(this.currentChar !== cmdBuf[cnt]){
                this.restorePosition(addr)
                return null
            }
            if(cnt >= cmdBuf.length - 1){
                this.cleanSavedPosition(addr)
                return new PDFCmd(cmd)
            }
            this.currentChar = this.nextChar()
            cnt ++
        }

    }

    getNull(prevCh){
        let addr = this.savePosition()
        this.currentChar = prevCh || this.nextChar()

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let found = this.getCmd(this.currentChar, "null")

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
        this.currentChar = prevCh || this.nextChar()
        
        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
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
            console.log('Find boolean at', this.stream.position, String.fromCharCode(this.currentChar))
            let found = this.getCmd(this.currentChar, choice.cmd)
            console.log("found", found)
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
        this.currentChar = prevCh || this.nextChar()
        
        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let sign = 1
        if(this.currentChar === 0x2D){ // - sign
            sign = -1
            this.currentChar = this.nextChar()
        }else if(this.currentChar === 0x2B){ // + sign
            sign = 1
            this.currentChar = this.nextChar()
        }

        // If next comming byte is not number
        if(!helper.isNumber(this.currentChar) && this.currentChar !== 0x2E){ // Not number and "."
            this.restorePosition(addr)
            return null;
        }

        let head = []
        let tail = []
        let scanningHead = true
        while(true){
            if(this.currentChar === 0x2E){ // .
                scanningHead = false
                this.currentChar = this.nextChar()
                continue
            }else if(helper.isNumber(this.currentChar)){
                if(scanningHead){
                    head.push(this.currentChar)
                }else{
                    tail.push(this.currentChar)
                }
            }

            if(!helper.isNumber(this.currentChar) || this.currentChar === null){
                if(this.currentChar != null){
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

            this.currentChar = this.nextChar()
        }
    }

    getOctal(prevCh){
        let addr = this.savePosition()
        this.currentChar = prevCh || this.nextChar()

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        if(this.currentChar === 0x5C){
            let ch1 = this.nextChar() // Should use this.currentChar, need to rewrite
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
        this.currentChar = prevCh || this.nextChar()

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let openingCmd = this.getCmd(this.currentChar, startBy)
        if(!openingCmd){
            this.restorePosition(addr)
            return null
        }
        
        let stringBuffer = []
        let parenCnt = 0;

        while(true){
            this.currentChar = this.nextChar()
            
            if(String.fromCharCode(this.currentChar) === closeBy && parenCnt === 0){
                this.cleanSavedPosition(addr)
                return new PDFString(stringBuffer.join(''))
            }else{
                if(this.currentChar === 0x28){ // (
                    parenCnt ++
                }else if(this.currentChar === 0x29){ // )
                    parenCnt --
                }
                // Check octla

                // let octalCode = this.getOctal(this.currentChar)
                // console.log('octalCode found', 'position', this.stream.position)
                // if(octalCode){
                //     stringBuffer.push(octalCode.val)
                // } else 
                if(this.currentChar === 0x5C){ // Check escape
                    this.currentChar = this.nextChar()
                    switch(this.currentChar){
                        case 0x0A:
                            stringBuffer.concat('\\n')
                            break;
                        case 0x0D:
                            stringBuffer.concat('\\r')
                            if(this.peekChar() === 0x0A){
                                this.currentChar = this.nextChar()
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
                            console.warn('Not found', this.currentChar);
                            break
                            // Ignore if not in table 3 in page 13 of PDF32000_2008.pdf 
                    }
                }else{
                    stringBuffer.push(String.fromCharCode(this.currentChar))
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
        this.currentChar = prevCh || this.nextChar()

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let nameCmd = this.getCmd(this.currentChar, "/")
        if(!nameCmd){
            this.restorePosition(addr)
            return null
        }

        let nameArr = []
        while(true){
            this.currentChar = this.nextChar()
    
            if(this.currentChar === null || (specialChars[this.currentChar] > 0) || (this.currentChar < 0x21 || this.currentChar > 0x7E)){
                if(nameArr.length > 0){
                    this.rewindPosition()
                    this.cleanSavedPosition(addr)
                    return new PDFName(nameArr.join(''))
                }else{
                    this.restorePosition(addr)
                    return null
                }
            }

            if(this.currentChar === 0x23){ // "#"
                let hexArr = []
                this.currentChar = this.nextChar()
                hexArr.push(this.currentChar)
                this.currentChar = this.nextChar()
                hexArr.push(this.currentChar)
                let hexStr = Buffer.from(hexArr).toString(config.get('pdf.encoding'))
                nameArr.push(helper.hexToAscii(hexStr))
            }else{
                nameArr.push(String.fromCharCode(this.currentChar))
            }
        }

    }

    getArrayElement(prevCh){
        let addr = this.savePosition()
        this.currentChar = prevCh || this.nextChar()

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let fnl = [this.getName, this.getObjectReference, this.getDict, this.getArray, this.getLiteralString, this.getHexadecimalString, this.getReal]
        for(let i in fnl){
            let fn = fnl[i]
            console.log('Trying ', fn.name, ' at ', this.stream.position, " char", String.fromCharCode(this.currentChar))
            let value = fn.apply(this, [this.currentChar])
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
        this.currentChar = prevCh || this.nextChar()

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let arrayCmd = this.getCmd(this.currentChar, "[")
        if(!arrayCmd){
            this.restorePosition(addr)
            return null
        }

        // Loop and file all element
        this.currentChar = this.nextChar()
        let result = []
        while(true){
            if(this.currentChar === null){
                this.restorePosition(addr)
                return null
            }

            let endCmd = this.getCmd(this.currentChar, "]")
            if(endCmd){
                this.cleanSavedPosition(addr)
                return new PDFArray(result)
            }
 
            let foundElem = this.getArrayElement(this.currentChar)
            if(!foundElem){
                logger.warn("invalidate element found in the array at position " + (this.stream.position - 1))
            }else{
                result.push(foundElem)
            }
            this.currentChar = this.nextChar()
        }
    }

    getDictValue(prevCh){
        let addr = this.savePosition()
        this.currentChar = prevCh || this.nextChar()

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let fnl = [this.getName, this.getObjectReference, this.getDict, this.getArray, this.getLiteralString, this.getHexadecimalString, this.getReal]
        for(let i in fnl){
            let fn = fnl[i]
            let value = fn.apply(this, [this.currentChar])
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
        this.currentChar = prevCh || this.nextChar()

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let name = this.getName(this.currentChar)
        console.log(name)
        if(!name){
            logger.warn("Entry name is not found at position ", this.stream.position)
            this.restorePosition(addr)
            return null
        }

        console.log('Finding dict value for ', name.val, ' at position ', this.stream.position)
        if(this.getSpace()){
            this.currentChar = this.nextChar()
        }

        console.log('Finding dict value for ', name.val, ' at position ', this.stream.position)
        let value = this.getDictValue(this.currentChar)
        if(!value){
            logger.warn("Entry value is not found at position ", this.stream.position)
            this.restorePosition(addr)
            return null
        }

        this.cleanSavedPosition(addr)
        return new PDFDictEntry(name, value)
    }

    getDict(prevCh){
        let addr = this.savePosition()
        this.currentChar = prevCh || this.nextChar()

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let startCmd = this.getCmd(this.currentChar, "<<")
        if(!startCmd){
            this.restorePosition(addr)
            return null
        }

        let entries = []
        while(true){
            this.currentChar = this.nextChar()

            let endCmd = this.getCmd(this.currentChar, ">>")
            if(endCmd){
                this.cleanSavedPosition(addr)
                let dict = new PDFDict()
                dict.loadWithEntries(entries)
                return dict
            }

            console.log(String.fromCharCode(this.currentChar))
            let entry = this.getDictEntry(this.currentChar)
            if(entry){
                entries.push(entry)
            }else{
                logger.warn("Invalid dict entry found!")
            }
        }
    }

    getStream(prevCh){
        let addr = this.savePosition()
        this.currentChar = prevCh || this.nextChar()

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let startCmd = this.getCmd(this.currentChar, "stream")
        if(!startCmd){
            this.restorePosition(addr)
            return null
        }else{
            this.currentChar = this.nextChar()
        }

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let streamBuf = []
        while(true){

            this.getLineBreak(this.currentChar)

            let endCmd = this.getCmd(this.currentChar, "endstream")
            if(endCmd){
                this.cleanSavedPosition(addr)
                return new PDFStream(Buffer.from(streamBuf)) 
            }

            if(this.currentChar === null){
                this.restorePosition(addr)
                return null
            }

            streamBuf.push(this.currentChar)
            this.currentChar = this.nextChar()
        }
    }

    getXRefSectionHeader(prevCh){
        let addr = this.savePosition()
        this.currentChar = prevCh || this.nextChar()

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let firstObjectNum = this.getReal(this.currentChar)
        if(!firstObjectNum){
            this.restorePosition(addr)
            return null
        }else{
            this.currentChar = this.nextChar()
        }

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let objectCnt = this.getReal(this.currentChar)
        if(!objectCnt){
            this.restorePosition(addr)
            return null
        }else{
            this.cleanSavedPosition(addr)
            return new PDFXRefTableSectionHeader(firstObjectNum.val, objectCnt.val)
        }
    }

    getXRefSectionEntry(prevCh){
        let addr = this.savePosition()
        this.currentChar = prevCh || this.nextChar()

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let offset = null
        let offsetBytes = []
        for(let i = 0; i < 10; i ++){
            if(this.currentChar != null){
                offsetBytes.push(String.fromCharCode(this.currentChar))
            }else{
                this.restorePosition(addr)
                return null
            }
            this.currentChar = this.nextChar()
        }
        try{
            offset = parseInt(offsetBytes.join(''))
        }catch(e){
            logger.error(e)
            this.restorePosition(addr)
            return null
        }

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let generationNumber = null
        let generationBytes = []
        for(let i = 0; i < 5; i ++){
            if(this.currentChar != null){
                generationBytes.push(String.fromCharCode(this.currentChar))
            }else{
                this.restorePosition(addr)
                return null
            }
            this.currentChar = this.nextChar()
        }
        try{
            generationNumber = parseInt(generationBytes.join(''))
        }catch(e){
            logger.error(e)
            this.restorePosition(addr)
            return null
        }

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let flag = String.fromCharCode(this.currentChar)
        if(!(flag === 'f' || flag === 'n')){
            this.restorePosition(addr)
            return null
        }

        if(this.currentChar == null){
            this.restorePosition(addr)
            return null
        }

        return new PDFXRefTableSectionEntry(offset, generationNumber, flag)

    }

    getIndirectObject(prevCh){
        let addr = this.savePosition()
        this.currentChar = prevCh || this.nextChar()

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let objNum = this.getReal(this.currentChar)
        if(objNum){
            this.currentChar = this.nextChar()
        }else{
            this.restorePosition(addr)
            return null
        }

        let genNum = this.getReal(this.currentChar)
        if(genNum){
            this.currentChar = this.nextChar()
        }else{
            this.restorePosition(addr)
            return null
        }

        let objCmd = this.getCmd(this.currentChar, 'obj')
        if(objCmd){
            this.currentChar = this.nextChar()
        }else{
            this.restorePosition(addr)
            return null
        }

        let content = []

        while(true){

            if(this.currentChar === null){
                this.restorePosition(addr)
                return null
            }
            
            let endCmd = this.getCmd(this.currentChar, "endobj")
            if(endCmd){
                this.cleanSavedPosition(addr)
                return new PDFIndirectObject(objNum, genNum, content)
            }

            let fnl = [this.getStream, this.getDict]
            for(let f in fnl){
                let fn = fnl[f]
                let pdfobj = fn.apply(this, [this.currentChar])
                if(pdfobj){
                    content.push(pdfobj)
                }
            }

            this.currentChar = this.nextChar()
        }
    }

    getObjectReference(prevCh){
        let addr = this.savePosition()
        this.currentChar = prevCh || this.nextChar()

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let objNum = this.getReal(this.currentChar)
        if(objNum){
            this.currentChar = this.nextChar()
        }else{
            this.restorePosition(addr)
            return null
        }

        let genNum = this.getReal(this.currentChar)
        if(genNum){
            this.currentChar = this.nextChar()
        }else{
            this.restorePosition(addr)
            return null
        }

        let objCmd = this.getCmd(this.currentChar, 'R')
        if(objCmd){
            this.cleanSavedPosition(addr)
                return new PDFObjectReference(objNum, genNum)
        }else{
            this.restorePosition(addr)
            return null
        }

    }
    
    getXRefTable(prevCh){
        const getNewSectionObj = (header) => {
            return {
                header : header,
                entries : []
            }
        }
        let addr = this.savePosition()
        this.currentChar = prevCh || this.nextChar()

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let startCmd = this.getCmd(this.currentChar, "xref")
        if(startCmd){
            this.currentChar = this.nextChar()
        }else{
            this.restorePosition(addr)
            return null
        }

        let sections = []
        let curSectionPtr = -1
        while(true){
            
            let entry = this.getXRefSectionEntry(this.currentChar)
            if(entry){
                if(sections[curSectionPtr]){
                    sections[curSectionPtr].entries.push(entry)
                    this.currentChar = this.nextChar()
                }else{
                    this.restorePosition(addr)
                    return null
                }
                continue
            }

            let header = this.getXRefSectionHeader(this.currentChar)
            if(header){
                curSectionPtr ++
                sections[curSectionPtr] = getNewSectionObj(header)
                this.currentChar = this.nextChar()
                continue
            }

            if(curSectionPtr < 0){
                this.restorePosition(addr)
                return null
            }else{
                this.cleanSavedPosition(addr)
                return new PDFXRefTable(sections)
            }
        }
    }

    getTrailer(prevCh){
        let addr = this.savePosition()
        this.currentChar = prevCh || this.nextChar()

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let startCmd = this.getCmd(this.currentChar, "trailer")
        if(startCmd){
            this.currentChar = this.nextChar()
        }else{
            this.restorePosition(addr)
            return null
        }

        if(this.getSpace(this.currentChar)){
            this.currentChar = this.nextChar()
        }

        let trailerDict = this.getDict(this.currentChar)
        if(trailerDict){
            this.cleanSavedPosition(addr)
            return new PDFTrailer(trailerDict)
        }else{
            this.restorePosition(addr)
            return null
        }

    }

}