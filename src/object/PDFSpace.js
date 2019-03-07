import PDFObject from './PDFObject'
import helper from '../helper'

export default class PDFSpace extends PDFObject{

    constructor(config){
        super(config)
    }

    pipe(stream){
        let start = stream.position
        let addr = stream.savePosition()

        let buff = [] 
        while(true){
            let ch = stream.getByte()
            if(helper.isLineBreak(ch) || helper.isSpace(ch) || helper.isTab(ch)){
                buff.push(ch)
            }else{
                stream.rewindPosition()
                break;
            }
        }
        if(buff.length > 0){
            stream.cleanPosition(addr)
            this.filled = true
            return this.pos = {
                start, length : (stream.position - start)
            }
        }else{
            stream.restorePosition(addr)
            return null;
        }

    }

}