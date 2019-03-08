import PDFObject from "./PDFObject";
import PDFCmd from "./PDFCmd";

import constant from '../constant'
import config from 'config'
import helper from "../helper";

export default class PDFName extends PDFObject {

    constructor(config){
        super(config)
    }

    pipe(stream){
        let addr = stream.savePosition()
        let start = stream.position

        let nameCmd = new PDFCmd('/')
        if(!nameCmd.pipe(stream)){
            stream.restorePosition(addr)
            return null
        }

        let nameArr = []
        while(true){
            let ch = stream.getByte()
            if(ch === null || (constant.specialChars[ch] > 0) || (ch < 0x21 || ch > 0x7E)){
                if(nameArr.length > 0){
                    stream.cleanPosition(addr)
                    stream.rewindPosition()
                    this.filled = true
                    this.value = nameArr.join("")
                    return this.pos = {
                        start, length : (stream.position - start)
                    }
                }else{
                    stream.restorePosition(addr)
                    return null
                }
            }
            stream.rewindPosition()
            
            let ns = new PDFNumberSign()
            let nsResult = ns.pipe(stream)
            if(nsResult){
                nameArr.push(ns.value)
            }else{
                ch = stream.getByte()
                nameArr.push(String.fromCharCode(ch))
            }
        }
    }

    toJSON(){
        return this.value
    }

}

class PDFNumberSign extends PDFObject {

    constructor(config){
        super(config)
    }

    pipe(stream){
        let addr = stream.savePosition()
        let start = stream.position

        let nsStart = new PDFCmd('#')
        if(!nsStart.pipe(stream)){
            stream.restorePosition(addr)
            return null
        }

        let nsArr = []
        for(let i = 0 ; i < 2; i ++){
            let ch = stream.getByte()
            nsArr.push(ch)
        }

        stream.cleanPosition(addr)
        this.filled = true
        let hexStr = Buffer.from(nsArr).toString(config.get('pdf.encoding'))
        this.value = helper.hexToAscii(hexStr)
        return this.pos = {
            start, length : (stream.position - start)
        }
    }

}