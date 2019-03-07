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
import PDFObjectReference from './PDFObjectReference'
import PDFArray from './PDFArray'

export default class PDFDict extends PDFObject {

    constructor(config){
        super(config)
    }

    pipe(stream){
        let addr = stream.savePosition()
        let start = stream.position

        if(!new PDFCmd("<<").pipe(stream)){
            stream.restorePosition(addr)
            return null;
        }

        new PDFSpace().pipe(stream)
        
        let entries = []
        while(true){
        
            if(new PDFCmd(">>").pipe(stream)){
                stream.cleanPosition(addr)
                this.filled = true
                this.content = {}
                for(let i in entries){
                    let entry = entries[i]
                    this.content[entry.fieldname.value] = entry.value
                }
                return this.pos = {
                    start, length : (stream.position - start)
                }
            }

            let entry = new PDFDictEntry()
            let entryResult = entry.pipe(stream)
            if(entryResult){
                entries.push(entry)
            }else{
                console.warn("Error when finding entry at", stream.position)
            }

            new PDFSpace().pipe(stream)
        }

    }

}

class PDFDictEntry extends PDFObject {

    constructor(config){
        super(config)
    }

    pipe(stream){
        let addr = stream.savePosition()
        let start = stream.position

        let fieldname = new PDFName()
        if(fieldname.pipe(stream)){

            new PDFSpace().pipe(stream)

            let valueObj = new PDFDictValue()
            if(valueObj.pipe(stream)){
                stream.cleanPosition(addr)
                this.filled = true
                this.fieldname = fieldname
                this.value = valueObj
                return this.pos = {
                    start, length : (stream.position - start)
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

class PDFDictValue extends PDFOr {

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