import PDFObject from "./PDFObject";

import PDFOr from "./condition/PDFOr";
import PDFReal from "./PDFReal";
import PDFCmd from "./PDFCmd";
import PDFSpace from "./PDFSpace";
import PDFLiteralString from "./string/PDFLiteralString";
import PDFHexadecimalString from "./string/PDFHexadecimalString";
import PDFBoolean from "./PDFBoolean";
import PDFName from "./PDFName";
import PDFObjectReference from './PDFObjectReference';
import PDFArray from './PDFArray';
import PDFNull from "./PDFNull";
import { InvalidPDFFormatError } from "../error";


export default class PDFDict extends PDFObject {

    constructor(config){
        super(config);
        this.content = {};
    }

    set(fieldname, obj){
        this.content[fieldname] = obj;
    }

    get(fieldname){
        return this.content[fieldname] ? this.content[fieldname].hit : null;
    }

    get fields(){
        return Object.keys(this.content);
    }

    pipe(stream){
        let addr = stream.savePosition();
        let start = stream.position;

        if(!new PDFCmd("<<").pipe(stream)){
            stream.restorePosition(addr);
            return null;
        }

        new PDFSpace().pipe(stream);
        
        let entries = [];
        while(true){
        
            if(new PDFCmd(">>").pipe(stream)){
                stream.cleanPosition(addr);
                this.filled = true;
                for(let i in entries){
                    let entry = entries[i];
                    this.content[entry.fieldname.value] = entry.value;
                }
                return this.pos = {
                    start, length : (stream.position - start)
                };
            }

            let entry = new PDFDictEntry();
            let entryResult = entry.pipe(stream);
            if(entryResult){
                entries.push(entry);
            }else{
                let byte = stream.peekByte();
                console.warn("Dictionary entry is broken, next character can't parse - " + String.fromCharCode(byte));
            }

            new PDFSpace().pipe(stream);
        }

    }

    toJSON(){
        let json = {};
        for(let i in Object.keys(this.content)){
            let fieldname = Object.keys(this.content)[i];
            json[fieldname] = this.content[fieldname].toJSON();
        }
        return json;
    }

}

class PDFDictEntry extends PDFObject {

    constructor(config){
        super(config);
    }

    pipe(stream){
        let addr = stream.savePosition();
        let start = stream.position;

        let fieldname = new PDFName();
        let result = fieldname.pipe(stream);
        if(result){

            new PDFSpace().pipe(stream);

            let valueObj = new PDFDictValue();
            let valueResult = valueObj.pipe(stream);
            if(valueResult){
                stream.cleanPosition(addr);
                this.filled = true;
                this.fieldname = fieldname;
                this.value = valueObj;
                return this.pos = {
                    start, length : (stream.position - start)
                };
            }else{
                let byte = stream.peekByte();
                throw new InvalidPDFFormatError("Dictionary entry is broken, next character can't parse - " + String.fromCharCode(byte));
            }

        }else{
            stream.restorePosition(addr);
            return null;
        }
    }
}

class PDFDictValue extends PDFOr {

    constructor(config){
        super(config);
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
        ];
    }
}