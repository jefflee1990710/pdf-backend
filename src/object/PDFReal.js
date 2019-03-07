import PDFObject from './PDFObject'
import helper from '../helper'

export default class PDFReal extends PDFObject {

    constructor(config){
        super(config)
    }

    pipe(stream){
        let start = stream.position
        let addr = stream.savePosition()

        let ch = stream.getByte()
        let sign = 1
        if(ch === 0x2D){
            sign = -1
        }else if(ch === 0x2B){
            sign = 1
        }else{
            stream.rewindPosition()
        }

        let head = []
        let tail = []
        let scanningHead = true
        while(true){
            ch = stream.getByte()
            if(ch === 0x2E){ // .
                scanningHead = false
                continue
            }

            if(!helper.isNumber(ch) || ch === null){
                stream.rewindPosition()
                if(head.length > 0){
                    head = head.map(r => String.fromCharCode(r))
                    tail = tail.map(r => String.fromCharCode(r))
                    let baseVal = `${head.join('')}.${tail.length > 0 ? tail.join('') : '0'}`
                    
                    stream.cleanPosition(addr)
                    this.filled = true
                    this.value = sign * parseFloat(baseVal)
                    return this.pos = {
                        start, length : (stream.position - start)
                    }
                } else if(tail.length > 0){
                    head = head.map(r => String.fromCharCode(r))
                    tail = tail.map(r => String.fromCharCode(r))
                    let baseVal = `0.${tail.join('')}`
                    
                    stream.cleanPosition(addr)
                    this.filled = true
                    this.value = sign * parseFloat(baseVal)
                    return this.pos = {
                        start, length : (stream.position - start)
                    }
                }else{
                    stream.restorePosition(addr)
                    return null;
                }
            }else{
                if(scanningHead){
                    head.push(ch)
                }else{
                    tail.push(ch)
                }
            }

        }

    }
}