import PDFObject from "./PDFObject";

import PDFOr from "./condition/PDFOr";
import PDFReal from "./PDFReal";
import PDFCmd from "./PDFCmd";
import PDFSpace from "./PDFSpace";
import PDFLiteralString from "./string/PDFLiteralString";
import PDFHexadecimalString from "./string/PDFHexadecimalString";
import PDFNull from "./PDFNull";
import PDFBoolean from "./PDFBoolean"
import PDFName from "./PDFName"
import PDFDict from './PDFDict'
import PDFObjectReference from './PDFObjectReference'

export default class PDFArray extends PDFObject {

    constructor(config){
        super(config)
    }

    pipe(stream){
        let addr = stream.savePosition()
        let start = stream.position

        let arrayStart = new PDFCmd('[')
        if(!arrayStart.pipe(stream)){
            stream.restorePosition(addr)
            return null;
        }

        new PDFSpace(this.config).pipe(stream)

        let elemList = []
        while(true){
            new PDFSpace(this.config).pipe(stream)

            let arrayEnd = new PDFCmd(']')
            if(arrayEnd.pipe(stream)){
                stream.cleanPosition(addr)
                this.filled = true
                this.elements = elemList
                return this.pos = {
                    start, length : (stream.position - start)
                }
            }

            new PDFSpace(this.config).pipe(stream)

            let element = new PDFArrayElement(this.config)
            if(element.pipe(stream)){
                elemList.push(element.hit)
            }else{
                let ch = stream.getByte() // If nothing found, next one
                if(ch === null){
                    stream.restorePosition(addr)
                    return null;
                }
            }
        }
    }

}

class PDFArrayElement extends PDFOr {

    constructor(config){
        super(config)
    }

    in(){
        return [
            new PDFName(this.config),
            new PDFObjectReference(this.config),
            new PDFDict(this.config),
            new PDFArray(this.config),
            new PDFLiteralString(this.config),
            new PDFHexadecimalString(this.config),
            new PDFBoolean(this.config),
            new PDFNull(this.config),
            new PDFReal(this.config),
        ]
    }
}