import PDFObject from "./PDFObject";
import helper from '../helper'
import config from 'config'

export default class PDFOctal extends PDFObject {

    constructor(config){
        super(config)
    }

    pipe(stream){
        let addr = stream.savePosition()
        let start = stream.position

        let ch = stream.getByte()
        let buf = []
        if(ch === 0x5C){
            ch = stream.getByte() // 1
            if(helper.isNumber(ch)){
                buf.push(ch)
                ch = stream.getByte() // 2
                if(helper.isNumber(ch)){ 
                    buf.push(ch)
                    ch = stream.getByte()
                    if(helper.isNumber(ch)){
                        buf.push(ch)
                        buf = Buffer.from(buf)
                        let byte = parseInt(buf.toString(config.get('pdf.encoding')))
                        this.value = String.fromCharCode(parseInt(byte, 8))
                        stream.cleanPosition(addr)
                        this.filled = true
                        return this.pos = {
                            start, length : (stream.position - start)
                        }
                    }else{
                        stream.rewindPosition()
                        buf = Buffer.from(buf)
                        let byte = parseInt(buf.toString(config.get('pdf.encoding')))
                        this.value = String.fromCharCode(parseInt(byte, 8))
                        stream.cleanPosition(addr)
                        this.filled = true
                        return this.pos = {
                            start, length : (stream.position - start)
                        }
                    }
                }else{
                    stream.restorePosition(addr)
                    return null;
                }
            }else{
                stream.restorePosition(addr)
                return null;
            }
        }
    }

    toJSON(){
        return this.value
    }

}